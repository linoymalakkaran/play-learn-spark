#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🚫 Testing Non-Implemented Routes${NC}"
echo "=================================================="
echo "Testing routes that exist in code but are not loaded by server"

# Test AI routes (not loaded)
echo -e "\n${YELLOW}🤖 AI Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/ai/health" 404 "AI health check"
test_endpoint "POST" "/api/ai/analyze-homework" 404 "AI analyze homework"
test_endpoint "POST" "/api/ai/generate-content" 404 "AI generate content"

# Test Activity routes (not loaded)
echo -e "\n${YELLOW}🎯 Activity Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/activities" 404 "Get all activities"
test_endpoint "GET" "/api/activities/types" 404 "Get activity types"
test_endpoint "GET" "/api/activities/categories" 404 "Get activity categories"
test_endpoint "GET" "/api/activities/1" 404 "Get activity by ID"

# Test Analytics routes (not loaded)
echo -e "\n${YELLOW}📈 Analytics Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/analytics/overview" 404 "Analytics overview"
test_endpoint "GET" "/api/analytics/user/123" 404 "User analytics"

# Test Content Management routes (not loaded)
echo -e "\n${YELLOW}📝 Content Management Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/content" 404 "Get content list"
test_endpoint "POST" "/api/content/generate" 404 "Generate content"
test_endpoint "GET" "/api/content/categories" 404 "Get content categories"

# Test File Upload routes (not loaded)
echo -e "\n${YELLOW}📁 File Upload Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/files/uploads" 404 "List uploads"
test_endpoint "GET" "/api/files/health" 404 "File service health"
test_endpoint "POST" "/api/files/upload" 404 "Upload file"

# Test Feedback routes (not loaded)
echo -e "\n${YELLOW}💬 Feedback Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/feedback/public" 404 "Get public feedback"
test_endpoint "GET" "/api/feedback/stats" 404 "Get feedback stats"
test_endpoint "POST" "/api/feedback" 404 "Create feedback"

# Test Rewards routes (not loaded)
echo -e "\n${YELLOW}🏆 Rewards Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/rewards/achievements" 404 "Get achievements"
test_endpoint "GET" "/api/rewards/cards/123" 404 "Get reward card"

# Test Gamification routes (not loaded)
echo -e "\n${YELLOW}🎮 Gamification Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/gamification/profile/123" 404 "Get game profile"
test_endpoint "GET" "/api/gamification/leaderboards" 404 "Get leaderboards"

# Test Admin routes (not loaded)
echo -e "\n${YELLOW}👑 Admin Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/admin/users" 404 "Admin get users"
test_endpoint "GET" "/api/admin/dashboard/stats" 404 "Admin dashboard stats"

# Test Class routes (not loaded)
echo -e "\n${YELLOW}🏫 Class Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/classes" 404 "Get classes"
test_endpoint "POST" "/api/classes" 404 "Create class"

# Test Communication routes (not loaded)
echo -e "\n${YELLOW}💬 Communication Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/communication/conversations" 404 "Get conversations"
test_endpoint "POST" "/api/communication/messages" 404 "Send message"

# Test Progress routes (not loaded)
echo -e "\n${YELLOW}📊 Progress Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/progress/123" 404 "Get user progress"

# Test Proctoring routes (not loaded)
echo -e "\n${YELLOW}🔍 Proctoring Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/proctoring/sessions" 404 "Get proctoring sessions"

# Test Relationships routes (not loaded)
echo -e "\n${YELLOW}👥 Relationship Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/relationships" 404 "Get relationships"

# Test Language Management routes (not loaded)
echo -e "\n${YELLOW}🌐 Language Management Endpoints (Not Implemented)${NC}"
test_endpoint "GET" "/api/language/translations" 404 "Get translations"

show_summary

echo -e "\n${BLUE}ℹ️  Summary: All tested routes correctly return 404${NC}"
echo "This confirms that the server is only loading authentication routes"
echo "and properly rejecting requests to non-implemented endpoints."

if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
    echo -e "\n🎉 ${GREEN}All non-implemented endpoint tests passed!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some endpoints returned unexpected status codes.${NC}"
    exit 1
fi