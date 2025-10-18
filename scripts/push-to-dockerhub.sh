#!/bin/bash

# Push Docker Image to Docker Hub (FREE!)
# This script pushes the locally built image to Docker Hub for deployment

set -e  # Exit on any error

echo "🚀 Pushing Play Learn Spark to Docker Hub (FREE!)..."

# Variables - Update these with your Docker Hub details
DOCKER_HUB_USERNAME="linoymalakkaran"  # Update with your Docker Hub username
DOCKER_HUB_REPO="${DOCKER_HUB_USERNAME}/play-learn-spark"
IMAGE_NAME="play-learn-spark-combined"
LOCAL_TAG="local"
REMOTE_TAG="latest"

# Check if local image exists
if ! docker images | grep -q "${IMAGE_NAME}:${LOCAL_TAG}"; then
    echo "❌ Local image ${IMAGE_NAME}:${LOCAL_TAG} not found!"
    echo "📋 Please run ./scripts/build-local.sh first"
    exit 1
fi

echo "🔐 Logging in to Docker Hub..."
echo "💡 Make sure you have a Docker Hub account and are logged in: docker login"

# Login to Docker Hub
docker login

echo "🏷️ Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${LOCAL_TAG} ${DOCKER_HUB_REPO}:${REMOTE_TAG}
docker tag ${IMAGE_NAME}:${LOCAL_TAG} ${DOCKER_HUB_REPO}:$(git rev-parse --short HEAD)

echo "📤 Pushing to Docker Hub..."
docker push ${DOCKER_HUB_REPO}:${REMOTE_TAG}
docker push ${DOCKER_HUB_REPO}:$(git rev-parse --short HEAD)

echo "✅ Successfully pushed to Docker Hub (FREE!)!"
echo "🏷️ Tagged as: ${DOCKER_HUB_REPO}:${REMOTE_TAG}"
echo "🏷️ Tagged as: ${DOCKER_HUB_REPO}:$(git rev-parse --short HEAD)"
echo ""
echo "📋 Next steps:"
echo "1. Update terraform.tfvars with: combined_docker_image = \"${DOCKER_HUB_REPO}:${REMOTE_TAG}\""
echo "2. Update terraform.tfvars with: use_docker_hub = true"
echo "3. Run: cd azure-infra && terraform apply"
echo "4. Or trigger the GitHub Actions workflow for automatic deployment"
echo ""
echo "💰 Total monthly cost: $0.00 (F1 App Service + Docker Hub FREE!)"