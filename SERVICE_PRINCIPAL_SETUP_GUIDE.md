# Service Principal Setup Guide

## Manual Service Principal Creation

Since the Azure CLI service principal creation is failing due to permission issues, follow these manual steps:

### 1. Create Service Principal via Azure Portal

#### Step 1: Navigate to Azure Active Directory
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **"Azure Active Directory"** or **"Microsoft Entra ID"**
3. Select **Azure Active Directory**

#### Step 2: Create App Registration
1. In the left menu, click **"App registrations"**
2. Click **"+ New registration"**
3. Fill out the form:
   - **Name**: `play-learn-spark-github-actions`
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**: Leave blank
4. Click **"Register"**

#### Step 3: Create Client Secret
1. After creation, you'll be on the app's overview page
2. Copy the **Application (client) ID** - save this!
3. Copy the **Directory (tenant) ID** - save this!
4. In the left menu, click **"Certificates & secrets"**
5. Click **"+ New client secret"**
6. Add description: `GitHub Actions Secret`
7. Set expiration: `24 months` (recommended)
8. Click **"Add"**
9. **IMPORTANT**: Copy the **Value** immediately - save this! (You won't see it again)

#### Step 4: Assign Permissions
1. Go back to Azure Portal home
2. Search for **"Subscriptions"**
3. Click on your subscription: `Azure subscription 1`
4. In the left menu, click **"Access control (IAM)"**
5. Click **"+ Add"** → **"Add role assignment"**
6. **Role**: Select **"Contributor"**
7. **Assign access to**: "User, group, or service principal"
8. **Members**: Search for `play-learn-spark-github-actions` and select it
9. Click **"Review + assign"**

### 2. GitHub Secrets Configuration

You'll need these values for GitHub secrets:

```json
{
  "clientId": "<Application-client-ID>",
  "clientSecret": "<Client-secret-value>",
  "subscriptionId": "e66854a4-af40-4da1-9a17-448539a75270",
  "tenantId": "<Directory-tenant-ID>"
}
```

#### Add to GitHub Repository Secrets:
1. Go to your GitHub repository: https://github.com/linoymalakkaran/play-learn-spark
2. Click **Settings** tab
3. In left menu, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

Add these secrets:

**Secret 1: AZURE_CREDENTIALS**
```json
{
  "clientId": "<your-application-client-id>",
  "clientSecret": "<your-client-secret-value>",
  "subscriptionId": "e66854a4-af40-4da1-9a17-448539a75270",
  "tenantId": "<your-directory-tenant-id>"
}
```

**Secret 2: AZURE_CONTAINER_REGISTRY**
```
playlearnsparkprodacr57bbcde9.azurecr.io
```

**Secret 3: AZURE_RESOURCE_GROUP**
```
play-learn-spark-prod-rg
```

### 3. Test the Service Principal

Once created, test it using Azure CLI:

```bash
# Login with service principal
az login --service-principal \
  --username <application-client-id> \
  --password <client-secret-value> \
  --tenant <directory-tenant-id>

# Test access
az account show
az group list
```

### 4. Required Permissions for GitHub Actions

The service principal needs these permissions for our CI/CD pipeline:

✅ **Current Permissions (Contributor on Subscription):**
- Create/manage resources in resource groups
- Push to Azure Container Registry
- Manage App Services (when quota is resolved)
- Read/write to storage accounts

### 5. Alternative: Federated Identity (Recommended)

For better security, consider using Federated Identity instead of client secrets:

1. In App Registration, go to **"Certificates & secrets"**
2. Click **"Federated credentials"** tab
3. Click **"+ Add credential"**
4. **Federated credential scenario**: "GitHub Actions deploying Azure resources"
5. **Organization**: `linoymalakkaran`
6. **Repository**: `play-learn-spark`
7. **Entity type**: "Branch"
8. **GitHub branch name**: `prod`
9. **Name**: `play-learn-spark-prod-deployment`

Then use this in GitHub Actions instead of client secret:
```yaml
- uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

## Troubleshooting

### Common Issues:
1. **Service principal not found**: Wait 5-10 minutes after creation
2. **Permission denied**: Ensure Contributor role is assigned
3. **Authentication failed**: Double-check client ID, secret, and tenant ID

### Verification Commands:
```bash
# Check role assignments
az role assignment list --assignee <application-client-id>

# Test resource access
az group show --name play-learn-spark-prod-rg

# Test container registry access
az acr list --resource-group play-learn-spark-prod-rg
```