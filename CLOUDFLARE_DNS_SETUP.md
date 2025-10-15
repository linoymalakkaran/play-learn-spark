# Cloudflare DNS Setup Guide for playlearnspark.dpdns.org

## 🎯 Current Status: Cloudflare Setup Complete!

You're now in Cloudflare DNS management for `playlearnspark.dpdns.org`. Perfect! Now we need to add the DNS records to connect your domain to your Azure App Services.

## 📋 **DNS Records to Add in Cloudflare**

Click "**Add record**" for each of these records:

### **1. Domain Verification (TXT Record)**
```
Type: TXT
Name: asuid.playlearnspark
Content: 492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5
Proxy status: DNS only (gray cloud)
TTL: Auto
```

### **2. Root Domain (CNAME Record)**
```
Type: CNAME
Name: @
Content: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

### **3. WWW Subdomain (CNAME Record)**
```
Type: CNAME
Name: www
Content: play-learn-spark-frontend-dev-5b809751.azurewebsites.net
Proxy status: Proxied (orange cloud) ✅
TTL: Auto
```

### **4. API Subdomain (CNAME Record)**
```
Type: CNAME
Name: api
Content: play-learn-spark-backend-dev-5b809751.azurewebsites.net
Proxy status: DNS only (gray cloud)
TTL: Auto
```

## 🔧 **Step-by-Step Instructions:**

### **Step 1: Add TXT Record (Domain Verification)**
1. Click "**+ Add record**"
2. Select **Type**: `TXT`
3. **Name**: `asuid.playlearnspark`
4. **Content**: `492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5`
5. **Proxy status**: Gray cloud (DNS only)
6. Click "**Save**"

### **Step 2: Add Root Domain CNAME**
1. Click "**+ Add record**"
2. Select **Type**: `CNAME`
3. **Name**: `@` (this represents the root domain)
4. **Target**: `play-learn-spark-frontend-dev-5b809751.azurewebsites.net`
5. **Proxy status**: Orange cloud (Proxied) ✅
6. Click "**Save**"

### **Step 3: Add WWW Subdomain CNAME**
1. Click "**+ Add record**"
2. Select **Type**: `CNAME`
3. **Name**: `www`
4. **Target**: `play-learn-spark-frontend-dev-5b809751.azurewebsites.net`
5. **Proxy status**: Orange cloud (Proxied) ✅
6. Click "**Save**"

### **Step 4: Add API Subdomain CNAME**
1. Click "**+ Add record**"
2. Select **Type**: `CNAME`
3. **Name**: `api`
4. **Target**: `play-learn-spark-backend-dev-5b809751.azurewebsites.net`
5. **Proxy status**: Gray cloud (DNS only)
6. Click "**Save**"

## ⚡ **Important Notes:**

- **Orange Cloud (Proxied)**: Use for frontend (gives you CDN, caching, SSL)
- **Gray Cloud (DNS only)**: Use for API and TXT records (direct connection)
- **Exact values**: Copy the values exactly as shown above
- **Case sensitive**: Azure hostnames are case-sensitive

## 🧪 **After Adding Records:**

1. **Wait 5-10 minutes** for DNS propagation
2. **Test the DNS setup**:
   ```bash
   ./check-dns.sh
   ```
3. **When DNS shows ✅**, run Azure configuration:
   ```bash
   ./configure-domain.sh
   ```

## 📊 **Expected Result:**

After adding all 4 records, your Cloudflare DNS table should show:

| Type  | Name                | Content                                           | Proxy |
|-------|---------------------|---------------------------------------------------|-------|
| TXT   | asuid.playlearnspark| 492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5 | DNS   |
| CNAME | @                   | play-learn-spark-frontend-dev-5b809751.azurewebsites.net | Proxied |
| CNAME | www                 | play-learn-spark-frontend-dev-5b809751.azurewebsites.net | Proxied |
| CNAME | api                 | play-learn-spark-backend-dev-5b809751.azurewebsites.net  | DNS   |

## 🎉 **Final URLs:**

- **Main Website**: https://playlearnspark.dpdns.org
- **WWW**: https://www.playlearnspark.dpdns.org
- **API**: https://api.playlearnspark.dpdns.org/health

---

**🚀 Start adding the DNS records now, one by one!**