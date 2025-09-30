# Play Learn Spark - Azure Deployment Guide

This guide provides comprehensive instructions for deploying the Play Learn Spark application to Azure App Service using Docker containers and Terraform.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Cost Optimization](#cost-optimization)

## 🏗️ Architecture Overview

The deployment creates the following Azure resources:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (React App)   │◄──►│   (Node.js API) │
│   App Service   │    │   App Service   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────┬───────────────┘
                 │
         ┌─────────────────┐
         │ Azure Container │
         │   Registry      │
         └─────────────────┘
                 │
         ┌─────────────────┐
         │ Application     │
         │   Insights      │
         └─────────────────┘
```

### Components:

- **Frontend App Service**: Hosts the React application in a Docker container with Nginx
- **Backend App Service**: Hosts the Node.js API in a Docker container
- **Azure Container Registry**: Stores Docker images for both applications
- **App Service Plan**: Shared hosting plan for both App Services
- **Application Insights**: Monitoring and analytics
- **Resource Group**: Contains all related resources

## 🛠️ Prerequisites

### Required Tools:

1. **Azure CLI** (v2.50+)
   ```bash
   # Install Azure CLI
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Terraform** (v1.0+)
   ```bash
   # Install Terraform
   wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
   unzip terraform_1.6.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

3. **Docker** (v20.0+)
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

### Azure Requirements:

- Active Azure subscription
- Contributor or Owner role on the subscription
- Resource quotas for:
  - App Service Plans (1)
  - App Services (2)
  - Container Registry (1)
  - Application Insights (1)

## 🚀 Quick Start

### 1. Clone and Prepare

```bash
# Clone the repository
git clone https://github.com/linoymalakkaran/play-learn-spark.git
cd play-learn-spark

# Navigate to infrastructure directory
cd azure-infra

# Make deployment script executable (Linux/Mac)
chmod +x deploy.sh
```

### 2. Configure

```bash
# Copy and edit configuration
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Edit with your preferences
```

### 3. Deploy

```bash
# For Linux/Mac
./deploy.sh

# For Windows
deploy.bat
```

This will:
- Deploy Azure infrastructure
- Build and push Docker images
- Configure App Services
- Start the applications

## 📋 Detailed Setup

### Step 1: Azure Authentication

```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set active subscription (if needed)
az account set --subscription "Your Subscription Name"

# Verify current account
az account show
```

### Step 2: Configure Terraform Variables

Edit `terraform.tfvars`:

```hcl
# Project configuration
project_name = "play-learn-spark"
environment  = "dev"  # or "staging", "prod"
location     = "East US"

# App Service Plan SKU
app_service_plan_sku = "B1"  # Basic tier

# Features
enable_application_insights = true
enable_custom_domain       = false

# Optional: Custom domain
# custom_domain_name = "yourdomain.com"

# Tags
tags = {
  Project     = "Play Learn Spark"
  Environment = "dev"
  Owner       = "Your Team"
  ManagedBy   = "Terraform"
}
```

### Step 3: Infrastructure Deployment

```bash
# Deploy infrastructure only
./deploy.sh infra

# Or deploy everything at once
./deploy.sh
```

### Step 4: Application Deployment

```bash
# Build and push images only
./deploy.sh images

# Update App Services only
./deploy.sh update
```

## ⚙️ Configuration

### Environment Variables

The deployment automatically configures these environment variables:

#### Frontend App Service:
- `NODE_ENV=production`
- `REACT_APP_API_URL=https://[backend-url]`
- `PORT=80`

#### Backend App Service:
- `NODE_ENV=production`
- `PORT=3001`
- `CORS_ORIGIN=https://[frontend-url]`

### Custom Configuration

To add custom environment variables, modify the `resources.tf` file:

```hcl
app_settings = merge(
  {
    "CUSTOM_VAR" = "custom_value"
    # ... existing settings
  },
  # ... existing merge logic
)
```

### SSL/TLS Configuration

The deployment automatically provides SSL certificates via Azure App Service.

For custom domains:
1. Set `enable_custom_domain = true`
2. Set `custom_domain_name = "yourdomain.com"`
3. Configure DNS CNAME record pointing to your App Service URL
4. Run `terraform apply` to bind the domain

## 🚀 Deployment Options

### Full Deployment

```bash
# Deploy everything (recommended for first deployment)
./deploy.sh
```

### Partial Deployments

```bash
# Infrastructure only
./deploy.sh infra

# Images only (after infrastructure exists)
./deploy.sh images

# Update App Services only
./deploy.sh update

# Destroy everything
./deploy.sh destroy
```

### Manual Deployment Steps

If you prefer manual control:

```bash
# 1. Deploy infrastructure
cd azure-infra
terraform init
terraform plan
terraform apply

# 2. Build images
cd ..
docker build -t myregistry.azurecr.io/frontend:latest .
cd server
docker build -t myregistry.azurecr.io/backend:latest .

# 3. Push images
az acr login --name myregistry
docker push myregistry.azurecr.io/frontend:latest
docker push myregistry.azurecr.io/backend:latest

# 4. Update App Services
az webapp config container set \
  --name frontend-app \
  --resource-group my-rg \
  --docker-custom-image-name myregistry.azurecr.io/frontend:latest
```

## 📊 Monitoring

### Application Insights

Access monitoring dashboards:

1. Go to Azure Portal → Application Insights → [your-app-insights-name]
2. View:
   - Live Metrics
   - Application Map
   - Performance
   - Failures
   - Usage

### App Service Logs

```bash
# Stream logs
az webapp log tail --name [app-name] --resource-group [rg-name]

# Download logs
az webapp log download --name [app-name] --resource-group [rg-name]
```

### Health Checks

The deployment includes health check endpoints:

- Frontend: `https://[frontend-url]/health`
- Backend: `https://[backend-url]/health`

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Build Failures

```bash
# Check Docker is running
docker --version
docker ps

# Clean Docker cache
docker system prune -a
```

#### 2. Container Registry Access

```bash
# Verify ACR login
az acr login --name [registry-name]

# Check ACR repositories
az acr repository list --name [registry-name]
```

#### 3. App Service Startup Issues

```bash
# Check App Service logs
az webapp log tail --name [app-name] --resource-group [rg-name]

# Restart App Service
az webapp restart --name [app-name] --resource-group [rg-name]
```

#### 4. Terraform State Issues

```bash
# Refresh state
terraform refresh

# Import existing resources (if needed)
terraform import azurerm_resource_group.main /subscriptions/[id]/resourceGroups/[name]
```

### Performance Issues

1. **Slow startup**: Increase App Service Plan SKU
2. **Memory issues**: Monitor Application Insights and scale up
3. **High CPU**: Consider scaling out (multiple instances)

### Cost Issues

1. Use **F1 (Free)** or **D1 (Shared)** for development
2. Use **B1 (Basic)** for production with light load
3. Monitor costs in Azure Cost Management

## 💰 Cost Optimization

### Development Environment

```hcl
# terraform.tfvars for dev
app_service_plan_sku = "F1"  # Free tier
enable_application_insights = false
```

**Estimated monthly cost: $0-5**

### Production Environment

```hcl
# terraform.tfvars for prod
app_service_plan_sku = "B1"  # Basic tier
enable_application_insights = true
```

**Estimated monthly cost: $20-50**

### Cost Monitoring

1. Set up Azure Cost Alerts
2. Use Azure Cost Management dashboard
3. Review monthly cost analysis

## 📝 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Azure portal logs and metrics
3. Consult the project documentation
4. Create an issue in the repository

---

**Happy Deploying! 🎉**