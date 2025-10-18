# Push Docker Image to Docker Hub (PowerShell) - FREE!
# This script pushes the locally built image to Docker Hub for deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Pushing Play Learn Spark to Docker Hub (FREE!)..." -ForegroundColor Green

# Variables - Update these with your Docker Hub details
$DOCKER_HUB_USERNAME = "linoymalakkaran"  # Update with your Docker Hub username
$DOCKER_HUB_REPO = "${DOCKER_HUB_USERNAME}/play-learn-spark"
$IMAGE_NAME = "play-learn-spark-combined"
$LOCAL_TAG = "local"
$REMOTE_TAG = "latest"

# Check if local image exists
$localImage = docker images --format "table {{.Repository}}:{{.Tag}}" | Where-Object { $_ -like "*${IMAGE_NAME}:${LOCAL_TAG}*" }
if (-not $localImage) {
    Write-Host "❌ Local image ${IMAGE_NAME}:${LOCAL_TAG} not found!" -ForegroundColor Red
    Write-Host "📋 Please run .\scripts\build-local.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔐 Logging in to Docker Hub..." -ForegroundColor Yellow
Write-Host "💡 Make sure you have a Docker Hub account and are logged in: docker login" -ForegroundColor Cyan

# Login to Docker Hub
docker login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to Docker Hub. Make sure you have a Docker Hub account." -ForegroundColor Red
    exit 1
}

Write-Host "🏷️ Tagging image for Docker Hub..." -ForegroundColor Yellow
docker tag "${IMAGE_NAME}:${LOCAL_TAG}" "${DOCKER_HUB_REPO}:${REMOTE_TAG}"

# Get git commit hash for additional tag
$GIT_HASH = git rev-parse --short HEAD
docker tag "${IMAGE_NAME}:${LOCAL_TAG}" "${DOCKER_HUB_REPO}:${GIT_HASH}"

Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
docker push "${DOCKER_HUB_REPO}:${REMOTE_TAG}"
docker push "${DOCKER_HUB_REPO}:${GIT_HASH}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to Docker Hub!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Successfully pushed to Docker Hub (FREE!)!" -ForegroundColor Green
Write-Host "🏷️ Tagged as: ${DOCKER_HUB_REPO}:${REMOTE_TAG}" -ForegroundColor Cyan
Write-Host "🏷️ Tagged as: ${DOCKER_HUB_REPO}:${GIT_HASH}" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update terraform.tfvars with: combined_docker_image = `"${DOCKER_HUB_REPO}:${REMOTE_TAG}`""
Write-Host "2. Update terraform.tfvars with: use_docker_hub = true"
Write-Host "3. Run: cd azure-infra; terraform apply"
Write-Host "4. Or trigger the GitHub Actions workflow for automatic deployment"
Write-Host ""
Write-Host "💰 Total monthly cost: $0.00 (F1 App Service + Docker Hub FREE!)" -ForegroundColor Green