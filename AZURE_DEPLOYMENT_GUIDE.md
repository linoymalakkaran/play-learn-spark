# Azure Deployment Guide - Play Learn Spark

## Prerequisites Installation (Windows)

### 1. Install Azure CLI
```bash
# Download and install from: https://aka.ms/installazurecliwindows
# Or using winget:
winget install -e --id Microsoft.AzureCLI
```

### 2. Install Terraform
```bash
# Download from: https://www.terraform.io/downloads.html
# Or using Chocolatey:
choco install terraform

# Or using winget:
winget install --id HashiCorp.Terraform
```

### 3. Install Docker Desktop
```bash
# Download from: https://www.docker.com/products/docker-desktop
# Make sure to enable WSL2 integration if using WSL
```

### 4. Verify Installations
```bash
az --version
terraform --version
docker --version
```

## Deployment Steps

### Step 1: Login to Azure with Your Visual Studio Subscription
```bash
# Login to Azure
az login

# Set your subscription (Visual Studio Subscription)
az account set --subscription "ae912782-989c-43e5-a227-2502f9499c0f"

# Verify the subscription is set
az account show
```

### Step 2: Navigate to Project Directory
```bash
cd "d:\Projects\play-learn-spark"
```

### Step 3: Deploy Infrastructure
```bash
cd azure-infra
terraform init
terraform plan
terraform apply
```

### Step 4: Build and Push Docker Images
After infrastructure deployment, get the container registry details:
```bash
# Get registry login server
$registryServer = terraform output -raw container_registry_login_server
$registryName = terraform output -raw container_registry_name

# Login to Azure Container Registry
az acr login --name $registryName
```

Build and push frontend image:
```bash
cd ../client
docker build -t "$registryServer/play-learn-spark-frontend:latest" .
docker push "$registryServer/play-learn-spark-frontend:latest"
```

Build and push backend image:
```bash
cd ../server
docker build -t "$registryServer/play-learn-spark-backend:latest" .
docker push "$registryServer/play-learn-spark-backend:latest"
```

### Step 5: Update App Services
```bash
cd ../azure-infra
$resourceGroup = terraform output -raw resource_group_name
$frontendApp = terraform output -raw frontend_app_name
$backendApp = terraform output -raw backend_app_name

# Update frontend app service
az webapp config container set --name $frontendApp --resource-group $resourceGroup --docker-custom-image-name "$registryServer/play-learn-spark-frontend:latest"

# Update backend app service
az webapp config container set --name $backendApp --resource-group $resourceGroup --docker-custom-image-name "$registryServer/play-learn-spark-backend:latest"
```

### Step 6: Restart Services
```bash
# Restart backend first
az webapp restart --name $backendApp --resource-group $resourceGroup

# Wait for backend to start, then restart frontend
Start-Sleep -Seconds 30
az webapp restart --name $frontendApp --resource-group $resourceGroup
```

## Alternative: Use Automated Deployment Script

For easier deployment, you can use the provided deployment script:

```bash
cd azure-infra
./deploy.bat
```

This script will:
1. Check prerequisites
2. Login to Azure
3. Deploy infrastructure
4. Build and push Docker images
5. Update App Services
6. Display deployment URLs

## Expected Costs (Visual Studio Subscription)

With your Visual Studio subscription and the B1 App Service Plan:
- **Estimated Monthly Cost**: $20-40 USD
- **Included Credits**: Visual Studio subscriptions typically include $50-150/month in Azure credits

### Cost Breakdown:
- App Service Plan (B1): ~$13/month
- Container Registry (Basic): ~$5/month
- Application Insights: Minimal (first 5GB free)
- Data Transfer: Minimal for development

## Post-Deployment

### URLs
After deployment, you'll receive:
- Frontend URL: `https://[frontend-app-name].azurewebsites.net`
- Backend URL: `https://[backend-app-name].azurewebsites.net`

### Monitoring
- Application Insights: Monitor performance and errors
- App Service Logs: View application logs in Azure Portal

### Scaling
- **Development**: B1 plan is sufficient
- **Production**: Consider upgrading to S1 or P1v2 for better performance

## Troubleshooting

### Common Issues:
1. **Docker build fails**: Ensure Docker Desktop is running
2. **Azure login issues**: Use `az login --use-device-code` for alternative login
3. **Registry push fails**: Verify you're logged in with `az acr login`
4. **App doesn't start**: Check App Service logs in Azure Portal

### Debug Commands:
```bash
# Check App Service logs
az webapp log tail --name $frontendApp --resource-group $resourceGroup

# Check container status
az webapp show --name $frontendApp --resource-group $resourceGroup --query "state"
```

## Clean Up

To remove all resources and stop charges:
```bash
cd azure-infra
terraform destroy
```

**Important**: This will permanently delete all resources and data!