#!/bin/bash

# Common test utilities
BASE_URL="http://localhost:3000"
SUCCESS_COUNT=0
TOTAL_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
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
        if [ ${#response_body} -lt 300 ]; then
            echo "   Response: $response_body"
        fi
    fi
}

# Function to show summary
show_summary() {
    echo -e "\n${YELLOW}📊 Test Summary${NC}"
    echo "=================================================="
    if [ $TOTAL_COUNT -gt 0 ]; then
        PASS_RATE=$((SUCCESS_COUNT * 100 / TOTAL_COUNT))
    else
        PASS_RATE=0
    fi
    echo -e "Total Tests: $TOTAL_COUNT"
    echo -e "Passed: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "Failed: ${RED}$((TOTAL_COUNT - SUCCESS_COUNT))${NC}"
    echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"
}

# Function to create test user and get token
create_test_user_and_login() {
    local username=$1
    local email=$2
    local password=$3
    
    echo "Creating test user: $email"
    
    # Try to register
    register_response=$(curl -s -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$password\",\"firstName\":\"Test\",\"lastName\":\"User\",\"role\":\"parent\"}")
    
    # Try to login (whether register succeeded or failed due to existing user)
    login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    # Extract token
    TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "✅ Successfully got auth token"
        return 0
    else
        echo "❌ Failed to get auth token"
        echo "Login response: $login_response"
        return 1
    fi
}

export -f test_endpoint
export -f show_summary
export -f create_test_user_and_login
export BASE_URL SUCCESS_COUNT TOTAL_COUNT RED GREEN YELLOW BLUE NC TOKEN