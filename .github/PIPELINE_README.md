# GitHub Actions CI/CD Pipeline Setup

This repository contains automated GitHub Actions workflows for continuous integration and deployment of the Play Learn Spark application to Azure.

## 🚀 Workflows Overview

### 1. CI - Tests and Quality Checks (`ci.yml`)
- **Triggers**: Push to main/develop/staging branches, PRs to main/develop
- **Purpose**: Run tests, linting, security scans, and quality checks
- **Features**:
  - Tests both backend and frontend on Node.js 18 & 20
  - TypeScript type checking
  - ESLint code quality checks
  - Security vulnerability scanning with Trivy
  - npm audit for dependency vulnerabilities
  - Docker image build verification
  - Automated PR status updates

### 2. Deploy to Azure Development (`deploy-to-azure-dev.yml`)
- **Triggers**: Push to develop/staging branches, PRs to develop
- **Purpose**: Deploy to development/staging environment
- **Features**:
  - Smart change detection (only deploys what changed)
  - Separate dev environment deployment
  - PR deployment previews with comments
  - Automated testing before deployment

### 3. Deploy to Azure Production (`deploy-to-azure-prod.yml`)
- **Triggers**: Push to `prod` branch, manual workflow dispatch
- **Purpose**: Deploy to production environment
- **Features**:
  - Infrastructure deployment with Terraform (optional)
  - Production-grade deployment with health checks
  - Rollback capability
  - Deployment verification
  - Comprehensive deployment summaries

## 📋 Prerequisites

### 1. Azure Setup

#### Create Service Principal
```bash
az ad sp create-for-rbac --name "play-learn-spark-github" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

#### Create Azure Resources (if not using Terraform)
```bash
# Resource Group
az group create --name rg-play-learn-spark-prod --location eastus
az group create --name rg-play-learn-spark-dev --location eastus

# Container Registry
az acr create --resource-group rg-play-learn-spark-prod \
  --name playlearnspark --sku Basic

# App Service Plans
az appservice plan create --name plan-play-learn-spark-prod \
  --resource-group rg-play-learn-spark-prod \
  --sku P1v2 --is-linux

az appservice plan create --name plan-play-learn-spark-dev \
  --resource-group rg-play-learn-spark-dev \
  --sku B1 --is-linux

# Web Apps
az webapp create --resource-group rg-play-learn-spark-prod \
  --plan plan-play-learn-spark-prod \
  --name play-learn-spark-backend-prod \
  --deployment-container-image-name playlearnspark.azurecr.io/play-learn-spark-backend:latest

az webapp create --resource-group rg-play-learn-spark-prod \
  --plan plan-play-learn-spark-prod \
  --name play-learn-spark-frontend-prod \
  --deployment-container-image-name playlearnspark.azurecr.io/play-learn-spark-frontend:latest

az webapp create --resource-group rg-play-learn-spark-dev \
  --plan plan-play-learn-spark-dev \
  --name play-learn-spark-backend-dev \
  --deployment-container-image-name playlearnspark.azurecr.io/play-learn-spark-backend:dev-latest

az webapp create --resource-group rg-play-learn-spark-dev \
  --plan plan-play-learn-spark-dev \
  --name play-learn-spark-frontend-dev \
  --deployment-container-image-name playlearnspark.azurecr.io/play-learn-spark-frontend:dev-latest
```

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

#### Required Secrets:
- `AZURE_CREDENTIALS`: JSON output from the service principal creation
  ```json
  {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "subscriptionId": "your-subscription-id",
    "tenantId": "your-tenant-id"
  }
  ```

#### Optional Environment-Specific Secrets:
- `PROD_DATABASE_URL`: Production database connection string
- `DEV_DATABASE_URL`: Development database connection string
- `API_KEYS`: Any API keys needed for the application

### 3. Environment Variables

Update your application configuration to use environment-specific variables:

#### Frontend (client/.env.production)
```env
VITE_API_URL=https://play-learn-spark-backend-prod.azurewebsites.net
VITE_ENVIRONMENT=production
```

#### Backend (server/.env.production)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
```

## 🔧 Configuration

### Customizing Deployment

#### App Names and Resource Groups
Edit the environment variables in each workflow file:

```yaml
env:
  AZURE_RESOURCE_GROUP: rg-play-learn-spark-prod  # Change this
  ACR_NAME: playlearnspark                         # Change this
  FRONTEND_APP_NAME: play-learn-spark-frontend-prod # Change this
  BACKEND_APP_NAME: play-learn-spark-backend-prod   # Change this
```

#### Infrastructure as Code
The production workflow can optionally deploy infrastructure using Terraform:

1. Uncomment the Terraform backend configuration in `azure-infra/main.tf`
2. Set up remote state storage
3. Enable infrastructure deployment in the workflow

### Branch Strategy

The workflows are designed for this branch strategy:

```
main          ←── PR merges (no auto-deploy)
├── develop   ←── Feature branches (auto-deploy to dev)
├── staging   ←── Release candidates (auto-deploy to staging)
└── prod      ←── Production releases (auto-deploy to prod)
```

## 🚀 Deployment Process

### Development Deployment
1. Create feature branch from `develop`
2. Make changes and push
3. Create PR to `develop`
4. CI runs automatically
5. On PR merge, auto-deploys to dev environment

### Production Deployment
1. Merge `develop` → `staging` for testing
2. After validation, merge `staging` → `prod`
3. Production deployment triggers automatically
4. Health checks verify deployment

### Manual Production Deployment
You can trigger production deployment manually:

1. Go to Actions tab in GitHub
2. Select "Deploy to Azure Production"
3. Click "Run workflow"
4. Choose options:
   - Deploy infrastructure: Yes/No
   - Force deploy: Yes/No

## 📊 Monitoring and Verification

### Health Checks
Both workflows include automated health checks:

- **Backend**: `GET /health` endpoint
- **Frontend**: HTTP 200 response from root URL

### Deployment Verification
- Container image tags with commit SHA
- App Service restart after deployment
- 30-second wait period for startup
- HTTP health check validation

### Rollback Procedure
If deployment fails:

1. Check workflow logs for errors
2. Fix issues in code
3. Re-run deployment, or
4. Manual rollback via Azure Portal:
   ```bash
   # Rollback to previous image
   az webapp config container set \
     --name your-app-name \
     --resource-group your-rg \
     --docker-custom-image-name playlearnspark.azurecr.io/app:previous-tag
   ```

## 🔍 Troubleshooting

### Common Issues

#### 1. Authentication Errors
- Verify `AZURE_CREDENTIALS` secret is correctly formatted
- Check service principal permissions
- Ensure subscription ID is correct

#### 2. Container Registry Access
- Verify ACR name matches workflow configuration
- Check if ACR allows public access or requires authentication
- Ensure service principal has AcrPush/AcrPull roles

#### 3. App Service Deployment Fails
- Check App Service logs in Azure Portal
- Verify container image exists and is accessible
- Check environment variables and configuration

#### 4. Health Check Failures
- Verify health endpoints are working locally
- Check App Service startup time (increase wait time if needed)
- Review application logs for startup errors

### Debugging Steps

1. **Check GitHub Actions logs**: Detailed output for each step
2. **Azure Portal logs**: App Service diagnostics and logs
3. **Container logs**: Docker container output in App Service
4. **Manual testing**: Test deployment steps locally

## 📈 Optimization Tips

### Performance
- Use multi-stage Docker builds (already implemented)
- Enable container image caching
- Optimize Node.js startup time
- Use Azure CDN for static assets

### Cost Optimization
- Use appropriate App Service Plan tiers
- Implement auto-scaling policies
- Schedule dev environment shutdown for off-hours
- Monitor Azure costs with alerts

### Security
- Regular dependency updates
- Container image scanning
- Secrets rotation
- Network security groups
- Azure Key Vault integration

## 🤝 Contributing

When making changes to the workflows:

1. Test in development environment first
2. Update this documentation if needed
3. Follow the existing branch strategy
4. Ensure all quality checks pass

## 📞 Support

For issues with the CI/CD pipeline:

1. Check this documentation
2. Review GitHub Actions logs
3. Check Azure resource status
4. Contact the development team

---

## Quick Commands Reference

```bash
# Create prod branch and trigger deployment
git checkout -b prod
git push origin prod

# Force production deployment
gh workflow run "Deploy to Azure Production" -f force_deploy=true

# Check deployment status
az webapp show --name play-learn-spark-backend-prod --resource-group rg-play-learn-spark-prod --query state

# View app logs
az webapp log tail --name play-learn-spark-backend-prod --resource-group rg-play-learn-spark-prod
```