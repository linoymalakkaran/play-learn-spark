# Service Principal Setup Guide

Since you don't have Azure AD admin privileges, here are your options:

## Option 1: Request Azure AD Admin to Create Service Principal

Ask your Azure AD administrator to run this command:

```bash
az ad sp create-for-rbac --name "sp-play-learn-spark-github" \
  --role "Contributor" \
  --scopes "/subscriptions/ae912782-989c-43e5-a227-2502f9499c0f" \
  --sdk-auth
```

## Option 2: Use Azure Portal (Manual)

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: "sp-play-learn-spark-github"
4. Click "Register"
5. Go to "Certificates & secrets" → "New client secret"
6. Copy the secret value (you won't see it again!)
7. Go to Subscriptions → Your subscription → Access control (IAM)
8. Click "Add role assignment"
9. Role: "Contributor"
10. Assign access to: "User, group, or service principal"
11. Select your app registration

## Option 3: Simplified GitHub Secrets (For Now)

For immediate testing, you can use your personal Azure CLI credentials:

```bash
# Get your current login info
az account show --sdk-auth
```

⚠️ **Warning**: This uses your personal credentials and should only be used for testing!

## Required GitHub Secrets

Add this to GitHub Repository → Settings → Secrets and variables → Actions:

**Secret Name**: `AZURE_CREDENTIALS`

**Value**:
```json
{
  "clientId": "your-service-principal-app-id",
  "clientSecret": "your-service-principal-secret",
  "subscriptionId": "ae912782-989c-43e5-a227-2502f9499c0f",
  "tenantId": "3b618463-9352-4fa4-a67c-112da2837c29"
}
```

## Your Current Working URLs

✅ **Backend**: https://play-learn-spark-backend-dev-uae.azurewebsites.net
✅ **Frontend**: https://play-learn-spark-frontend-dev-uae.azurewebsites.net
✅ **Container Registry**: playlearnspark.azurecr.io

## Next Steps

1. Get service principal credentials (options above)
2. Add to GitHub secrets
3. Test deployment by pushing to prod branch
4. Monitor in GitHub Actions tab