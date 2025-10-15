# 🚀 Getting Started with CI/CD Pipeline

This guide will help you set up the automated deployment pipeline for your Play Learn Spark application.

## Quick Start (5 minutes)

### 1. Set up Azure Resources

Run the automated setup script:

```bash
# Navigate to the scripts directory
cd .github/scripts

# Run the setup script
./setup-azure-resources.sh
```

This script will:
- ✅ Create Azure resource groups (dev & prod)
- ✅ Set up Container Registry
- ✅ Create App Service Plans and Web Apps
- ✅ Configure a Service Principal for GitHub Actions
- ✅ Set up Application Insights

### 2. Configure GitHub Secrets

The setup script will output a JSON block. Add this to your GitHub repository secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste the JSON output from the setup script

### 3. Create the Production Branch

```bash
# Create and push the prod branch
git checkout -b prod
git push origin prod
```

### 4. Test the Pipeline

Push any changes to the `prod` branch to trigger a production deployment:

```bash
# Make a small change (e.g., update README)
echo "# Updated" >> README.md
git add README.md
git commit -m "Test production deployment"
git push origin prod
```

## 📊 Pipeline Overview

### Automatic Triggers

| Branch | Environment | Trigger | Description |
|--------|-------------|---------|-------------|
| `main` | - | Push/PR | Runs tests only |
| `develop` | Development | Push | Deploys to dev environment |
| `staging` | Staging | Push | Deploys to staging environment |
| `prod` | Production | Push | Deploys to production |

### Manual Triggers

Use the **Actions** tab in GitHub to manually run:

- **Infrastructure Management**: Set up/tear down Azure resources
- **Deploy to Azure Production**: Force production deployment
- **Deploy to Azure Development**: Force development deployment

## 🌍 Environments

### Development Environment
- **URL**: `https://play-learn-spark-frontend-dev.azurewebsites.net`
- **API**: `https://play-learn-spark-backend-dev.azurewebsites.net`
- **Purpose**: Testing new features

### Production Environment
- **URL**: `https://play-learn-spark-frontend-prod.azurewebsites.net`
- **API**: `https://play-learn-spark-backend-prod.azurewebsites.net`
- **Purpose**: Live application

## 🔧 Common Tasks

### Deploy a Feature

1. Create feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-new-feature
   ```

3. Create PR to `develop` branch
4. After PR approval, merge to `develop`
5. Development environment will automatically deploy

### Release to Production

1. Merge `develop` → `staging` for testing:
   ```bash
   git checkout staging
   git merge develop
   git push origin staging
   ```

2. Test on staging environment
3. Merge `staging` → `prod` for production:
   ```bash
   git checkout prod
   git merge staging
   git push origin prod
   ```

### Rollback Production

If something goes wrong:

1. **Quick rollback** via Azure Portal:
   - Go to App Service → Deployment Center
   - Find previous working deployment
   - Click "Redeploy"

2. **Code rollback**:
   ```bash
   git checkout prod
   git reset --hard <previous-commit-hash>
   git push origin prod --force
   ```

## 🚨 Troubleshooting

### Pipeline Fails

1. **Check GitHub Actions logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Review step outputs

2. **Common issues**:
   - Azure credentials expired
   - Resource name conflicts
   - Container build failures

### Application Won't Start

1. **Check Azure App Service logs**:
   ```bash
   az webapp log tail --name play-learn-spark-backend-prod --resource-group rg-play-learn-spark-prod
   ```

2. **Check container logs** in Azure Portal:
   - Go to App Service → Log stream

### Container Registry Issues

1. **Login to ACR**:
   ```bash
   az acr login --name playlearnspark
   ```

2. **List images**:
   ```bash
   az acr repository list --name playlearnspark
   ```

## 🧹 Cleanup

To remove all Azure resources:

```bash
cd .github/scripts
./cleanup-azure-resources.sh
```

⚠️ **Warning**: This will permanently delete all Azure resources!

## 📚 Additional Resources

- [Complete Pipeline Documentation](.github/PIPELINE_README.md)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Need Help?

1. Check the [Pipeline README](.github/PIPELINE_README.md) for detailed documentation
2. Review GitHub Actions logs for specific error messages
3. Check Azure Portal for resource status and logs
4. Ensure all secrets are properly configured

---

**Happy Deploying! 🎉**