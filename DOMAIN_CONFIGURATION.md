# Azure DNS Configuration for playlearnspark.dpdns.org

## 🌐 Domain Configuration Details

Based on your Azure App Service deployment, here are the DNS configuration details for your domain **playlearnspark.dpdns.org**:

### Current Azure App Service Details:
- **Frontend URL**: https://play-learn-spark-frontend-dev-5b809751.azurewebsites.net/
- **Backend URL**: https://play-learn-spark-backend-dev-5b809751.azurewebsites.net/
- **Resource Group**: Likely `play-learn-spark-dev-rg-[suffix]`

---

## 📋 Required Nameserver Configuration

For **playlearnspark.dpdns.org**, you'll need to configure the following:

### Azure App Service Nameservers:
Since you're using Azure App Service (not Azure DNS), you should use **CNAME records** instead of nameservers for domain mapping.

### Recommended DNS Configuration:

#### **Option 1: CNAME Records (Recommended for App Service)**
```
Type: CNAME
Name: @ (root domain)
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net

Type: CNAME  
Name: www
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net

Type: CNAME
Name: api
Value: play-learn-spark-backend-dev-5b809751.azurewebsites.net
```

#### **Option 2: If Nameservers Are Required**
For dpdns.org, you can use these general DNS nameservers:

```
Name Server 1 (NS1): ns1.dpdns.org
Name Server 2 (NS2): ns2.dpdns.org  
Name Server 3 (NS3): ns3.dpdns.org
Name Server 4 (NS4): ns4.dpdns.org
Name Server 5 (NS5): ns5.dpdns.org
Name Server 6 (NS6): ns6.dpdns.org
Name Server 7 (NS7): ns7.dpdns.org
Name Server 8 (NS8): ns8.dpdns.org
```

---

## 🔧 Azure App Service Custom Domain Setup

### Step 1: Get Domain Verification ID
Run this command to get your custom domain verification ID:
```bash
az webapp show --name "play-learn-spark-frontend-dev-5b809751" --resource-group [YOUR_RESOURCE_GROUP] --query "customDomainVerificationId" --output tsv
```

### Step 2: Add TXT Record for Verification
Add this TXT record to your domain:
```
Type: TXT
Name: asuid.playlearnspark
Value: [YOUR_CUSTOM_DOMAIN_VERIFICATION_ID]
```

### Step 3: Configure Custom Domain in Azure
1. Go to Azure Portal → App Services → your frontend app
2. Navigate to "Custom domains"
3. Click "Add custom domain"
4. Enter: `playlearnspark.dpdns.org`
5. Follow verification steps

---

## 🌟 Complete Domain Setup for Your Application

### Frontend Domain Configuration:
```
Primary Domain: playlearnspark.dpdns.org
CNAME Target: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
```

### API Subdomain Configuration:
```
API Domain: api.playlearnspark.dpdns.org
CNAME Target: play-learn-spark-backend-dev-5b809751.azurewebsites.net
```

### SSL Certificate:
Azure App Service provides free SSL certificates for custom domains. Enable this in:
- Azure Portal → App Service → TLS/SSL settings → Private Key Certificates

---

## 📝 Domain Registration Form Details

Based on your request, here are the details for the domain registration form:

```
Domain Name: playlearnspark.dpdns.org
Administrator: playlearnspark
Price: Always free (365 days registration)

Name Server 1 (NS1): ns1.dpdns.org
Name Server 2 (NS2): ns2.dpdns.org
Name Server 3 (NS3): ns3.dpdns.org
Name Server 4 (NS4): ns4.dpdns.org
Name Server 5 (NS5): ns5.dpdns.org
Name Server 6 (NS6): ns6.dpdns.org
Name Server 7 (NS7): ns7.dpdns.org
Name Server 8 (NS8): ns8.dpdns.org
```

---

## ⚠️ Important Notes

1. **Propagation Time**: DNS changes can take 24-48 hours to propagate globally
2. **SSL Setup**: Configure SSL after domain verification is complete
3. **CORS Configuration**: Update your backend CORS settings to include the new domain
4. **Environment Variables**: Update any hardcoded URLs in your application

---

## 🔍 Verification Commands

After domain setup, verify with these commands:
```bash
# Check domain resolution
nslookup playlearnspark.dpdns.org

# Test HTTPS access
curl -I https://playlearnspark.dpdns.org

# Test API access
curl -I https://api.playlearnspark.dpdns.org/health
```

---

## 📞 Next Steps

1. ✅ Complete domain registration with the nameserver details above
2. ✅ Wait for DNS propagation (24-48 hours)
3. ✅ Configure custom domain in Azure App Service
4. ✅ Enable SSL certificate
5. ✅ Update application CORS settings
6. ✅ Test the complete setup

**Your applications are already deployed and running successfully on Azure!** 🚀