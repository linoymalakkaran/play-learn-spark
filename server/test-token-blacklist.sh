#!/bin/bash

BASE_URL="http://localhost:3002"

echo "🔐 Testing Token Blacklisting Functionality"
echo "==========================================="

# Test user credentials (using existing test user)
EMAIL="test@example.com"
PASSWORD="Admin@123"

echo "1. Using existing test user..."
echo "Email: $EMAIL"

echo -e "\n2. Logging in..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Login response: $login_response"

# Extract token from login response
TOKEN=$(echo "$login_response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token from login response"
    exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."

echo -e "\n3. Testing authenticated endpoint with token..."
auth_test=$(curl -s -X GET "$BASE_URL/api/analytics/overview" \
  -H "Authorization: Bearer $TOKEN")

echo "Auth test response: $auth_test"

echo -e "\n4. Logging out (blacklisting token)..."
logout_response=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN")

echo "Logout response: $logout_response"

echo -e "\n5. Testing same endpoint with blacklisted token..."
blacklist_test=$(curl -s -X GET "$BASE_URL/api/analytics/overview" \
  -H "Authorization: Bearer $TOKEN")

echo "Blacklist test response: $blacklist_test"

echo -e "\n🔍 Token blacklisting test complete!"