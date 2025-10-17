# Complete Azure Deployment Setup - Play Learn Spark

This comprehensive guide provides everything needed to deploy the Play Learn Spark application to Azure using a combined Docker container approach for maximum cost efficiency.

## 🎯 **Architecture Overview**

- **Single App Service (F1 Free Tier)**: $0/month
- **Combined Docker Container**: React frontend + Node.js backend in one container
- **SQLite Database**: File-based database stored in container file system
- **Azure Container Registry (Basic)**: ~$5/month for Docker image storage
- **GitHub Actions**: Automated CI/CD pipeline

## 📋 **Prerequisites**

1. **Azure Account** with active subscription
2. **Azure CLI** installed and authenticated
3. **Docker Desktop** installed and running
4. **Terraform** >= 1.0
5. **Git** and GitHub repository access
6. **Node.js** and **npm** (for local development)

## 🚀 **Quick Start Deployment**

### Option 1: Local Build + Push (Recommended First Run)

1. **Build and Test Locally**:
   ```bash
   # Windows
   .\scripts\build-local.ps1
   
   # Linux/macOS
   chmod +x scripts/build-local.sh && ./scripts/build-local.sh
   ```

2. **Push to Azure Container Registry**:
   ```bash
   # Update ACR name in script first, then run:
   .\scripts\push-to-acr.ps1  # Windows
   ./scripts/push-to-acr.sh   # Linux/macOS
   ```

3. **Deploy Infrastructure**:
   ```bash
   cd azure-infra
   terraform init
   terraform apply
   ```

### Option 2: Full CI/CD Pipeline

1. **Configure GitHub Secrets** (see section below)
2. **Push to prod branch**:
   ```bash
   git push origin prod
   ```

## 🔧 **GitHub Actions Setup**

### Required GitHub Secrets:

```yaml
AZURE_CREDENTIALS: |
  {
    "clientId": "your-service-principal-client-id",
    "clientSecret": "your-service-principal-secret", 
    "subscriptionId": "your-subscription-id",
    "tenantId": "your-tenant-id"
  }

ACR_USERNAME: "your-container-registry-username"
ACR_PASSWORD: "your-container-registry-password"
```

### Create Azure Service Principal:

```bash
az ad sp create-for-rbac --name "play-learn-spark-deploy" \
  --role contributor \
  --scopes /subscriptions/{subscription-id} \
  --sdk-auth
```

## 🏗️ **Infrastructure Components**

### Created Resources:
- **Resource Group**: `play-learn-spark-prod-rg`
- **App Service Plan**: F1 (Free tier)
- **App Service**: Combined React + Node.js app
- **Container Registry**: Basic tier
- **Application Insights**: Optional monitoring
- **Log Analytics Workspace**: Centralized logging

### File Structure:
```
├── Dockerfile.combined           # Multi-stage Docker build
├── .env.production              # Production environment variables
├── .github/workflows/
│   └── azure-deploy.yml         # CI/CD pipeline
├── azure-infra/
│   ├── combined-app.tf          # App Service configuration
│   ├── main.tf                  # Terraform setup
│   ├── variables.tf             # Variable definitions
│   ├── outputs.tf               # Output values
│   └── terraform.tfvars         # Configuration values
└── scripts/
    ├── build-local.ps1          # Windows build script
    ├── build-local.sh           # Linux build script
    ├── push-to-acr.ps1          # Windows push script
    └── push-to-acr.sh           # Linux push script
```

## 🐳 **Docker Configuration**

### Combined Container Features:
- **Multi-stage build** for optimized image size
- **Nginx** serves React frontend
- **Node.js** backend runs API server
- **Supervisord** manages both processes
- **SQLite** database for persistent storage
- **Health checks** for monitoring
- **Non-root user** for security

### Environment Variables:
```yaml
NODE_ENV: production
PORT: 80
WEBSITES_PORT: 80
DATABASE_PATH: /app/server/data/database.sqlite
CORS_ORIGIN: "*"
SECURITY_HEADERS: "true"
```

## 💰 **Cost Analysis**

| Service | SKU | Monthly Cost |
|---------|-----|-------------|
| App Service | F1 (Free) | $0.00 |
| Container Registry | Basic | ~$5.00 |
| Bandwidth | Outbound | ~$0.10 |
| **Total Estimated** | | **~$5.10/month** |

### Cost Optimization Tips:
- F1 tier has 60 CPU minutes/day limit
- No "Always On" capability (cold starts expected)
- 1GB RAM, 1GB storage included
- Consider B1 ($13/month) for production workloads

## 🏥 **Health Monitoring**

### Health Check Endpoints:
- **`/health`** - Overall application status
- **`/api/health`** - Backend API health (if implemented)

### Monitoring Features:
- Automated health checks every 30 seconds
- Container restart on failure
- Application Insights integration (optional)
- Real-time log streaming

### Health Check Commands:
```bash
# Check application health
curl https://your-app.azurewebsites.net/health

# Stream logs
az webapp log tail --name your-app-name --resource-group your-rg-name
```

## 🔄 **CI/CD Pipeline Workflow**

### Automated Deployment Process:
1. **Trigger**: Push to `prod` branch or manual dispatch
2. **Build**: Multi-stage Docker build for both frontend and backend
3. **Test**: Health checks and smoke tests
4. **Push**: Image pushed to Azure Container Registry
5. **Deploy**: Terraform applies infrastructure changes
6. **Configure**: App Service updated with new image and settings
7. **Validate**: Health checks ensure successful deployment
8. **Notify**: Deployment status and application URLs

### Pipeline Features:
- **Parallel execution** for faster builds
- **Automatic rollback** on deployment failure
- **Smoke tests** post-deployment
- **Detailed logging** and status reporting

## 🐛 **Troubleshooting Guide**

### Common Issues & Solutions:

1. **Container Won't Start**
   ```bash
   # Check logs
   az webapp log tail --name <app-name> --resource-group <rg-name>
   
   # Restart app
   az webapp restart --name <app-name> --resource-group <rg-name>
   ```

2. **Health Check Failures**
   - Verify port 80 is exposed
   - Check nginx configuration
   - Ensure supervisord starts both services
   - Review environment variables

3. **Build Failures**
   - Verify Docker daemon is running
   - Check Dockerfile.combined syntax
   - Ensure all dependencies are available
   - Review build logs in GitHub Actions

4. **Database Issues**
   - SQLite creates database automatically
   - Data persists in container filesystem
   - Consider external storage for production

### Debugging Commands:
```bash
# Local testing
docker run -p 8080:80 play-learn-spark-combined:local

# Check container status
docker ps -a

# View container logs
docker logs <container-id>

# Execute into running container
docker exec -it <container-id> /bin/sh
```

## 🔒 **Security Best Practices**

### Implemented Security Measures:
- **Non-root container execution**
- **HTTPS enforcement** on Azure App Service
- **CORS policy** configuration
- **Security headers** enabled
- **Environment variable** protection
- **Container isolation**

### Additional Recommendations:
- Regular security updates
- Dependency vulnerability scanning
- SSL certificate management
- Network security groups (for higher tiers)
- Azure Key Vault for secrets (production)

## 📈 **Scaling Considerations**

### Current Limitations (F1 Tier):
- 60 CPU minutes per day
- No "Always On" capability
- Cold start delays
- Limited concurrent connections

### Upgrade Path:
1. **B1 Basic** ($13/month): Always On, custom domains
2. **S1 Standard** ($70/month): Auto-scaling, deployment slots
3. **P1 Premium** ($146/month): Enhanced performance, VNet integration

### External Services Integration:
- **Azure SQL Database** for better database performance
- **Azure Storage** for file uploads
- **Azure CDN** for global content delivery
- **Azure Application Gateway** for load balancing

## 🎯 **Production Readiness Checklist**

### Before Production Deployment:
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured
- [ ] SSL certificates configured
- [ ] Custom domain setup (if required)
- [ ] Error handling reviewed
- [ ] Load testing completed

### Post-Deployment Validation:
- [ ] Application loads correctly
- [ ] All features work as expected
- [ ] Health checks pass
- [ ] Logs are being generated
- [ ] Performance metrics look good
- [ ] Security headers are present

## 📞 **Support & Resources**

### Documentation Links:
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/azure/container-registry/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/)

### Getting Help:
1. Review troubleshooting section
2. Check Azure App Service logs
3. Test Docker image locally
4. Verify GitHub secrets configuration
5. Ensure proper Azure permissions

## 🎉 **Success Metrics**

After successful deployment, you should see:
- ✅ Application accessible via HTTPS
- ✅ Health endpoint returns 200 OK
- ✅ Frontend loads and displays correctly
- ✅ Backend API responds (if applicable)
- ✅ Database operations work
- ✅ No errors in application logs
- ✅ Performance within acceptable limits

**Congratulations! Your Play Learn Spark application is now live on Azure! 🚀**