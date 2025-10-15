#!/bin/bash

# Test Google AI Integration for Play Learn Spark Backend

echo "🧪 Testing Google AI Integration"
echo "================================"

# Check if server is running
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Server is running on port 3002"
else
    echo "❌ Server is not running. Please start it first with: npm start"
    exit 1
fi

echo ""
echo "🤖 Testing AI Activity Generation with Google AI..."

# Test AI activity generation
curl -X POST http://localhost:3002/api/ai/generate-activity \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "colors",
    "ageGroup": "3-4", 
    "language": "English",
    "activityType": "colors",
    "difficulty": "easy",
    "provider": "google"
  }' \
  -s | python -m json.tool

echo ""
echo "📚 Testing AI Story Generation with Google AI..."

# Test AI story generation
curl -X POST http://localhost:3002/api/ai/generate-story \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "friendship",
    "ageGroup": "4-5",
    "language": "English", 
    "length": "short",
    "includeImages": true,
    "provider": "google"
  }' \
  -s | python -m json.tool

echo ""
echo "✅ Google AI Integration Test Complete!"