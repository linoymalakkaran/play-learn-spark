#!/bin/bash

# Master test runner for all API endpoints
cd "$(dirname "$0")"

echo "🚀 Play Learn Spark Backend API Test Suite"
echo "==========================================="
echo "Running comprehensive tests for all endpoints..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test results tracking
TOTAL_SUITES=0
PASSED_SUITES=0

run_test_suite() {
    local test_file=$1
    local suite_name=$2
    
    TOTAL_SUITES=$((TOTAL_SUITES + 1))
    
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}Running: $suite_name${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    if [ -f "$test_file" ]; then
        chmod +x "$test_file"
        if ./"$test_file"; then
            echo -e "${GREEN}✅ $suite_name PASSED${NC}"
            PASSED_SUITES=$((PASSED_SUITES + 1))
        else
            echo -e "${RED}❌ $suite_name FAILED${NC}"
        fi
    else
        echo -e "${RED}❌ Test file $test_file not found${NC}"
    fi
}

# Check if server is running
echo "Checking if server is running on http://localhost:3000..."
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on port 3000${NC}"
    echo "Please start the server with: docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Wait a moment for any rate limiting to reset
echo "Waiting 5 seconds to avoid rate limiting..."
sleep 5

# Run test suites in logical order
run_test_suite "test-focused.sh" "Core Available Endpoints"
run_test_suite "test-core.sh" "Extended Core Tests"
run_test_suite "test-auth.sh" "Comprehensive Auth Tests"

# Final summary
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}🏁 FINAL TEST SUMMARY${NC}"
echo -e "${BLUE}=========================================${NC}"

PASS_RATE=$((PASSED_SUITES * 100 / TOTAL_SUITES))

echo -e "Total Test Suites: $TOTAL_SUITES"
echo -e "Passed: ${GREEN}$PASSED_SUITES${NC}"
echo -e "Failed: ${RED}$((TOTAL_SUITES - PASSED_SUITES))${NC}"
echo -e "Pass Rate: ${GREEN}$PASS_RATE%${NC}"

if [ $PASSED_SUITES -eq $TOTAL_SUITES ]; then
    echo -e "\n🎉 ${GREEN}ALL TEST SUITES PASSED!${NC}"
    echo -e "${GREEN}The Play Learn Spark Backend API is working correctly.${NC}"
    echo ""
    echo -e "${BLUE}Summary of what was tested:${NC}"
    echo "✅ Core health and status endpoints"
    echo "✅ Authentication and authorization flow"
    echo "✅ Token generation and validation"
    echo "✅ Token blacklisting after logout"
    echo "✅ Security headers and protections"
    echo "✅ Database connectivity"
    echo "✅ Proper handling of non-implemented routes"
    echo "✅ Input validation and error handling"
    echo ""
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}SOME TEST SUITES FAILED${NC}"
    echo -e "${YELLOW}Review the output above for details on failed tests.${NC}"
    echo ""
    
    if [ $PASS_RATE -ge 80 ]; then
        echo -e "${YELLOW}Overall system is mostly functional (${PASS_RATE}% pass rate)${NC}"
    else
        echo -e "${RED}Multiple critical issues detected (${PASS_RATE}% pass rate)${NC}"
    fi
    
    exit 1
fi