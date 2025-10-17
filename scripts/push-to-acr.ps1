# Push Docker Image to Azure Container Registry (PowerShell)
# This script pushes the locally built image to ACR for deployment

$ErrorActionPreference = "Stop"

Write-Host "🚀 Pushing Play Learn Spark to Azure Container Registry..." -ForegroundColor Green

# Variables - Update these with your actual ACR details
$ACR_NAME = "playlearnspark"  # Update with your ACR name
$ACR_LOGIN_SERVER = "${ACR_NAME}.azurecr.io"
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

Write-Host "🔐 Logging in to Azure Container Registry..." -ForegroundColor Yellow
# Login to ACR (requires Azure CLI to be installed and authenticated)
az acr login --name $ACR_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to login to ACR. Make sure Azure CLI is installed and you're authenticated." -ForegroundColor Red
    exit 1
}

Write-Host "🏷️ Tagging image for ACR..." -ForegroundColor Yellow
docker tag "${IMAGE_NAME}:${LOCAL_TAG}" "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}"

# Get git commit hash for additional tag
$GIT_HASH = git rev-parse --short HEAD
docker tag "${IMAGE_NAME}:${LOCAL_TAG}" "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${GIT_HASH}"

Write-Host "📤 Pushing to Azure Container Registry..." -ForegroundColor Yellow
docker push "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}"
docker push "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${GIT_HASH}"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push to ACR!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Successfully pushed to ACR!" -ForegroundColor Green
Write-Host "🏷️ Tagged as: ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}" -ForegroundColor Cyan
Write-Host "🏷️ Tagged as: ${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${GIT_HASH}" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update terraform.tfvars with: combined_docker_image = `"${ACR_LOGIN_SERVER}/${IMAGE_NAME}:${REMOTE_TAG}`""
Write-Host "2. Run: cd azure-infra; terraform apply"
Write-Host "3. Or trigger the GitHub Actions workflow for automatic deployment"