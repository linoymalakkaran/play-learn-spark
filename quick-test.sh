#!/bin/bash

# Quick API Endpoint Test Script
BASE_URL="http://localhost:3002"

echo "🔍 Testing Key API Endpoints..."
echo

# Test AI health endpoint
echo "Testing AI Health:"
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/ai/health"
echo

# Test feedback endpoint
echo "Testing Feedback Stats:"
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/feedback/stats"
echo

# Test reward endpoint
echo "Testing Rewards Health:"
curl -s -w "Status: %{http_code}\n" "${BASE_URL}/api/rewards/achievements"
echo

# Test file upload with txt file
echo "Testing File Upload (creating test file):"
echo "Test content for API validation" > test_upload.txt
echo "Uploading test.txt file:"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer dummy-token" \
  -F "file=@test_upload.txt" \
  "${BASE_URL}/api/files/upload"
rm -f test_upload.txt
echo

# Test logout with token blacklisting
echo "Testing Logout and Token Blacklisting:"
echo "Step 1: Login to get token"
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPass123"}' \
  "${BASE_URL}/api/auth/login")
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
echo "Token obtained: ${TOKEN:0:20}..."

echo "Step 2: Test profile access with token"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${BASE_URL}/api/auth/profile" | head -c 50
echo

echo "Step 3: Logout to blacklist token"
curl -s -w "Status: %{http_code}\n" \
  -X POST -H "Authorization: Bearer $TOKEN" \
  "${BASE_URL}/api/auth/logout"
echo

echo "Step 4: Try profile access after logout (should fail)"
curl -s -w "Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${BASE_URL}/api/auth/profile" | head -c 50
echo

echo "✅ Quick test completed!"