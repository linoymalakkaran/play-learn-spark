# 🚀 FREE Azure Deployment Guide - Play Learn Spark

Deploy your Play Learn Spark application to Azure with **$0.00 monthly cost** using Docker Hub and Azure App Service F1 Free Tier!

## 💰 **Cost Breakdown: COMPLETELY FREE!**

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| App Service | F1 (Free) | **$0.00** |
| Docker Hub | Free Public Repo | **$0.00** |
| **Total** | | **$0.00/month** |

## 🎯 **Architecture**

- **Azure App Service (F1 Free Tier)**: Hosts your combined container
- **Docker Hub**: Free public repository for your Docker images
- **Combined Container**: React frontend + Node.js backend in one container
- **SQLite Database**: File-based database (no additional cost)
- **GitHub Actions**: Free CI/CD pipeline

## 📋 **Prerequisites**

1. **Azure Account** with free subscription
2. **Docker Hub Account** (free at hub.docker.com)
3. **GitHub Account** (for CI/CD)
4. **Docker Desktop** installed
5. **Azure CLI** installed (`az login`)
6. **Terraform** installed (>= 1.0)

## 🚀 **Quick Start (3 Steps)**

### Step 1: Build and Test Locally

```bash
# Windows PowerShell
.\scripts\build-local.ps1

# Linux/macOS
chmod +x scripts/build-local.sh && ./scripts/build-local.sh
```

✅ This builds your Docker image and tests it at http://localhost:8080

### Step 2: Push to Docker Hub (FREE!)

```bash
# First, login to Docker Hub
docker login

# Windows PowerShell
.\scripts\push-to-dockerhub.ps1

# Linux/macOS
chmod +x scripts/push-to-dockerhub.sh && ./scripts/push-to-dockerhub.sh
```

✅ This pushes your image to Docker Hub at no cost

### Step 3: Deploy to Azure (FREE!)

```bash
cd azure-infra

# Initialize and deploy
terraform init
terraform plan
terraform apply
```

✅ This creates your FREE Azure App Service and deploys your app

## 🔧 **Configuration**

The deployment is pre-configured for Docker Hub in `terraform.tfvars`:

```hcl
# FREE deployment configuration
app_service_plan_sku = "F1"  # FREE tier
combined_docker_image = "linoymalakkaran/play-learn-spark:latest"
use_docker_hub = true  # Uses FREE Docker Hub instead of ACR
```

## 🤖 **GitHub Actions CI/CD (Optional)**

### Step 1: Set Up GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets):

```
AZURE_CREDENTIALS='{
  "clientId": "your-service-principal-client-id",
  "clientSecret": "your-service-principal-secret", 
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}'
DOCKER_HUB_USERNAME="linoymalakkaran"
DOCKER_HUB_ACCESS_TOKEN="your-docker-hub-access-token"
```

### Step 2: Trigger Deployment

```bash
git push origin prod
```

The workflow will:
1. 🏗️ Build your Docker image
2. 📤 Push to Docker Hub (FREE!)
3. 🚀 Deploy to Azure App Service (FREE!)
4. 🏥 Run health checks

## 📁 **Key Files**

| File | Purpose |
|------|---------|
| `Dockerfile.combined` | Multi-stage build for React + Node.js |
| `azure-infra/combined-app.tf` | Azure App Service configuration |
| `azure-infra/terraform.tfvars` | FREE deployment settings |
| `.github/workflows/azure-deploy.yml` | CI/CD pipeline |
| `scripts/build-local.*` | Local build and test |
| `scripts/push-to-dockerhub.*` | Push to Docker Hub |

## 🔍 **What You Get**

✅ **React Frontend**: Served by Nginx  
✅ **Node.js Backend**: API endpoints  
✅ **SQLite Database**: Persistent file-based storage  
✅ **HTTPS**: Automatic SSL certificate  
✅ **Health Monitoring**: Built-in health checks  
✅ **CI/CD Pipeline**: Automated deployments  
✅ **Custom Domain Support**: Easy to add later  

## 🐛 **Troubleshooting**

### Common Issues:

1. **"Image not found"**
   ```bash
   # Make sure you pushed to Docker Hub first
   ./scripts/push-to-dockerhub.sh
   ```

2. **"App won't start"**
   ```bash
   # Check Azure App Service logs
   az webapp log tail --name <app-name> --resource-group <rg-name>
   ```

3. **"Container registry authentication failed"**
   - Ensure `use_docker_hub = true` in terraform.tfvars
   - Docker Hub public repos don't need authentication

### Useful Commands:

```bash
# Check deployment status
cd azure-infra && terraform show

# View app logs  
az webapp log tail --name <app-name> --resource-group <rg-name>

# Restart app
az webapp restart --name <app-name> --resource-group <rg-name>

# Test locally
docker run -p 8080:80 play-learn-spark-combined:local
```

## 🔒 **Security Features**

- ✅ Non-root container user
- ✅ HTTPS enforced
- ✅ CORS properly configured  
- ✅ Security headers enabled
- ✅ Environment variables secured
- ✅ SQLite database isolated

## 📈 **Scaling Options**

When you're ready to scale beyond free tier:

1. **Upgrade App Service**: F1 → B1 ($13/month) for always-on
2. **Private Docker Repo**: Upgrade Docker Hub plan if needed
3. **Azure SQL Database**: For better database reliability
4. **Application Insights**: Enhanced monitoring
5. **Custom Domain**: Add your own domain name

## 🎉 **Post-Deployment**

After successful deployment:

1. 🌐 **Access your app**: Visit the Azure App Service URL
2. 🧪 **Test functionality**: Verify all features work
3. 📊 **Monitor health**: Check /health endpoint
4. 🔗 **Share with others**: Your app is live!

## ❓ **FAQ**

**Q: Is this really free forever?**  
A: Yes! F1 App Service and Docker Hub public repos are permanently free.

**Q: What are the limitations of F1 tier?**  
A: 60 minutes/day CPU time, 1GB RAM, no always-on (sleeps after 20 min idle).

**Q: Can I use a private Docker repository?**  
A: Yes, just set `use_docker_hub = false` and configure ACR (~$5/month).

**Q: How do I add a custom domain?**  
A: Set `enable_custom_domain = true` in terraform.tfvars and follow Azure's domain verification.

**Q: Can I scale this later?**  
A: Absolutely! Just change the `app_service_plan_sku` to a paid tier.

## 🆘 **Support**

If you need help:
1. Check the troubleshooting section above
2. Review Azure App Service logs
3. Test Docker image locally first
4. Ensure all GitHub secrets are configured
5. Verify Azure CLI authentication

---

**🎉 Congratulations!** You now have a completely free, production-ready deployment of your Play Learn Spark application! 🚀

**Total Monthly Cost: $0.00** 💰