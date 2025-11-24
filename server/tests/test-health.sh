#!/bin/bash

# Source test utilities
source "$(dirname "$0")/test-utils.sh"

echo "🏥 Testing Health & Status Endpoints"
echo "===================================="

print_section "📊 Core Health Endpoints"

# Test root endpoint
test_endpoint "GET" "/" 200 "Root endpoint"

# Test main health check
test_endpoint "GET" "/health" 200 "Main health check"

# Test API health check
test_endpoint "GET" "/api/health" 200 "API health check"

# Test database status
test_endpoint "GET" "/api/database-status" 200 "Database status"

print_section "❌ Non-existent Endpoints (Should return 404)"

# Test non-existent endpoints
test_endpoint "GET" "/api/nonexistent" 404 "Non-existent API endpoint"
test_endpoint "GET" "/nonexistent" 404 "Non-existent root endpoint"

# Print results
print_results "Health & Status"
exit $?