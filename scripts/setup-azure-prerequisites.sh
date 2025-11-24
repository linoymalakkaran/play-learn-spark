#!/bin/bash

# PlayLearnSpark - Azure Prerequisites Setup Script
# This script creates all necessary Azure resources before running Terraform workflows
# Run this locally, then use the output to configure GitHub Secrets

set -e  # Exit on any error

echo "🚀 PlayLearnSpark - Azure Prerequisites Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="playlearnspark"
LOCATION="uaenorth"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Project Name: $PROJECT_NAME"
echo "Location: $LOCATION"
echo ""

# Check if Azure CLI is installed and logged in
echo -e "${BLUE}🔐 Checking Azure CLI...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found. Please install it first.${NC}"
    echo "Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure. Please login first:${NC}"
    echo "az login"
    exit 1
fi

# Get current subscription info
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)

echo -e "${GREEN}✅ Azure CLI ready${NC}"
echo "Subscription: $SUBSCRIPTION_NAME"
echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Tenant ID: $TENANT_ID"
echo ""

# Step 1: Create Resource Group for Terraform State
echo -e "${BLUE}🏗️  Step 1: Creating Terraform State Resource Group...${NC}"
TF_STATE_RG="${PROJECT_NAME}-tfstate-rg"

if az group show --name $TF_STATE_RG &> /dev/null; then
    echo -e "${YELLOW}⚠️  Resource group $TF_STATE_RG already exists${NC}"
else
    az group create --name $TF_STATE_RG --location $LOCATION
    echo -e "${GREEN}✅ Created resource group: $TF_STATE_RG${NC}"
fi

# Step 2: Create Storage Account for Terraform State
echo -e "${BLUE}💾 Step 2: Creating Terraform State Storage Account...${NC}"
# Use shorter name to avoid 24 character limit
TF_STATE_SA="plstfstate$(openssl rand -hex 4)"

if az storage account show --name $TF_STATE_SA --resource-group $TF_STATE_RG &> /dev/null; then
    echo -e "${YELLOW}⚠️  Storage account $TF_STATE_SA already exists${NC}"
else
    az storage account create \
        --name $TF_STATE_SA \
        --resource-group $TF_STATE_RG \
        --location $LOCATION \
        --sku Standard_LRS \
        --encryption-services blob
    echo -e "${GREEN}✅ Created storage account: $TF_STATE_SA${NC}"
fi

# Step 3: Create Container for Terraform State
echo -e "${BLUE}📦 Step 3: Creating Terraform State Container...${NC}"
CONTAINER_NAME="tfstate"

# Get storage account key
STORAGE_KEY=$(az storage account keys list --resource-group $TF_STATE_RG --account-name $TF_STATE_SA --query '[0].value' -o tsv)

# Create container
if az storage container show --name $CONTAINER_NAME --account-name $TF_STATE_SA --account-key $STORAGE_KEY &> /dev/null; then
    echo -e "${YELLOW}⚠️  Container $CONTAINER_NAME already exists${NC}"
else
    az storage container create \
        --name $CONTAINER_NAME \
        --account-name $TF_STATE_SA \
        --account-key $STORAGE_KEY
    echo -e "${GREEN}✅ Created container: $CONTAINER_NAME${NC}"
fi

# Step 4: Create Service Principal for GitHub Actions
echo -e "${BLUE}🔑 Step 4: Creating Service Principal for GitHub Actions...${NC}"
SP_NAME="${PROJECT_NAME}-github-actions"

# Check if service principal already exists
if az ad sp list --display-name $SP_NAME --query "[0].appId" -o tsv | grep -q .; then
    echo -e "${YELLOW}⚠️  Service Principal $SP_NAME already exists${NC}"
    APP_ID=$(az ad sp list --display-name $SP_NAME --query "[0].appId" -o tsv)
    echo "Existing App ID: $APP_ID"
    echo -e "${YELLOW}⚠️  You may need to create a new client secret manually in Azure Portal${NC}"
    CLIENT_SECRET="<EXISTING_SP_CREATE_NEW_SECRET>"
else
    # Create new service principal
    SP_OUTPUT=$(az ad sp create-for-rbac \
        --name $SP_NAME \
        --role contributor \
        --scopes /subscriptions/$SUBSCRIPTION_ID \
        --sdk-auth)
    
    APP_ID=$(echo $SP_OUTPUT | jq -r '.clientId')
    CLIENT_SECRET=$(echo $SP_OUTPUT | jq -r '.clientSecret')
    
    echo -e "${GREEN}✅ Created Service Principal: $SP_NAME${NC}"
fi

# Step 5: Generate JWT Secret
echo -e "${BLUE}🔐 Step 5: Generating JWT Secret...${NC}"
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✅ Generated JWT Secret${NC}"

# Step 6: Summary and GitHub Secrets
echo ""
echo -e "${GREEN}🎉 Setup Complete! All Azure prerequisites created.${NC}"
echo ""
echo -e "${BLUE}📋 GITHUB SECRETS CONFIGURATION${NC}"
echo "=============================================="
echo ""
echo -e "${YELLOW}👉 Go to GitHub Repository Settings > Secrets and variables > Actions${NC}"
echo -e "${YELLOW}👉 Create these Repository Secrets:${NC}"
echo ""

cat << EOF
# Azure Authentication Secrets
AZURE_CLIENT_ID=$APP_ID
AZURE_CLIENT_SECRET=$CLIENT_SECRET
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
AZURE_TENANT_ID=$TENANT_ID

# Terraform State Backend Secrets
TF_STATE_RG=$TF_STATE_RG
TF_STATE_SA=$TF_STATE_SA

# Application Secrets
JWT_SECRET=$JWT_SECRET
GOOGLE_AI_API_KEY=AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08

# Optional - MongoDB Atlas (setup separately)
MONGODB_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net
EOF

echo ""
echo -e "${BLUE}📝 NEXT STEPS:${NC}"
echo "1. Copy the secrets above to GitHub Repository Secrets"
echo "2. Create MongoDB Atlas FREE cluster (optional - can be done later)"
echo "3. Go to GitHub Actions and run 'Terraform Infra' workflow"
echo "4. Choose: Environment=dev, Action=plan, Branch=dev"
echo ""
echo -e "${GREEN}✅ Ready to run GitHub Terraform workflow!${NC}"
echo ""

# Save secrets to file for easy copying
SECRETS_FILE="github-secrets-$(date +%Y%m%d-%H%M%S).txt"
cat << EOF > $SECRETS_FILE
# PlayLearnSpark GitHub Secrets - $(date)
# Copy these to GitHub Repository Settings > Secrets and variables > Actions

AZURE_CLIENT_ID=$APP_ID
AZURE_CLIENT_SECRET=$CLIENT_SECRET
AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID
AZURE_TENANT_ID=$TENANT_ID
TF_STATE_RG=$TF_STATE_RG
TF_STATE_SA=$TF_STATE_SA
JWT_SECRET=$JWT_SECRET
GOOGLE_AI_API_KEY=AIzaSyAaWwtmv24UiNXEVsjwNLhNrlbTE6TEI08
MONGODB_ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net
EOF

echo -e "${BLUE}💾 Secrets also saved to: $SECRETS_FILE${NC}"
echo -e "${YELLOW}⚠️  Keep this file secure and delete after copying to GitHub!${NC}"
echo ""