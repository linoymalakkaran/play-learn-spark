#!/bin/bash

BASE_URL="http://localhost:3002"
SUCCESS_COUNT=0
TOTAL_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Testing Play Learn Spark Backend API Endpoints"
echo "=================================================="

test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local headers=$5
    local data=$6
    
    TOTAL_COUNT=$((TOTAL_COUNT + 1))
    
    echo -n "Testing $description... "
    
    if [ -n "$headers" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "$headers" -d "$data")
    elif [ -n "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "$headers")
    elif [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($status_code)"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        if [ ${#response_body} -lt 200 ]; then
            echo "   Response: $response_body"
        fi
    fi
}

# Test Health Endpoints
echo -e "\n${YELLOW}📊 Health Endpoints${NC}"
test_endpoint "GET" "/health" 200 "Main health check"
test_endpoint "GET" "/api/ai/health" 200 "AI service health check"

# Test Auth Endpoints  
echo -e "\n${YELLOW}🔐 Authentication Endpoints${NC}"
test_endpoint "POST" "/api/auth/register" 400 "Register (no data)" "Content-Type: application/json"
test_endpoint "POST" "/api/auth/login" 400 "Login (no credentials)" "Content-Type: application/json"
test_endpoint "POST" "/api/auth/logout" 401 "Logout (no token)"

# Test Activities Endpoints
echo -e "\n${YELLOW}🎯 Activities Endpoints${NC}"
test_endpoint "GET" "/api/activities" 200 "Get all activities"
test_endpoint "GET" "/api/activities/types" 200 "Get activity types"
test_endpoint "GET" "/api/activities/categories" 200 "Get categories"

# Test Analytics Endpoints
echo -e "\n${YELLOW}📈 Analytics Endpoints${NC}"
test_endpoint "GET" "/api/analytics/overview" 401 "Analytics overview (no auth)"

# Test Content Management Endpoints
echo -e "\n${YELLOW}📝 Content Management Endpoints${NC}"
test_endpoint "GET" "/api/content" 200 "Get content list"
test_endpoint "POST" "/api/content/generate" 401 "Generate content (no auth)"

# Test File Upload Endpoints
echo -e "\n${YELLOW}📁 File Upload Endpoints${NC}"
test_endpoint "GET" "/api/files/uploads" 200 "List uploads"
test_endpoint "POST" "/api/files/upload" 401 "Upload file (no auth)"

# Test AI Endpoints
echo -e "\n${YELLOW}🤖 AI Endpoints${NC}"
test_endpoint "POST" "/api/ai/generate-content" 401 "Generate AI content (no auth)"
test_endpoint "POST" "/api/ai/analyze-performance" 401 "Analyze performance (no auth)"

# Test Feedback Endpoints (Previously failing)
echo -e "\n${YELLOW}💬 Feedback Endpoints${NC}"
test_endpoint "GET" "/api/feedback/public" 200 "Get public feedback"
test_endpoint "GET" "/api/feedback/stats" 200 "Get feedback stats"
test_endpoint "POST" "/api/feedback" 400 "Create feedback (no data)" "Content-Type: application/json"

# Test Rewards Endpoints (Previously failing)
echo -e "\n${YELLOW}🏆 Rewards Endpoints${NC}"
test_endpoint "GET" "/api/rewards/achievements" 401 "Get achievements (no auth)"

# Summary
echo -e "\n${YELLOW}📊 Test Summary${NC}"
echo "=================================================="
PASS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_COUNT))
echo -e "Total Tests: $TOTAL_COUNT"
echo -e "Passed: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "Failed: ${RED}$((TOTAL_COUNT - SUCCESS_COUNT))${NC}"
echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo -e "\n🎉 ${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed. Check the output above for details.${NC}"
    exit 1
fi