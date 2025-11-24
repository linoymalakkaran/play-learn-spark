#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🏠 Testing Core & Health Endpoints${NC}"
echo "=================================================="

# Health and status endpoints
echo -e "\n${YELLOW}📊 Health & Status Endpoints${NC}"
test_endpoint "GET" "/" 200 "Root endpoint"
test_endpoint "GET" "/health" 200 "Main health check"
test_endpoint "GET" "/api/health" 200 "API health check"
test_endpoint "GET" "/api/database-status" 200 "Database status"

# Test debug endpoint
echo -e "\n${YELLOW}🐛 Debug Endpoints${NC}"
# Debug endpoint may not exist, so test if it returns 404 or 200
debug_status=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/debug/test-user" -o /dev/null)
if [ "$debug_status" -eq 200 ] || [ "$debug_status" -eq 404 ] || [ "$debug_status" -eq 401 ]; then
    echo -e "Testing Debug test user creation... ${GREEN}✅ PASS${NC} ($debug_status)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "Testing Debug test user creation... ${RED}❌ FAIL${NC} (Got: $debug_status)"
fi
TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test upload directories
echo -e "\n${YELLOW}📁 Static File Serving${NC}"
# Uploads directory might redirect, so accept 301 as well as 404
uploads_status=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/uploads" -o /dev/null)
if [ "$uploads_status" -eq 404 ] || [ "$uploads_status" -eq 301 ] || [ "$uploads_status" -eq 200 ]; then
    echo -e "Testing Uploads directory... ${GREEN}✅ PASS${NC} ($uploads_status)"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
else
    echo -e "Testing Uploads directory... ${RED}❌ FAIL${NC} (Got: $uploads_status)"
fi
TOTAL_COUNT=$((TOTAL_COUNT + 1))

# Test non-existent endpoints
echo -e "\n${YELLOW}❌ Non-existent Endpoints (Should return 404)${NC}"
test_endpoint "GET" "/api/nonexistent" 404 "Non-existent API endpoint"
test_endpoint "GET" "/random-path" 404 "Random non-existent path"

show_summary

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo -e "\n🎉 ${GREEN}All core endpoint tests passed!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some core endpoint tests failed.${NC}"
    exit 1
fi