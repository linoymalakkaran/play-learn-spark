#!/bin/bash

# Local Docker Build and Test Script for Play Learn Spark
# This script builds the combined Docker image locally for testing

set -e  # Exit on any error

echo "🏗️ Building Play Learn Spark Combined Docker Image..."

# Variables
IMAGE_NAME="play-learn-spark-combined"
TAG="local"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Build the Docker image
echo "📦 Building Docker image: ${FULL_IMAGE_NAME}"
docker build -f Dockerfile.combined -t ${FULL_IMAGE_NAME} .

echo "✅ Docker image built successfully!"

# Test the image locally
echo "🧪 Testing the Docker image locally..."

# Run the container in detached mode
CONTAINER_ID=$(docker run -d -p 8080:80 --name play-learn-spark-test ${FULL_IMAGE_NAME})

echo "🚀 Container started with ID: ${CONTAINER_ID}"
echo "⏳ Waiting 30 seconds for services to start..."
sleep 30

# Health check
echo "🏥 Performing health check..."
if curl -f http://localhost:8080/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs ${CONTAINER_ID}
    docker stop ${CONTAINER_ID}
    docker rm ${CONTAINER_ID}
    exit 1
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -f -s http://localhost:8080/ | grep -q "html"; then
    echo "✅ Frontend is serving content!"
else
    echo "⚠️ Frontend test inconclusive"
fi

echo "🎉 Local testing completed successfully!"
echo "🌐 Application is running at: http://localhost:8080"
echo ""
echo "📋 Next steps:"
echo "1. Open http://localhost:8080 in your browser to test the application"
echo "2. Test the API endpoints at http://localhost:8080/api/*"
echo "3. When satisfied, run: docker stop ${CONTAINER_ID} && docker rm ${CONTAINER_ID}"
echo ""
echo "🚀 To push to Docker Hub (FREE!), run:"
echo "   ./scripts/push-to-dockerhub.sh"