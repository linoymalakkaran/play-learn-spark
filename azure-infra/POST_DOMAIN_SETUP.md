# Post-Domain Registration Configuration Guide
## playlearnspark.dpdns.org → Azure App Service

After registering your domain **playlearnspark.dpdns.org**, follow these step-by-step instructions to configure it with your Azure deployment.

---

## 📋 **Your Azure Deployment Details**

**✅ Current Status:**
- **Frontend App**: `play-learn-spark-frontend-dev-5b809751`
- **Backend App**: `play-learn-spark-backend-dev-5b809751`
- **Resource Group**: `play-learn-spark-dev-rg`
- **Domain Verification ID**: `492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5`

---

## 🔧 **Step 1: Configure DNS Records**

Once your domain is registered, log in to your dpdns.org control panel and add these DNS records:

### **Required DNS Records:**

```bash
# Domain Verification (REQUIRED FIRST)
Type: TXT
Name: asuid.playlearnspark
Value: 492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5
TTL: 3600

# Frontend Domain (Main Website)
Type: CNAME
Name: @
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
TTL: 3600

# WWW Subdomain
Type: CNAME
Name: www
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
TTL: 3600

# API Subdomain (Backend)
Type: CNAME
Name: api
Value: play-learn-spark-backend-dev-5b809751.azurewebsites.net
TTL: 3600
```

---

## 🚀 **Step 2: Add Custom Domains to Azure**

### **Frontend Domain Configuration:**

```bash
# Add custom domain to frontend
az webapp config hostname add \
  --webapp-name "play-learn-spark-frontend-dev-5b809751" \
  --resource-group "play-learn-spark-dev-rg" \
  --hostname "playlearnspark.dpdns.org"

# Add www subdomain
az webapp config hostname add \
  --webapp-name "play-learn-spark-frontend-dev-5b809751" \
  --resource-group "play-learn-spark-dev-rg" \
  --hostname "www.playlearnspark.dpdns.org"
```

### **Backend Domain Configuration:**

```bash
# Add API subdomain to backend
az webapp config hostname add \
  --webapp-name "play-learn-spark-backend-dev-5b809751" \
  --resource-group "play-learn-spark-dev-rg" \
  --hostname "api.playlearnspark.dpdns.org"
```

---

## 🔒 **Step 3: Enable SSL Certificates**

### **Create and bind SSL certificates:**

```bash
# Create managed certificate for frontend
az webapp config ssl create \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-frontend-dev-5b809751" \
  --hostname "playlearnspark.dpdns.org"

# Create managed certificate for www
az webapp config ssl create \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-frontend-dev-5b809751" \
  --hostname "www.playlearnspark.dpdns.org"

# Create managed certificate for API
az webapp config ssl create \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-backend-dev-5b809751" \
  --hostname "api.playlearnspark.dpdns.org"
```

---

## ⚙️ **Step 4: Update Backend CORS Configuration**

Update your backend's CORS settings to allow the new domain:

```bash
# Update CORS settings
az webapp cors add \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-backend-dev-5b809751" \
  --allowed-origins "https://playlearnspark.dpdns.org" "https://www.playlearnspark.dpdns.org"
```

---

## 🔄 **Step 5: Update Environment Variables**

Update your application configuration to use the new domain:

```bash
# Update frontend app settings
az webapp config appsettings set \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-frontend-dev-5b809751" \
  --settings "BACKEND_API_URL=https://api.playlearnspark.dpdns.org"

# Update backend CORS configuration
az webapp config appsettings set \
  --resource-group "play-learn-spark-dev-rg" \
  --name "play-learn-spark-backend-dev-5b809751" \
  --settings "CORS_ORIGIN=https://playlearnspark.dpdns.org,https://www.playlearnspark.dpdns.org"
```

---

## 🧪 **Step 6: Verification Commands**

After configuration, verify everything is working:

### **DNS Verification:**
```bash
# Check DNS propagation
nslookup playlearnspark.dpdns.org
nslookup www.playlearnspark.dpdns.org
nslookup api.playlearnspark.dpdns.org

# Check TXT record for domain verification
nslookup -type=TXT asuid.playlearnspark.dpdns.org
```

### **HTTPS Verification:**
```bash
# Test frontend
curl -I https://playlearnspark.dpdns.org
curl -I https://www.playlearnspark.dpdns.org

# Test backend API
curl -I https://api.playlearnspark.dpdns.org/health
```

### **Application Testing:**
```bash
# Test backend health
curl -s https://api.playlearnspark.dpdns.org/health | python -m json.tool

# Test Google AI integration (if configured)
curl -X POST https://api.playlearnspark.dpdns.org/api/ai/generate-activity \
  -H "Content-Type: application/json" \
  -d '{"topic":"colors","ageGroup":"3-4","language":"English","activityType":"colors","difficulty":"easy","provider":"google"}'
```

---

## ⚡ **Quick Setup Script**

Save this as `configure-domain.sh` and run after DNS propagation:

```bash
#!/bin/bash

echo "🔧 Configuring playlearnspark.dpdns.org with Azure..."

# Variables
RG="play-learn-spark-dev-rg"
FRONTEND_APP="play-learn-spark-frontend-dev-5b809751"
BACKEND_APP="play-learn-spark-backend-dev-5b809751"
DOMAIN="playlearnspark.dpdns.org"

# Add custom domains
echo "📝 Adding custom domains..."
az webapp config hostname add --webapp-name "$FRONTEND_APP" --resource-group "$RG" --hostname "$DOMAIN"
az webapp config hostname add --webapp-name "$FRONTEND_APP" --resource-group "$RG" --hostname "www.$DOMAIN"
az webapp config hostname add --webapp-name "$BACKEND_APP" --resource-group "$RG" --hostname "api.$DOMAIN"

# Enable SSL
echo "🔒 Enabling SSL certificates..."
az webapp config ssl create --resource-group "$RG" --name "$FRONTEND_APP" --hostname "$DOMAIN"
az webapp config ssl create --resource-group "$RG" --name "$FRONTEND_APP" --hostname "www.$DOMAIN"
az webapp config ssl create --resource-group "$RG" --name "$BACKEND_APP" --hostname "api.$DOMAIN"

# Update CORS
echo "🌐 Updating CORS settings..."
az webapp cors add --resource-group "$RG" --name "$BACKEND_APP" --allowed-origins "https://$DOMAIN" "https://www.$DOMAIN"

echo "✅ Configuration complete! Please test your domains."
```

---

## 📋 **Timeline & Checklist**

### **Immediate (After Domain Registration):**
- ✅ Add DNS records to dpdns.org control panel
- ✅ Wait for DNS propagation (1-24 hours)

### **After DNS Propagation:**
- ✅ Add custom domains to Azure App Services
- ✅ Enable SSL certificates
- ✅ Update CORS settings
- ✅ Update environment variables
- ✅ Test all endpoints

### **Final Verification:**
- ✅ Frontend: https://playlearnspark.dpdns.org
- ✅ WWW: https://www.playlearnspark.dpdns.org
- ✅ API: https://api.playlearnspark.dpdns.org/health
- ✅ SSL certificates working
- ✅ Application functioning correctly

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Domain not resolving**: Wait 24-48 hours for DNS propagation
2. **SSL certificate errors**: Ensure DNS records are correct first
3. **CORS errors**: Update backend CORS settings with new domain
4. **404 errors**: Check custom domain binding in Azure portal

### **Support Commands:**
```bash
# Check current domains
az webapp config hostname list --webapp-name "$FRONTEND_APP" --resource-group "$RG"

# Check SSL certificates
az webapp config ssl list --resource-group "$RG"

# Check app settings
az webapp config appsettings list --name "$BACKEND_APP" --resource-group "$RG"
```

---

**🎉 Your domain will be live at https://playlearnspark.dpdns.org once configuration is complete!**