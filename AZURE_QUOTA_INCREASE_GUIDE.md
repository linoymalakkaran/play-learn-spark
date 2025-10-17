# Azure Quota Increase Request Guide

## Current Issue
Your Azure subscription `e66854a4-af40-4da1-9a17-448539a75270` has **0 quota for Free VMs**, which prevents creating App Service Plans needed for hosting web applications.

## Step-by-Step Guide to Request Quota Increase

### 1. Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your account: `playlearnspark@outlook.com`

### 2. Navigate to Quotas
1. In the search bar at the top, type **"Quotas"**
2. Select **"Quotas"** from the results
3. Or navigate to **All services > Management + governance > Quotas**

### 3. Find App Service Quota
1. In the Quotas page, look for **"Service quotas"** tab
2. In the **"Service"** dropdown, select **"App Service"** or **"Compute"**
3. In the **"Region"** dropdown, select **"West US 2"** (our deployment region)
4. Look for quota named:
   - **"Free App Service Plans"** or
   - **"F1 Shared"** or 
   - **"Free VMs"**

### 4. Request Quota Increase
1. Click on the quota showing **Current limit: 0**
2. Click **"Request increase"** button
3. Fill out the support request form:

#### Support Request Details:
- **Summary**: "Request increase for Free App Service Plan quota"
- **Issue type**: "Service and subscription limits (quotas)"
- **Subscription**: Select your subscription
- **Quota type**: "App Service" or "Compute"
- **Location**: "West US 2"
- **SKU family**: "F1 Shared" or "Free"
- **New limit**: 1 (minimum needed for our deployment)

#### Business Justification:
```
I am deploying a learning application called "Play Learn Spark" which includes:
- Frontend: React application
- Backend: Node.js API
- Purpose: Educational/personal project for learning cloud deployment

I need 1 Free App Service Plan to host both applications using containerized deployment.
This is for development and learning purposes, not commercial use.
```

### 5. Submit and Track
1. Review your request details
2. Click **"Create"** to submit the support request
3. You'll receive a support ticket number
4. Track progress in **Support + troubleshooting > Support requests**

## Expected Timeline
- **Standard processing**: 1-3 business days
- **Expedited**: If urgent, mention this is for learning/development

## Alternative Deployment Options (While Waiting)

### Option 1: Use Azure Container Instances
We can modify our Terraform to use Azure Container Instances instead of App Services:
- Lower quota requirements
- Pay-per-second billing
- Good for development/testing

### Option 2: Use Different Azure Region
Try regions with potentially higher quotas:
- East US
- Central US
- North Europe
- West Europe

### Option 3: Use Different Subscription Type
Consider upgrading from "Free" to "Pay-as-you-go" which typically has higher default quotas.

## Contact Information
If you need assistance with the quota request:
- **Azure Support**: Available through Azure Portal
- **Community Support**: [Microsoft Q&A](https://docs.microsoft.com/en-us/answers/)

## Current Infrastructure Status
✅ **Successfully Created:**
- Resource Group: `play-learn-spark-prod-rg`
- Container Registry: `playlearnsparkprodacr57bbcde9.azurecr.io`
- Application Insights: For monitoring
- Log Analytics Workspace: For logs

❌ **Blocked by Quota:**
- App Service Plan (Free tier)
- Web Apps (Frontend & Backend)

## Next Steps After Quota Approval
1. Run `terraform apply` to complete infrastructure deployment
2. Set up GitHub Actions service principal
3. Configure CI/CD pipeline
4. Deploy applications