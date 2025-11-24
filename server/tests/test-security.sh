#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🛡️ Testing Security & Edge Cases${NC}"
echo "=================================================="

# Test security headers
echo -e "\n${YELLOW}🛡️ Security Headers${NC}"
headers_response=$(curl -s -I "$BASE_URL/health")
echo "Checking security headers in response..."

if echo "$headers_response" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}✅ Content-Security-Policy header present${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Content-Security-Policy header missing${NC}"
fi

if echo "$headers_response" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options header present${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ X-Frame-Options header missing${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 2))

# Test CORS
echo -e "\n${YELLOW}🌐 CORS Testing${NC}"
cors_response=$(curl -s -H "Origin: http://localhost:5173" -I "$BASE_URL/health")

if echo "$cors_response" | grep -q "Access-Control-Allow"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test rate limiting (auth endpoints)
echo -e "\n${YELLOW}⚡ Rate Limiting${NC}"
echo "Testing rate limiting on auth endpoints..."

# Make multiple rapid requests to trigger rate limiting
for i in {1..6}; do
    response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"nonexistent@test.com","password":"wrong"}')
    
    if [ "${response: -3}" -eq 429 ]; then
        echo -e "${GREEN}✅ Rate limiting triggered after $i requests${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        break
    fi
    
    if [ $i -eq 6 ]; then
        echo -e "${YELLOW}⚠️  Rate limiting not triggered after 6 requests${NC}"
    fi
    
    sleep 0.1
done

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test large payload handling
echo -e "\n${YELLOW}📦 Large Payload Handling${NC}"
large_data=$(python3 -c "print('a' * 50000)")  # 50KB of data
test_endpoint "POST" "/api/auth/register" 400 "Large payload handling" "Content-Type: application/json" "{\"email\":\"test@test.com\",\"password\":\"$large_data\"}"

# Test malformed JSON
echo -e "\n${YELLOW}🔧 Malformed JSON Handling${NC}"
test_endpoint "POST" "/api/auth/register" 400 "Malformed JSON" "Content-Type: application/json" '{"email":"test@test.com","password"}'

# Test SQL injection attempts (should be harmless with NoSQL)
echo -e "\n${YELLOW}💉 Injection Attack Prevention${NC}"
test_endpoint "POST" "/api/auth/login" 400 "SQL injection attempt" "Content-Type: application/json" '{"email":"admin@test.com'\'' OR 1=1 --","password":"anything"}'

# Test XSS attempts
echo -e "\n${YELLOW}🎭 XSS Prevention${NC}"
test_endpoint "POST" "/api/auth/register" 400 "XSS attempt in email" "Content-Type: application/json" '{"email":"<script>alert(1)</script>@test.com","password":"test123"}'

# Test extremely long URLs
echo -e "\n${YELLOW}🔗 Long URL Handling${NC}"
long_path=$(python3 -c "print('a' * 2000)")
test_endpoint "GET" "/api/$long_path" 404 "Extremely long URL"

# Test various HTTP methods on auth endpoints
echo -e "\n${YELLOW}🔄 HTTP Methods Testing${NC}"
test_endpoint "PUT" "/api/auth/login" 404 "PUT on login endpoint"
test_endpoint "DELETE" "/api/auth/login" 404 "DELETE on login endpoint"
test_endpoint "PATCH" "/api/auth/login" 404 "PATCH on login endpoint"

# Test case sensitivity
echo -e "\n${YELLOW}🔤 Case Sensitivity${NC}"
test_endpoint "GET" "/API/HEALTH" 404 "Uppercase API path"
test_endpoint "GET" "/api/HEALTH" 404 "Uppercase endpoint"

# Test trailing slashes
echo -e "\n${YELLOW}/ Trailing Slash Handling${NC}"
test_endpoint "GET" "/api/health/" 404 "Health endpoint with trailing slash"
test_endpoint "GET" "/health/" 404 "Health with trailing slash"

# Test double slashes
echo -e "\n${YELLOW}// Double Slash Handling${NC}"
test_endpoint "GET" "/api//health" 404 "Double slash in path"
test_endpoint "GET" "//api/health" 404 "Leading double slash"

# Test Unicode and special characters
echo -e "\n${YELLOW}🌍 Unicode & Special Characters${NC}"
test_endpoint "GET" "/api/tëst" 404 "Unicode characters in path"
test_endpoint "GET" "/api/test%20space" 404 "URL encoded space"
test_endpoint "GET" "/api/test?param=value" 404 "Query parameters on 404 endpoint"

# Test content type variations
echo -e "\n${YELLOW}📄 Content Type Variations${NC}"
test_endpoint "POST" "/api/auth/login" 400 "No Content-Type header" "" '{"email":"test","password":"test"}'
test_endpoint "POST" "/api/auth/login" 400 "Wrong Content-Type" "Content-Type: text/plain" '{"email":"test","password":"test"}'

show_summary

if [ $SUCCESS_COUNT -ge $((TOTAL_COUNT * 7 / 10)) ]; then
    echo -e "\n🎉 ${GREEN}Security and edge case tests mostly passed!${NC}"
    echo -e "${BLUE}ℹ️  This indicates good security practices are implemented.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some security tests failed. Review security configuration.${NC}"
    exit 1
fi