#!/bin/bash

# Push Docker Image to Azure Container Registry
# This script pushes the locally built image to ACR for deployment

set -e  # Exit on any error

echo "🚀 Pushing Play Learn Spark to Azure Container Registry..."

# Variables - Update these with your actual ACR details
ACR_NAME="playlearnspark"  # Update with your ACR name
ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
IMAGE_NAME="play-learn-spark-combined"
LOCAL_TAG="local"
REMOTE_TAG="latest"

# Check if local image exists
if ! docker images | grep -q "${IMAGE_NAME}:${LOCAL_TAG}"; then
    echo "❌ Local image ${IMAGE_NAME}:${LOCAL_TAG} not found!"
    echo "📋 Please run ./scripts/build-local.sh first"
    exit 1
fi

echo "🔐 Logging in to Azure Container Registry..."
# Login to ACR (requires Azure CLI to be installed and authenticated)
az acr login --name ${ACR_NAME}

echo "🏷️ Tagging image for ACR..."
docker tag ${IMAGE_NAME}:${LOCAL_TAG} ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}
docker tag ${IMAGE_NAME}:${LOCAL_TAG} ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:$(git rev-parse --short HEAD)

echo "📤 Pushing to Azure Container Registry..."
docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}
docker push ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:$(git rev-parse --short HEAD)

echo "✅ Successfully pushed to ACR!"
echo "🏷️ Tagged as: ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}"
echo "🏷️ Tagged as: ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:$(git rev-parse --short HEAD)"
echo ""
echo "📋 Next steps:"
echo "1. Update terraform.tfvars with: combined_docker_image = \"${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}\""
echo "2. Run: cd azure-infra && terraform apply"
echo "3. Or trigger the GitHub Actions workflow for automatic deployment"