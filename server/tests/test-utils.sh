#!/bin/bash

# Common test utilities and configurations
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
    
    # Build curl command based on parameters
    local curl_cmd="curl -s -w \"\n%{http_code}\" -X \"$method\" \"$BASE_URL$endpoint\""
    
    if [ -n "$headers" ] && [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H \"$headers\" -d '$data'"
    elif [ -n "$headers" ]; then
        curl_cmd="$curl_cmd -H \"$headers\""
    elif [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi
    
    # Execute curl command
    response=$(eval $curl_cmd)
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($status_code)"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        if [ ${#response_body} -lt 300 ]; then
            echo "   Response: $response_body"
        fi
        return 1
    fi
}

# Test function that extracts JSON field from response
extract_json_field() {
    local json=$1
    local field=$2
    echo "$json" | grep -o "\"$field\":\"[^\"]*\"" | cut -d'"' -f4
}

# Print test section header
print_section() {
    echo -e "\n${YELLOW}$1${NC}"
    echo "$(echo "$1" | sed 's/./-/g')"
}

# Print final results
print_results() {
    local test_name=$1
    echo -e "\n${BLUE}📊 $test_name - Test Summary${NC}"
    echo "=================================================="
    local pass_rate=$((SUCCESS_COUNT * 100 / TOTAL_COUNT))
    echo -e "Total Tests: $TOTAL_COUNT"
    echo -e "Passed: ${GREEN}$SUCCESS_COUNT${NC}"
    echo -e "Failed: ${RED}$((TOTAL_COUNT - SUCCESS_COUNT))${NC}"
    echo -e "Pass Rate: ${GREEN}$pass_rate%${NC}"

    if [ $SUCCESS_COUNT -eq $TOTAL_COUNT ]; then
        echo -e "\n🎉 ${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "\n⚠️  ${YELLOW}Some tests failed. Check the output above for details.${NC}"
        return 1
    fi
}

# Reset counters (useful when sourcing this file)
reset_counters() {
    SUCCESS_COUNT=0
    TOTAL_COUNT=0
}