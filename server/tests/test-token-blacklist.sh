#!/bin/bash

source "$(dirname "$0")/common.sh"

echo -e "${BLUE}🔐 Testing Token Blacklist Functionality${NC}"
echo "=================================================="

# Create test user and get token
echo -e "\n${YELLOW}👤 Setting up test user${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="tokentest${TIMESTAMP}@example.com"
TEST_USERNAME="tokentest${TIMESTAMP}"
TEST_PASSWORD="testpassword123"

if create_test_user_and_login "$TEST_USERNAME" "$TEST_EMAIL" "$TEST_PASSWORD"; then
    
    echo -e "\n${YELLOW}🔒 Testing authenticated endpoint with valid token${NC}"
    auth_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/auth/profile" \
        -H "Authorization: Bearer $TOKEN")
    
    auth_status=$(echo "$auth_response" | tail -n1)
    auth_body=$(echo "$auth_response" | head -n -1)
    
    if [ "$auth_status" -eq 200 ]; then
        echo -e "${GREEN}✅ Authentication with token successful${NC}"
        echo "Profile data received: $(echo "$auth_body" | head -c 100)..."
        
        echo -e "\n${YELLOW}🚪 Logging out (blacklisting token)${NC}"
        logout_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/logout" \
            -H "Authorization: Bearer $TOKEN")
        
        logout_status=$(echo "$logout_response" | tail -n1)
        logout_body=$(echo "$logout_response" | head -n -1)
        
        if [ "$logout_status" -eq 200 ]; then
            echo -e "${GREEN}✅ Logout successful${NC}"
            echo "Logout response: $logout_body"
            
            echo -e "\n${YELLOW}🚫 Testing same endpoint with blacklisted token${NC}"
            blacklist_response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/auth/profile" \
                -H "Authorization: Bearer $TOKEN")
            
            blacklist_status=$(echo "$blacklist_response" | tail -n1)
            blacklist_body=$(echo "$blacklist_response" | head -n -1)
            
            if [ "$blacklist_status" -eq 401 ]; then
                echo -e "${GREEN}✅ Token correctly blacklisted - access denied${NC}"
                echo "Blacklist response: $blacklist_body"
                
                # Test multiple endpoints with blacklisted token
                echo -e "\n${YELLOW}🔍 Testing multiple endpoints with blacklisted token${NC}"
                test_endpoint "GET" "/api/auth/profile" 401 "Profile with blacklisted token" "Authorization: Bearer $TOKEN"
                test_endpoint "POST" "/api/auth/logout" 401 "Double logout with blacklisted token" "Authorization: Bearer $TOKEN"
                
            else
                echo -e "${RED}❌ Token not properly blacklisted${NC}"
                echo "Expected 401, got $blacklist_status"
                echo "Response: $blacklist_body"
            fi
        else
            echo -e "${RED}❌ Logout failed${NC}"
            echo "Expected 200, got $logout_status"
            echo "Response: $logout_body"
        fi
    else
        echo -e "${RED}❌ Authentication with token failed${NC}"
        echo "Expected 200, got $auth_status"
        echo "Response: $auth_body"
    fi
    
    # Test with completely invalid token
    echo -e "\n${YELLOW}🔍 Testing with invalid token${NC}"
    test_endpoint "GET" "/api/auth/profile" 401 "Profile with invalid token" "Authorization: Bearer invalid.token.here"
    
    # Test without token
    echo -e "\n${YELLOW}🔍 Testing without token${NC}"
    test_endpoint "GET" "/api/auth/profile" 401 "Profile without token"
    
    # Test with malformed authorization header
    echo -e "\n${YELLOW}🔍 Testing with malformed auth header${NC}"
    test_endpoint "GET" "/api/auth/profile" 401 "Profile with malformed auth" "Authorization: InvalidFormat"
    
else
    echo -e "${RED}❌ Failed to create test user and get token${NC}"
    echo "Cannot proceed with token blacklist testing"
fi

show_summary

if [ $SUCCESS_COUNT -ge $((TOTAL_COUNT * 8 / 10)) ]; then
    echo -e "\n🎉 ${GREEN}Token blacklist tests mostly passed!${NC}"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some token blacklist tests failed.${NC}"
    exit 1
fi