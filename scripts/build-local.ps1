# Local Docker Build and Test Script for Play Learn Spark (PowerShell)
# This script builds the combined Docker image locally for testing

$ErrorActionPreference = "Stop"

Write-Host "🏗️ Building Play Learn Spark Combined Docker Image..." -ForegroundColor Green

# Variables
$IMAGE_NAME = "play-learn-spark-combined"
$TAG = "local"
$FULL_IMAGE_NAME = "${IMAGE_NAME}:${TAG}"

# Build the Docker image
Write-Host "📦 Building Docker image: ${FULL_IMAGE_NAME}" -ForegroundColor Yellow
docker build -f Dockerfile.combined -t $FULL_IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully!" -ForegroundColor Green

# Test the image locally
Write-Host "🧪 Testing the Docker image locally..." -ForegroundColor Yellow

# Stop and remove any existing test container
docker stop play-learn-spark-test 2>$null
docker rm play-learn-spark-test 2>$null

# Run the container in detached mode
$CONTAINER_ID = docker run -d -p 8080:80 --name play-learn-spark-test $FULL_IMAGE_NAME

Write-Host "🚀 Container started with ID: ${CONTAINER_ID}" -ForegroundColor Green
Write-Host "⏳ Waiting 30 seconds for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health check
Write-Host "🏥 Performing health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    } else {
        throw "Health check returned status code: $($response.StatusCode)"
    }
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    Write-Host "📋 Container logs:" -ForegroundColor Yellow
    docker logs $CONTAINER_ID
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    exit 1
}

# Test frontend
Write-Host "🌐 Testing frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:8080/" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.Content -like "*html*") {
        Write-Host "✅ Frontend is serving content!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Frontend test inconclusive" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Frontend test failed: $_" -ForegroundColor Yellow
}

Write-Host "🎉 Local testing completed successfully!" -ForegroundColor Green
Write-Host "🌐 Application is running at: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:8080 in your browser to test the application"
Write-Host "2. Test the API endpoints at http://localhost:8080/api/*"
Write-Host "3. When satisfied, run: docker stop ${CONTAINER_ID}; docker rm ${CONTAINER_ID}"
Write-Host ""
Write-Host "🚀 To push to Docker Hub (FREE!), run:" -ForegroundColor Green
Write-Host "   .\scripts\push-to-dockerhub.ps1"