# DNS Configuration for playlearnspark.dpdns.org

## 🎉 Domain Successfully Registered!

**Domain**: playlearnspark.dpdns.org
**Registration Date**: October 15, 2025
**Expire Date**: October 15, 2026
**Administrator**: Linoy Pappachan Malakkaran (playlearnspark)

## 📋 Required DNS Records Configuration

You need to add DNS records in your dpdns.org domain management panel. Here are the exact records to configure:

### **Step 1: Domain Verification Record (CRITICAL)**
```
Type: TXT
Name: asuid.playlearnspark
Value: 492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5
TTL: 3600
```

### **Step 2: Frontend Website Records**
```
Type: CNAME
Name: @
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
TTL: 3600

Type: CNAME
Name: www
Value: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
TTL: 3600
```

### **Step 3: Backend API Record**
```
Type: CNAME
Name: api
Value: play-learn-spark-backend-dev-5b809751.azurewebsites.net
TTL: 3600
```

## 🔧 How to Add These Records

1. **Login to your dpdns.org control panel**
2. **Navigate to DNS Management** for playlearnspark.dpdns.org
3. **Add each record one by one** using the details above
4. **Save/Update** the configuration
5. **Wait 15-30 minutes** for DNS propagation

## ⚠️ Important Notes

- **TXT Record is REQUIRED FIRST** - Azure needs this to verify domain ownership
- **Use exact values** - Any typos will prevent the domain from working
- **DNS propagation takes time** - Allow up to 24 hours for full propagation
- **Test after each step** - Verify records are working before proceeding

## 🧪 Testing DNS Records

After adding the records, test them with these commands:

```bash
# Test TXT record (domain verification)
nslookup -type=TXT asuid.playlearnspark.dpdns.org

# Test CNAME records
nslookup playlearnspark.dpdns.org
nslookup www.playlearnspark.dpdns.org
nslookup api.playlearnspark.dpdns.org
```

## 🚀 Next Steps After DNS Configuration

Once DNS records are propagated (usually 15-30 minutes), run:

```bash
cd azure-infra
./configure-domain.sh
```

This will:
- Add custom domains to Azure App Services
- Create SSL certificates
- Update CORS settings
- Configure application settings

## 📊 Expected Final URLs

- **Main Website**: https://playlearnspark.dpdns.org
- **WWW Redirect**: https://www.playlearnspark.dpdns.org
- **API Backend**: https://api.playlearnspark.dpdns.org/health

---

**🎯 Current Status**: Domain registered ✅ → DNS configuration needed ⏳ → Azure configuration pending ⏳