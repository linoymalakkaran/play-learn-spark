#!/bin/bash

# Play Learn Spark Backend API Test Script
# Comprehensive testing for all backend endpoints

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3002"
API_URL="$BASE_URL/api"

# Global variables for tokens and user data
ACCESS_TOKEN=""
REFRESH_TOKEN=""
USER_ID=""
GUEST_USER_ID=""
ACTIVITY_ID=""
REWARD_ID=""

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to print colored output
print_section() {
    echo -e "\n${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}\n"
}

print_test() {
    echo -e "${BLUE}🧪 Testing:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ SUCCESS:${NC} $1"
    ((PASSED_TESTS++))
}

print_failure() {
    echo -e "${RED}❌ FAILED:${NC} $1"
    ((FAILED_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
}

print_info() {
    echo -e "${PURPLE}ℹ️  INFO:${NC} $1"
}

# Function to make HTTP requests with error handling
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local expected_status=${5:-200}
    
    ((TOTAL_TESTS++))
    
    local full_url="$API_URL$endpoint"
    local curl_cmd="curl -s -w '%{http_code}' -X $method"
    
    # Add headers if provided
    if [[ -n "$headers" ]]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    # Add data if provided
    if [[ -n "$data" ]]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    curl_cmd="$curl_cmd '$full_url'"
    
    # Execute the request
    local response=$(eval $curl_cmd)
    local http_code="${response: -3}"
    local body="${response%???}"
    
    # Check if the status code matches expected
    if [[ "$http_code" == "$expected_status" ]]; then
        print_success "$method $endpoint - Status: $http_code"
        echo "$body"
        return 0
    else
        print_failure "$method $endpoint - Expected: $expected_status, Got: $http_code"
        echo "Response: $body"
        return 1
    fi
}

# Function to make authenticated requests
make_auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    
    local auth_header="-H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json'"
    make_request "$method" "$endpoint" "$data" "$auth_header" "$expected_status"
}

# Function to extract value from JSON response
extract_json_value() {
    local json=$1
    local key=$2
    echo "$json" | grep -o "\"$key\":\"[^\"]*\"" | cut -d'"' -f4
}

# Function to extract nested value from JSON response
extract_nested_json_value() {
    local json=$1
    local path=$2
    # Simple extraction for nested values like data.user.id
    echo "$json" | grep -o "\"id\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

# Test server health and basic connectivity
test_health_endpoints() {
    print_section "TESTING HEALTH ENDPOINTS"
    
    print_test "Basic server health check"
    make_request "GET" "/health" "" "" "200"
    
    print_test "API health check"
    make_request "GET" "/api/health" "" "" "200"
    
    print_test "Root endpoint"
    response=$(curl -s "$BASE_URL/")
    if [[ $? -eq 0 ]]; then
        print_success "Root endpoint accessible"
        echo "$response" | head -5
    else
        print_failure "Root endpoint not accessible"
    fi
}

# Test authentication endpoints
test_authentication() {
    print_section "TESTING AUTHENTICATION ENDPOINTS"
    
    # Test user registration
    print_test "User registration"
    local reg_data='{
        "email": "testuser@example.com",
        "password": "TestPass123",
        "username": "testuser123",
        "firstName": "Test",
        "lastName": "User",
        "role": "parent",
        "grade": "5",
        "language": "en"
    }'
    
    local reg_response=$(make_request "POST" "/auth/register" "$reg_data" "-H 'Content-Type: application/json'" "201")
    if [[ $? -eq 0 ]]; then
        ACCESS_TOKEN=$(echo "$reg_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        REFRESH_TOKEN=$(echo "$reg_response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        USER_ID=$(echo "$reg_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_info "Extracted ACCESS_TOKEN: ${ACCESS_TOKEN:0:20}..."
        print_info "Extracted USER_ID: $USER_ID"
    fi
    
    # Test user login
    print_test "User login"
    local login_data='{
        "email": "testuser@example.com",
        "password": "TestPass123"
    }'
    
    local login_response=$(make_request "POST" "/auth/login" "$login_data" "-H 'Content-Type: application/json'" "200")
    if [[ $? -eq 0 ]]; then
        # Update tokens from login response
        ACCESS_TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
        REFRESH_TOKEN=$(echo "$login_response" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
        print_info "Updated ACCESS_TOKEN from login: ${ACCESS_TOKEN:0:20}..."
    fi
    
    # Test guest login
    print_test "Guest login"
    local guest_data='{
        "name": "Guest User",
        "grade": "3"
    }'
    
    local guest_response=$(make_request "POST" "/auth/guest-login" "$guest_data" "-H 'Content-Type: application/json'" "200")
    if [[ $? -eq 0 ]]; then
        GUEST_USER_ID=$(echo "$guest_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        print_info "Guest USER_ID: $GUEST_USER_ID"
    fi
    
    # Test profile access (requires authentication)
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "Get user profile"
        make_auth_request "GET" "/auth/profile" "" "200"
        
        print_test "Update user profile"
        local update_data='{"firstName": "Updated", "lastName": "Name"}'
        make_auth_request "PUT" "/auth/profile" "$update_data" "200"
    else
        print_warning "Skipping authenticated tests - no access token"
    fi
    
    # Test token refresh
    if [[ -n "$REFRESH_TOKEN" ]]; then
        print_test "Token refresh"
        local refresh_data="{\"refreshToken\": \"$REFRESH_TOKEN\"}"
        make_request "POST" "/auth/refresh-token" "$refresh_data" "-H 'Content-Type: application/json'" "200"
    fi
}

# Test activity endpoints
test_activities() {
    print_section "TESTING ACTIVITY ENDPOINTS"
    
    # Test public endpoints (no auth required)
    print_test "Get all activities (public)"
    local activities_response=$(make_request "GET" "/activities" "" "" "200")
    
    print_test "Get activity by ID (public)"
    make_request "GET" "/activities/sample-1" "" "" "200"
    
    # Test authenticated endpoints
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "Create new activity"
        local activity_data='{
            "title": "Test Activity",
            "description": "A test activity for API validation",
            "content": "This is test content",
            "difficulty": "easy",
            "category": "english",
            "points": 50
        }'
        
        local create_response=$(make_auth_request "POST" "/activities" "$activity_data" "201")
        if [[ $? -eq 0 ]]; then
            ACTIVITY_ID=$(echo "$create_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
            print_info "Created ACTIVITY_ID: $ACTIVITY_ID"
        fi
        
        # Test activity completion
        if [[ -n "$ACTIVITY_ID" ]]; then
            print_test "Complete activity"
            make_auth_request "POST" "/activities/$ACTIVITY_ID/complete" "" "200"
        fi
        
        print_test "Get user progress"
        make_auth_request "GET" "/activities/user/progress" "" "200"
        
        print_test "Reset user progress"
        make_auth_request "POST" "/activities/user/reset-progress" "" "200"
    else
        print_warning "Skipping authenticated activity tests - no access token"
    fi
}

# Test reward system endpoints
test_rewards() {
    print_section "TESTING REWARD SYSTEM ENDPOINTS"
    
    if [[ -n "$ACCESS_TOKEN" && -n "$USER_ID" ]]; then
        print_test "Initialize reward card"
        make_auth_request "POST" "/rewards/cards/$USER_ID/initialize" "" "200"
        
        print_test "Get reward card"
        make_auth_request "GET" "/rewards/cards/$USER_ID" "" "200"
        
        print_test "Award activity completion"
        local completion_data='{
            "activityId": "test-activity-123",
            "points": 50,
            "activityTitle": "Test Activity"
        }'
        make_auth_request "POST" "/rewards/cards/$USER_ID/award-completion" "$completion_data" "200"
        
        print_test "Get available rewards"
        make_auth_request "GET" "/rewards/items/$USER_ID/available" "" "200"
        
        print_test "Get achievements"
        make_auth_request "GET" "/rewards/achievements" "" "200"
        
        print_test "Get user achievements"
        make_auth_request "GET" "/rewards/achievements/$USER_ID/earned" "" "200"
        
        print_test "Request reward redemption"
        local redemption_data='{
            "rewardId": "test-reward-1",
            "pointsCost": 100
        }'
        make_auth_request "POST" "/rewards/redemptions/$USER_ID/request" "$redemption_data" "200"
        
        print_test "Get pending reward requests"
        make_auth_request "GET" "/rewards/redemptions/$USER_ID/pending" "" "200"
        
        print_test "Get redemption history"
        make_auth_request "GET" "/rewards/redemptions/$USER_ID/history" "" "200"
    else
        print_warning "Skipping reward tests - no access token or user ID"
    fi
}

# Test analytics endpoints
test_analytics() {
    print_section "TESTING ANALYTICS ENDPOINTS"
    
    if [[ -n "$ACCESS_TOKEN" && -n "$USER_ID" ]]; then
        print_test "Get progress analytics"
        make_auth_request "GET" "/analytics/progress/$USER_ID" "" "200"
        
        print_test "Get learning trends"
        make_auth_request "GET" "/analytics/trends/$USER_ID" "" "200"
        
        print_test "Get performance insights"
        make_auth_request "GET" "/analytics/insights/$USER_ID" "" "200"
        
        print_test "Get detailed progress report"
        make_auth_request "GET" "/analytics/report/$USER_ID" "" "200"
    else
        print_warning "Skipping analytics tests - no access token or user ID"
    fi
}

# Test content management endpoints
test_content_management() {
    print_section "TESTING CONTENT MANAGEMENT ENDPOINTS"
    
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "Get all activities (content mgmt)"
        make_auth_request "GET" "/content/activities" "" "200"
        
        print_test "Get categories"
        make_auth_request "GET" "/content/categories" "" "200"
        
        print_test "Create activity (content mgmt)"
        local content_activity='{
            "title": "Content Test Activity",
            "description": "Test activity via content management",
            "content": "Test content",
            "difficulty": "medium",
            "category": "math",
            "estimatedDuration": 15
        }'
        make_auth_request "POST" "/content/activities" "$content_activity" "201"
    else
        print_warning "Skipping content management tests - no access token"
    fi
}

# Test file upload endpoints
test_file_uploads() {
    print_section "TESTING FILE UPLOAD ENDPOINTS"
    
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "File upload health check"
        make_auth_request "GET" "/files/health" "" "200"
        
        # Create a test file for upload
        echo "This is a test file for API validation" > test_upload.txt
        
        print_test "Single file upload"
        local upload_response=$(curl -s -w '%{http_code}' \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -F "file=@test_upload.txt" \
            "$API_URL/files/upload")
        
        local upload_code="${upload_response: -3}"
        local upload_body="${upload_response%???}"
        
        if [[ "$upload_code" == "200" ]]; then
            print_success "File upload - Status: $upload_code"
            echo "$upload_body"
            
            # Test file info
            print_test "Get file info"
            make_auth_request "GET" "/files/info/test_upload.txt" "" "200"
            
            # Test file deletion
            print_test "Delete file"
            make_auth_request "DELETE" "/files/test_upload.txt" "" "200"
        else
            print_failure "File upload - Expected: 200, Got: $upload_code"
            echo "Response: $upload_body"
        fi
        
        # Clean up test file
        rm -f test_upload.txt
    else
        print_warning "Skipping file upload tests - no access token"
    fi
}

# Test AI endpoints
test_ai_endpoints() {
    print_section "TESTING AI ENDPOINTS"
    
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "AI health check"
        make_auth_request "GET" "/ai/health" "" "200"
        
        # Note: Actual AI endpoints may require specific data or may be rate-limited
        print_info "AI endpoint testing limited to health check to avoid rate limits"
    else
        print_warning "Skipping AI tests - no access token"
    fi
}

# Test feedback endpoints
test_feedback() {
    print_section "TESTING FEEDBACK ENDPOINTS"
    
    # Test public feedback endpoints
    print_test "Create feedback (public)"
    local feedback_data='{
        "type": "bug",
        "message": "Test feedback from API validation",
        "userAgent": "Test Script",
        "url": "/test"
    }'
    make_request "POST" "/feedback" "$feedback_data" "-H 'Content-Type: application/json'" "201"
    
    print_test "Get public feedback"
    make_request "GET" "/feedback/public" "" "" "200"
    
    print_test "Get feedback stats"
    make_request "GET" "/feedback/stats" "" "" "200"
    
    # Test admin feedback endpoints
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "Get all feedback (admin)"
        make_auth_request "GET" "/feedback/admin/all" "" "200"
    else
        print_warning "Skipping admin feedback tests - no access token"
    fi
}

# Test error handling
test_error_handling() {
    print_section "TESTING ERROR HANDLING"
    
    print_test "404 - Non-existent endpoint"
    make_request "GET" "/non-existent-endpoint" "" "" "404"
    
    print_test "401 - Unauthorized access"
    make_request "GET" "/auth/profile" "" "-H 'Content-Type: application/json'" "401"
    
    print_test "400 - Invalid registration data"
    local invalid_data='{"email": "invalid-email"}'
    make_request "POST" "/auth/register" "$invalid_data" "-H 'Content-Type: application/json'" "400"
    
    print_test "409 - Duplicate user registration"
    local duplicate_data='{
        "email": "testuser@example.com",
        "password": "TestPass123",
        "username": "testuser123",
        "firstName": "Test",
        "lastName": "User"
    }'
    make_request "POST" "/auth/register" "$duplicate_data" "-H 'Content-Type: application/json'" "409"
}

# Test logout (should be last)
test_logout() {
    print_section "TESTING LOGOUT"
    
    if [[ -n "$ACCESS_TOKEN" ]]; then
        print_test "User logout"
        make_auth_request "POST" "/auth/logout" "" "200"
        
        # Test that token is invalidated
        print_test "Access after logout (should fail)"
        make_auth_request "GET" "/auth/profile" "" "401"
    else
        print_warning "Skipping logout test - no access token"
    fi
}

# Generate test report
generate_report() {
    print_section "TEST RESULTS SUMMARY"
    
    echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}Failed:${NC} $FAILED_TESTS"
    
    local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
    echo -e "${BLUE}Success Rate:${NC} $success_rate%"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED! 🎉${NC}"
    else
        echo -e "\n${YELLOW}⚠️  Some tests failed. Check the output above for details.${NC}"
    fi
    
    # Save report to file
    local report_file="api_test_report_$(date +%Y%m%d_%H%M%S).txt"
    echo "Test Report - $(date)" > "$report_file"
    echo "Total Tests: $TOTAL_TESTS" >> "$report_file"
    echo "Passed: $PASSED_TESTS" >> "$report_file"
    echo "Failed: $FAILED_TESTS" >> "$report_file"
    echo "Success Rate: $success_rate%" >> "$report_file"
    
    print_info "Test report saved to: $report_file"
}

# Main execution
main() {
    echo -e "${PURPLE}
██████╗ ██╗      █████╗ ██╗   ██╗    ██╗     ███████╗ █████╗ ██████╗ ███╗   ██╗
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝    ██║     ██╔════╝██╔══██╗██╔══██╗████╗  ██║
██████╔╝██║     ███████║ ╚████╔╝     ██║     █████╗  ███████║██████╔╝██╔██╗ ██║
██╔═══╝ ██║     ██╔══██║  ╚██╔╝      ██║     ██╔══╝  ██╔══██║██╔══██╗██║╚██╗██║
██║     ███████╗██║  ██║   ██║       ███████╗███████╗██║  ██║██║  ██║██║ ╚████║
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
                                                                                  
███████╗██████╗  █████╗ ██████╗ ██╗  ██╗                                       
██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝                                       
███████╗██████╔╝███████║██████╔╝█████╔╝                                        
╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗                                        
███████║██║     ██║  ██║██║  ██║██║  ██╗                                       
╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝                                       
${NC}"
    
    print_info "Starting comprehensive API testing..."
    print_info "Testing server at: $BASE_URL"
    
    # Check if server is running
    if ! curl -s "$BASE_URL/health" > /dev/null; then
        print_failure "Server is not running at $BASE_URL"
        print_info "Please start the server with: cd server && npm start"
        exit 1
    fi
    
    print_success "Server is running and accessible"
    
    # Run all test suites
    test_health_endpoints
    test_authentication
    test_activities
    test_rewards
    test_analytics
    test_content_management
    test_file_uploads
    test_ai_endpoints
    test_feedback
    test_error_handling
    test_logout
    
    # Generate final report
    generate_report
}

# Execute main function
main "$@"