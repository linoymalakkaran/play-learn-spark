#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🔍 Testing Database & Performance${NC}"
echo "=================================================="

# Test database connection
echo -e "\n${YELLOW}🗄️ Database Connection${NC}"
db_response=$(curl -s "$BASE_URL/api/database-status")
echo "Database status response: $db_response"

if echo "$db_response" | grep -q '"status":"connected"'; then
    echo -e "${GREEN}✅ MongoDB connection verified${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ MongoDB connection issue${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test performance with multiple concurrent requests
echo -e "\n${YELLOW}⚡ Performance Testing${NC}"
echo "Testing concurrent requests to health endpoint..."

start_time=$(date +%s%3N)
for i in {1..10}; do
    curl -s "$BASE_URL/health" > /dev/null &
done
wait
end_time=$(date +%s%3N)

duration=$((end_time - start_time))
echo "10 concurrent requests completed in ${duration}ms"

if [ $duration -lt 5000 ]; then  # Less than 5 seconds
    echo -e "${GREEN}✅ Good performance (${duration}ms)${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${YELLOW}⚠️  Slow performance (${duration}ms)${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test memory usage endpoint (from health check)
echo -e "\n${YELLOW}💾 Memory Usage${NC}"
health_response=$(curl -s "$BASE_URL/health")
if echo "$health_response" | grep -q '"memory"'; then
    echo -e "${GREEN}✅ Memory usage information available${NC}"
    memory_info=$(echo "$health_response" | grep -o '"memory":{[^}]*}')
    echo "Memory info: $memory_info"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Memory usage information not available${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test server uptime
echo -e "\n${YELLOW}⏱️ Server Uptime${NC}"
if echo "$health_response" | grep -q '"uptime"'; then
    uptime=$(echo "$health_response" | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Server uptime: ${uptime}s${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Uptime information not available${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test upload directories status
echo -e "\n${YELLOW}📁 Upload Directories${NC}"
if echo "$health_response" | grep -q '"uploadDirs"'; then
    echo -e "${GREEN}✅ Upload directories information available${NC}"
    upload_dirs=$(echo "$health_response" | grep -A 20 '"uploadDirs"')
    echo "Upload directories status included in health check"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Upload directories information not available${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test environment information
echo -e "\n${YELLOW}🌍 Environment Information${NC}"
if echo "$health_response" | grep -q '"environment"'; then
    environment=$(echo "$health_response" | grep -o '"environment":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    echo -e "${GREEN}✅ Environment: ${environment}${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Environment information not available${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test CORS origins configuration
echo -e "\n${YELLOW}🌐 CORS Configuration${NC}"
if [ -n "$TOKEN" ]; then
    # Test CORS with a valid origin
    cors_test=$(curl -s -H "Origin: http://localhost:5173" -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/auth/profile" -I)
    
    if echo "$cors_test" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ CORS configured for authenticated requests${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${YELLOW}⚠️  CORS headers not found in authenticated response${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping CORS auth test (no token available)${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test JSON parsing limits
echo -e "\n${YELLOW}📦 JSON Parsing Limits${NC}"
small_json='{"test":"small"}'
large_json=$(python3 -c "import json; print(json.dumps({'test': 'x' * 1000000}))")  # 1MB JSON

# Test small JSON (should work)
small_response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$small_json")

if [ "${small_response: -3}" -eq 400 ]; then  # Should fail validation, not parsing
    echo -e "${GREEN}✅ Small JSON parsed correctly (validation error as expected)${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${RED}❌ Small JSON parsing issue${NC}"
fi

# Test large JSON (should be rejected if limits are configured)
large_response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$large_json" 2>/dev/null)

if [ "${large_response: -3}" -eq 413 ] || [ "${large_response: -3}" -eq 400 ]; then
    echo -e "${GREEN}✅ Large JSON properly limited${NC}"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "${YELLOW}⚠️  Large JSON handling: ${large_response: -3}${NC}"
fi

TOTAL_COUNT=$((TOTAL_COUNT + 2))

# Test graceful error handling
echo -e "\n${YELLOW}🚨 Error Handling${NC}"
# Test internal server error simulation (invalid endpoint)
test_endpoint "GET" "/api/auth/nonexistent" 404 "Graceful 404 handling"

show_summary

if [ $SUCCESS_COUNT -ge $((TOTAL_COUNT * 8 / 10)) ]; then
    echo -e "\n🎉 ${GREEN}Database and performance tests mostly passed!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some database/performance tests failed.${NC}"
    exit 1
fi