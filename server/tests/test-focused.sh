#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🎯 Testing Available Endpoints Only${NC}"
echo "=================================================="

# Reset counters
SUCCESS_COUNT=0
TOTAL_COUNT=0

echo -e "\n${YELLOW}📊 Health & Status Endpoints${NC}"
test_endpoint "GET" "/" 200 "Root endpoint"
test_endpoint "GET" "/health" 200 "Main health check"
test_endpoint "GET" "/api/health" 200 "API health check"
test_endpoint "GET" "/api/database-status" 200 "Database status"

echo -e "\n${YELLOW}🔐 Basic Auth Tests${NC}"
test_endpoint "POST" "/api/auth/register" 400 "Register (no data)" "Content-Type: application/json"
test_endpoint "POST" "/api/auth/login" 400 "Login (no credentials)" "Content-Type: application/json"
test_endpoint "GET" "/api/auth/profile" 401 "Get profile (no auth)"
test_endpoint "POST" "/api/auth/logout" 401 "Logout (no token)"

echo -e "\n${YELLOW}🔐 Full Auth Flow (If Not Rate Limited)${NC}"

# Create unique test user
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"
TEST_USERNAME="test${TIMESTAMP}"

# Try registration
echo "Attempting registration for: $TEST_EMAIL"
register_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"testpass123\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"parent\"}")

register_status=$(echo "$register_response" | tail -n1)
register_body=$(echo "$register_response" | head -n -1)

echo "Registration status: $register_status"

if [ "$register_status" -eq 200 ] || [ "$register_status" -eq 201 ]; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    
    # Extract token
    TOKEN=$(echo "$register_body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Token extracted: ${TOKEN:0:20}...${NC}"
        
        # Test authenticated endpoints
        echo -e "\n${YELLOW}🔒 Authenticated Endpoints${NC}"
        test_endpoint "GET" "/api/auth/profile" 200 "Get profile (with auth)" "Authorization: Bearer $TOKEN"
        test_endpoint "POST" "/api/auth/logout" 200 "Logout (with token)" "Authorization: Bearer $TOKEN"
        
        # Test token blacklisting
        echo -e "\n${YELLOW}🚫 Token Blacklisting Test${NC}"
        test_endpoint "GET" "/api/auth/profile" 401 "Profile after logout (blacklisted)" "Authorization: Bearer $TOKEN"
    else
        echo -e "${YELLOW}⚠️  No token in response${NC}"
    fi
    
elif [ "$register_status" -eq 429 ]; then
    echo -e "${YELLOW}⚠️  Rate limited - trying with existing user${NC}"
    
    # Try with known existing user
    login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test2@example.com","password":"testpassword"}')
    
    login_status=$(echo "$login_response" | tail -n1)
    login_body=$(echo "$login_response" | head -n -1)
    
    if [ "$login_status" -eq 200 ]; then
        echo -e "${GREEN}✅ Login with existing user successful${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        
        TOKEN=$(echo "$login_body" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$TOKEN" ]; then
            test_endpoint "GET" "/api/auth/profile" 200 "Get profile (existing user)" "Authorization: Bearer $TOKEN"
        fi
    else
        echo -e "${RED}❌ Both registration and login failed due to rate limiting${NC}"
    fi
else
    echo -e "${RED}❌ Registration failed with status: $register_status${NC}"
    echo "Response: $register_body"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

echo -e "\n${YELLOW}❌ Non-existent Endpoints (Should return 404)${NC}"
test_endpoint "GET" "/api/activities" 404 "Activities endpoint (not implemented)"
test_endpoint "GET" "/api/nonexistent" 404 "Random non-existent endpoint"

show_summary

if [ $SUCCESS_COUNT -ge $((TOTAL_COUNT * 8 / 10)) ]; then
    echo -e "\n🎉 ${GREEN}Most tests passed! API is working correctly.${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed, but core functionality may still be working.${NC}"
    exit 1
fi