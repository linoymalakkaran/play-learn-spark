# GitHub Workflows - Production Deployment

This project uses a **manual-only deployment approach** with three separate workflows for maximum control and safety in production environments.

## 🔄 Workflow Structure

### 1. Infrastructure Management (`infrastructure-management.yml`)
**Purpose**: Deploy and manage Azure infrastructure using Terraform

**When to use**: 
- Initial infrastructure setup
- Infrastructure updates or scaling
- Environment provisioning (prod/dev)

**Triggers**: Manual only
**Inputs**: 
- `branch`: Environment branch (prod/dev)
- `terraform_action`: plan, apply, or destroy

**Features**:
- ✅ Azure Storage backend for Terraform state
- ✅ Branch-specific deployments
- ✅ UAE North region targeting
- ✅ Domain integration (playlearnspark.dpdns.org)
- ✅ Safe plan-before-apply workflow

### 2. Build and Push Containers (`build-and-push.yml`)
**Purpose**: Build and push container images to GitHub Container Registry

**When to use**:
- After code changes are merged
- Before deploying new versions
- Creating release candidates

**Triggers**: Manual only
**Inputs**:
- `branch`: Source branch to build from (prod/dev)

**Features**:
- ✅ GitHub Container Registry (ghcr.io) integration
- ✅ Separate frontend and backend builds
- ✅ Multi-tag strategy (latest, branch, SHA)
- ✅ Build verification and summaries

### 3. Deploy Application (`deploy-application.yml`)
**Purpose**: Deploy container images to Azure Container Apps

**When to use**:
- After successful container builds
- Rolling out new features to production
- Deploying hotfixes

**Triggers**: Manual only
**Inputs**:
- `branch`: Target environment (prod/dev)
- `container_tag`: Specific container version (default: latest)

**Features**:
- ✅ Container existence verification
- ✅ Environment-specific deployments
- ✅ Health checks and verification
- ✅ Zero-downtime rolling updates

## 🚀 Deployment Process

### Complete Deployment Flow
```
1. Infrastructure Management → Deploy/Update Azure resources
2. Build and Push Containers → Create new container images  
3. Deploy Application → Deploy containers to Azure
```

### Quick Update Flow (code changes only)
```
1. Build and Push Containers → Create new container images
2. Deploy Application → Deploy containers to Azure
```

## 🔐 Required Secrets

Configure these in GitHub repository settings:

### Azure Integration
- `AZURE_CREDENTIALS`: Azure service principal credentials
- `TERRAFORM_STATE_RG`: Terraform state storage resource group
- `TERRAFORM_STATE_SA`: Terraform state storage account name

### Application Configuration
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret

## 🌍 Environment Structure

### Production Environment
- **Branch**: `prod`
- **Domain**: `playlearnspark.dpdns.org`
- **Resource Group**: `playlearnspark-prod-rg`
- **Container Apps**: `playlearnspark-prod-app-*`

### Development Environment  
- **Branch**: `dev`
- **Domain**: `dev.playlearnspark.dpdns.org`
- **Resource Group**: `playlearnspark-dev-rg`
- **Container Apps**: `playlearnspark-dev-app-*`

## 📦 Container Registry

All images are stored in GitHub Container Registry:
- **Frontend**: `ghcr.io/USERNAME/playlearnspark-frontend`
- **Backend**: `ghcr.io/USERNAME/playlearnspark-backend`

**Tag Strategy**:
- `latest`: Most recent successful build
- `prod`/`dev`: Branch-specific builds
- `{branch}-{sha}`: Commit-specific builds

## 🛡️ Safety Features

### Manual-Only Deployments
- ❌ No automatic deployments on push/merge
- ✅ All deployments require manual approval
- ✅ Branch selection for each deployment

### Pre-deployment Checks
- ✅ Container image existence verification
- ✅ Terraform plan review before apply
- ✅ Health checks after deployment

### State Management
- ✅ Terraform state stored in Azure Storage
- ✅ State locking prevents conflicts
- ✅ Environment isolation

## 🔧 Troubleshooting

### Common Issues

**"Container image not found"**
- Run "Build and Push Containers" workflow first
- Check if the specified tag exists in the registry

**"Terraform state locked"**  
- Wait for other operations to complete
- Force unlock if necessary (use with caution)

**"Deployment failed"**
- Check Azure Container App logs
- Verify environment variables and secrets
- Confirm infrastructure is deployed

### Manual Intervention

If workflows fail, you can manually:
1. Check Azure portal for resource status
2. Verify container registry images
3. Review workflow logs for specific errors
4. Use Azure CLI for direct resource management

## 📝 Workflow Logs

Each workflow provides detailed summaries:
- 📊 Infrastructure changes and resource status
- 🐳 Container build results and image tags  
- 🚀 Deployment verification and health checks
- 🔍 Links to deployed applications

All logs are preserved in GitHub Actions for debugging and audit purposes.