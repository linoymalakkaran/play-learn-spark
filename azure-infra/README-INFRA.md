# PlayLearnSpark Azure Infrastructure

## 🏗️ Infrastructure Overview

This Terraform configuration deploys a **minimal-cost, near-FREE** Azure infrastructure for the PlayLearnSpark application:

- **Frontend**: React app hosted on Azure Storage Static Website
- **Backend**: Node.js API running in Azure Container Instance
- **Database**: MongoDB Atlas (external, FREE M0 tier)
- **Container Registry**: GitHub Container Registry (GHCR)
- **State Management**: Terraform remote state in Azure Storage

## 📋 What Gets Created

### 1. **Resource Group**
- **Name Pattern**: `play-learn-spark-{environment}-rg`
- **Examples**: 
  - `play-learn-spark-dev-rg`
  - `play-learn-spark-prod-rg`
- **Location**: UAE North
- **Cost**: **FREE**

### 2. **Storage Account** (Multi-purpose)
- **Name**: Auto-generated (e.g., `playlearnspark1a2b3c4d`)
- **Type**: Standard LRS (Locally Redundant Storage)
- **Features**:
  - ✅ **Static Website Hosting** (React frontend)
  - ✅ **Terraform State Container** (`tfstate`)
- **Frontend URL**: `https://{storage-name}.z1.web.core.windows.net/`
- **Cost**: **~$0-2/month** (5GB free tier)

### 3. **Container Instance** (Backend API)
- **Name**: `play-learn-spark-{environment}-backend`
- **Public DNS**: `{project-env-suffix}.uaenorth.azurecontainer.io`
- **Specifications**:
  - 0.5 CPU cores
  - 1.0 GB RAM  
  - Linux OS
  - Public IP with custom DNS
- **Container Image**: `ghcr.io/linoymalakkaran/play-learn-spark-backend:latest`
- **Exposed Port**: 3000
- **Cost**: **~$0-15/month** (pay-per-second, scales to zero)

### 4. **Environment Variables** (Backend Container)
| Variable | Value | Source |
|----------|-------|--------|
| `NODE_ENV` | dev/prod | Terraform input |
| `PORT` | 3000 | Fixed |
| `MONGO_URI` | Full MongoDB Atlas URI | GitHub Secret + auto-appended DB name |
| `GOOGLE_AI_KEY` | Google AI Studio API key | GitHub Secret |
| `JWT_SECRET` | JWT signing secret | GitHub Secret (secure) |

## 🚫 What's NOT Created (External Dependencies)

### **MongoDB Atlas** (You manage separately)
- **Tier**: FREE M0 cluster (512MB storage)
- **Database Name**: `playlearnspark`
- **Setup Required**: Manual cluster creation + user setup
- **Cost**: **$0.00/month**

### **GitHub Container Registry**
- **Images**: 
  - `ghcr.io/linoymalakkaran/play-learn-spark-frontend:latest`
  - `ghcr.io/linoymalakkaran/play-learn-spark-backend:latest`
- **Authentication**: GitHub token (automatic in workflows)
- **Cost**: **FREE** for public repositories

### **Domain & DNS** (Optional)
- **Domain**: `playlearnspark.dpdns.org` (Azure DNS - FREE)
- **Nameservers**: Cloudflare (`hal.ns.cloudflare.com`, `magali.ns.cloudflare.com`)
- **Manual Setup**: CNAME records pointing to Azure endpoints

## 🔄 GitHub Workflows

### 1. **Infrastructure Deployment** (`infra.yml`)
**Trigger**: Manual workflow dispatch

**Inputs**:
- Environment: `dev` or `prod`
- Action: `plan` / `apply` / `destroy`
- Branch: `feature/dev` or `main`

**What it does**:
1. Authenticates to Azure using service principal
2. Initializes Terraform with remote state backend
3. Runs selected Terraform action with secrets as variables
4. Outputs infrastructure URLs and names

### 2. **Build & Push Images** (`build-push.yml`)
**Trigger**: Manual workflow dispatch

**Inputs**:
- Branch: Source branch to build from
- Image Tag: Custom tag (default: `latest`)

**What it does**:
1. Builds React frontend (`npm run build` in `client/`)
2. Builds Node.js backend (installs deps from `server/`)
3. Creates Docker images for both frontend and backend
4. Pushes images to GitHub Container Registry
5. Tags images with specified tag

### 3. **Application Deployment** (`deploy-app.yml`)
**Trigger**: Manual workflow dispatch

**Inputs**:
- Environment: `dev` or `prod`
- Branch: Source branch for assets
- Image Tag: Docker image tag to deploy

**What it does**:
1. Retrieves Terraform outputs (storage account, backend FQDN)
2. Uploads frontend `dist/` files to Azure Storage static website
3. Deletes existing backend container instance
4. Creates new backend container with specified image tag
5. Outputs final deployment URLs

## 💰 Cost Breakdown

| Component | Monthly Cost | Details |
|-----------|-------------|---------|
| **Storage Account** | $0-2 | 5GB free static hosting, minimal transactions |
| **Container Instance** | $0-15 | Pay-per-second, auto-scales to zero when idle |
| **Resource Group** | $0 | Always free |
| **MongoDB Atlas** | $0 | M0 free tier (512MB) |
| **GitHub Container Registry** | $0 | Free for public repos |
| **Total Estimated** | **$0-17/month** | Ideal for development and small production workloads |

## 🔐 Required GitHub Secrets

### **Azure Authentication** (Service Principal)
| Secret | Description | How to Get |
|--------|-------------|------------|
| `AZURE_CLIENT_ID` | Service Principal Application ID | Azure Portal → App Registrations |
| `AZURE_CLIENT_SECRET` | Service Principal Password | Azure Portal → App Registrations → Certificates & Secrets |
| `AZURE_SUBSCRIPTION_ID` | Azure Subscription ID | Azure Portal → Subscriptions |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | Azure Portal → Azure Active Directory |

### **Terraform State Backend** (Auto-created on first run)
| Secret | Description | Value |
|--------|-------------|-------|
| `TF_STATE_RG` | Resource group for Terraform state | Will be created automatically |
| `TF_STATE_SA` | Storage account for Terraform state | Will be created automatically |

### **Application Configuration**
| Secret | Description | Example/Source |
|--------|-------------|----------------|
| `MONGODB_ATLAS_URI` | MongoDB connection string (without DB name) | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `JWT_SECRET` | JWT signing secret | Generate random 64-char string |
| `GOOGLE_AI_API_KEY` | Google AI Studio API key | `AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08` |

### **Optional Future Secrets**
| Secret | Purpose | When Needed |
|--------|---------|-------------|
| `SENDGRID_API_KEY` | Email sending | User notifications |
| `STRIPE_SECRET_KEY` | Payment processing | Monetization features |
| `OPENAI_API_KEY` | Additional AI provider | Backup AI service |

## 🚀 Deployment Process

### **Initial Setup (One-time)**
1. **Create Service Principal** in Azure Portal
2. **Set up GitHub Secrets** (all secrets listed above)
3. **Create MongoDB Atlas FREE cluster**:
   - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create M0 cluster in region close to UAE North
   - Create database user and get connection string
   - Add `0.0.0.0/0` to IP allowlist (restrict later)
4. **Get Google AI API key** from [aistudio.google.com](https://aistudio.google.com)

### **Deployment Workflow (Repeatable)**
1. **Build Images**: Run `Build and Push Images` workflow
2. **Deploy Infrastructure**: Run `Terraform Infra` workflow (action: `apply`)
3. **Deploy Application**: Run `Deploy Application` workflow
4. **Verify**: Check output URLs for frontend and backend

### **Development Workflow**
```bash
# Make code changes
git add . && git commit -m "feature update"
git push

# Build new images with branch-specific tag
# → Run "Build and Push Images" workflow (tag: feature-xyz)

# Deploy with new tag  
# → Run "Deploy Application" workflow (image_tag: feature-xyz)
```

## 🌐 Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PlayLearnSpark Architecture             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌍 Internet Users                                         │
│       │                                                     │
│       ├─── Frontend ──→ Azure Storage Static Website       │
│       │                 • React app (built files)          │
│       │                 • HTTPS enabled                    │
│       │                 • Custom domain support            │
│       │                 • Cost: ~$0-2/month               │
│       │                                                     │
│       └─── API calls ──→ Azure Container Instance          │
│                          • Node.js backend                 │
│                          • Public IP + DNS                 │
│                          • Auto-scaling to zero            │
│                          • Cost: ~$0-15/month             │
│                          │                                 │
│                          └──→ MongoDB Atlas (External)     │
│                               • FREE M0 cluster (512MB)    │
│                               • Global deployment          │
│                               • Built-in security         │
│                               • Cost: $0/month            │
│                                                             │
│  📦 GitHub Container Registry                              │
│      • Frontend & Backend images                           │
│      • Automated builds via workflows                      │
│      • Cost: FREE                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Manual Steps Required

### **MongoDB Atlas Setup**
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create new M0 (FREE) cluster
   - Choose region closest to UAE North (e.g., Mumbai/Singapore)
   - Cluster name: `playlearnspark-cluster`
3. Create database user:
   - Username: `playlearnspark-user`
   - Password: Generate secure password
   - Role: `Atlas Admin` (for development)
4. Configure network access:
   - Add IP: `0.0.0.0/0` (allow all - restrict later for production)
5. Get connection string:
   - Format: `mongodb+srv://username:password@cluster.mongodb.net`
   - Store in GitHub Secret `MONGODB_ATLAS_URI` (without database name)

### **Domain Configuration (Optional)**
1. **Cloudflare DNS Setup**:
   - Login to Cloudflare with `playlearnspark@gmail.com`
   - Add CNAME records:
     - `app` → Azure Storage static website URL
     - `api` → Azure Container Instance FQDN
2. **Custom Domain in Azure** (Future enhancement):
   - Configure custom domain in Azure Storage
   - Add SSL certificate binding

## 🔧 Local Development Commands

### **Terraform Operations**
```bash
# Navigate to infrastructure directory
cd azure-infra

# Initialize (replace with actual state backend values)
terraform init \
  -backend-config="resource_group_name=your-tf-state-rg" \
  -backend-config="storage_account_name=your-tf-state-sa" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=play-learn-spark-dev.tfstate"

# Plan deployment
terraform plan \
  -var environment=dev \
  -var mongodb_atlas_connection_string="mongodb+srv://user:pass@cluster.mongodb.net" \
  -var jwt_secret="your-super-secure-jwt-secret" \
  -var google_ai_api_key="your-google-ai-key"

# Apply changes
terraform apply -auto-approve \
  -var environment=dev \
  -var mongodb_atlas_connection_string="mongodb+srv://user:pass@cluster.mongodb.net" \
  -var jwt_secret="your-super-secure-jwt-secret" \
  -var google_ai_api_key="your-google-ai-key"

# Destroy everything
terraform destroy -auto-approve \
  -var environment=dev \
  -var mongodb_atlas_connection_string="mongodb+srv://user:pass@cluster.mongodb.net" \
  -var jwt_secret="your-super-secure-jwt-secret" \
  -var google_ai_api_key="your-google-ai-key"
```

### **Local Testing**
```bash
# Build frontend locally
cd client
npm install
npm run build

# Build backend locally  
cd ../server
npm install
npm run build

# Test Docker builds
docker build -t playlearnspark-frontend -f client/Dockerfile client
docker build -t playlearnspark-backend -f server/Dockerfile server

# Run locally with Docker Compose (if available)
docker-compose up
```

## 🛡️ Security Best Practices

### **Secrets Management**
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Rotate `JWT_SECRET` every 90 days
- ✅ Never commit secrets to git repository
- ✅ Use secure environment variables in containers

### **Network Security**
- ✅ Restrict MongoDB Atlas IP allowlist after development
- ✅ Enable Cloudflare WAF and security features
- ✅ Use HTTPS for all endpoints
- ✅ Implement rate limiting in backend API

### **Azure Security**
- ✅ Use least-privilege service principal permissions
- ✅ Enable Azure Security Center recommendations
- ✅ Set up budget alerts to avoid unexpected charges
- ✅ Monitor resource access logs

### **Container Security**
- ✅ Use specific image tags instead of `latest` in production
- ✅ Scan container images for vulnerabilities
- ✅ Keep base images updated
- ✅ Use non-root user in containers

## 📊 Monitoring & Troubleshooting

### **Health Checks**
```bash
# Check frontend
curl -I https://your-storage-account.z1.web.core.windows.net/

# Check backend API
curl https://your-backend.uaenorth.azurecontainer.io:3000/health

# Check MongoDB Atlas connectivity (from backend logs)
az container logs --resource-group play-learn-spark-dev-rg --name play-learn-spark-dev-backend
```

### **Common Issues**
| Issue | Symptoms | Solution |
|-------|----------|----------|
| Container won't start | Backend not responding | Check container logs, verify environment variables |
| Frontend 404 errors | Static site not loading | Verify frontend files uploaded to `$web` container |
| Database connection failed | Backend 500 errors | Check MongoDB Atlas URI and network access |
| Images not pulling | Container creation fails | Verify GHCR authentication and image exists |

### **Useful Commands**
```bash
# View container logs
az container logs --name play-learn-spark-dev-backend --resource-group play-learn-spark-dev-rg

# Restart container
az container restart --name play-learn-spark-dev-backend --resource-group play-learn-spark-dev-rg

# Check Terraform state
terraform show

# Validate Terraform configuration
terraform validate

# Check Azure resources
az resource list --resource-group play-learn-spark-dev-rg -o table
```

## 🚀 Next Steps & Enhancements

### **Immediate Priority**
1. ✅ Set up all GitHub Secrets
2. ✅ Create MongoDB Atlas cluster
3. ✅ Test initial deployment workflow
4. ✅ Configure custom domain (optional)

### **Future Enhancements**
- **Azure Key Vault**: Centralized secrets management
- **Azure Monitor**: Application insights and logging
- **Custom Domain**: HTTPS with custom SSL certificates  
- **CDN**: Azure CDN for global performance
- **Auto-scaling**: Container Apps upgrade for better scaling
- **CI/CD**: Automated deployments on git push
- **Backup Strategy**: Automated MongoDB backups
- **Staging Environment**: Additional environment for testing

### **Production Readiness Checklist**
- [ ] Restrict MongoDB Atlas IP allowlist
- [ ] Implement proper error handling and logging
- [ ] Set up monitoring and alerting
- [ ] Configure backup and disaster recovery
- [ ] Implement security headers and CORS
- [ ] Add rate limiting and DDoS protection
- [ ] Performance testing and optimization
- [ ] Documentation for operations team

---

## 📞 Support & Resources

### **Useful Links**
- [Azure Container Instances Documentation](https://docs.microsoft.com/en-us/azure/container-instances/)
- [Azure Storage Static Website](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### **Contact Information**
- **Project**: PlayLearnSpark
- **Domain**: `playlearnspark.dpdns.org`
- **Email**: `playlearnspark@gmail.com`
- **Repository**: `github.com/linoymalakkaran/play-learn-spark`

---

*Last Updated: October 29, 2025*
