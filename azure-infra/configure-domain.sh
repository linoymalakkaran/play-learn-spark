#!/bin/bash

# Domain Configuration Script for playlearnspark.dpdns.org
# Run this after your domain DNS records have propagated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RG="play-learn-spark-dev-rg"
FRONTEND_APP="play-learn-spark-frontend-dev-5b809751"
BACKEND_APP="play-learn-spark-backend-dev-5b809751"
DOMAIN="playlearnspark.dpdns.org"

echo -e "${BLUE}🚀 Play Learn Spark Domain Configuration${NC}"
echo "========================================"
echo "Domain: $DOMAIN"
echo "Frontend App: $FRONTEND_APP"
echo "Backend App: $BACKEND_APP"
echo "Resource Group: $RG"
echo ""

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if logged in to Azure
print_status "Checking Azure login status..."
if ! az account show > /dev/null 2>&1; then
    print_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi
print_success "Azure login verified"

# Check DNS propagation
print_status "Checking DNS propagation for $DOMAIN..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    print_success "DNS records found for $DOMAIN"
else
    print_warning "DNS records not yet propagated. This script may fail."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Add custom domains
print_status "Adding custom domains to Azure App Services..."

echo "Adding $DOMAIN to frontend..."
if az webapp config hostname add --webapp-name "$FRONTEND_APP" --resource-group "$RG" --hostname "$DOMAIN" > /dev/null 2>&1; then
    print_success "Added $DOMAIN to frontend"
else
    print_error "Failed to add $DOMAIN to frontend"
fi

echo "Adding www.$DOMAIN to frontend..."
if az webapp config hostname add --webapp-name "$FRONTEND_APP" --resource-group "$RG" --hostname "www.$DOMAIN" > /dev/null 2>&1; then
    print_success "Added www.$DOMAIN to frontend"
else
    print_error "Failed to add www.$DOMAIN to frontend"
fi

echo "Adding api.$DOMAIN to backend..."
if az webapp config hostname add --webapp-name "$BACKEND_APP" --resource-group "$RG" --hostname "api.$DOMAIN" > /dev/null 2>&1; then
    print_success "Added api.$DOMAIN to backend"
else
    print_error "Failed to add api.$DOMAIN to backend"
fi

# Step 2: Enable SSL certificates
print_status "Creating SSL certificates..."

echo "Creating SSL certificate for $DOMAIN..."
if az webapp config ssl create --resource-group "$RG" --name "$FRONTEND_APP" --hostname "$DOMAIN" > /dev/null 2>&1; then
    print_success "SSL certificate created for $DOMAIN"
else
    print_warning "SSL certificate creation failed for $DOMAIN (may need time for DNS propagation)"
fi

echo "Creating SSL certificate for www.$DOMAIN..."
if az webapp config ssl create --resource-group "$RG" --name "$FRONTEND_APP" --hostname "www.$DOMAIN" > /dev/null 2>&1; then
    print_success "SSL certificate created for www.$DOMAIN"
else
    print_warning "SSL certificate creation failed for www.$DOMAIN"
fi

echo "Creating SSL certificate for api.$DOMAIN..."
if az webapp config ssl create --resource-group "$RG" --name "$BACKEND_APP" --hostname "api.$DOMAIN" > /dev/null 2>&1; then
    print_success "SSL certificate created for api.$DOMAIN"
else
    print_warning "SSL certificate creation failed for api.$DOMAIN"
fi

# Step 3: Update CORS settings
print_status "Updating CORS settings..."
if az webapp cors add --resource-group "$RG" --name "$BACKEND_APP" --allowed-origins "https://$DOMAIN" "https://www.$DOMAIN" > /dev/null 2>&1; then
    print_success "CORS settings updated"
else
    print_warning "CORS settings update failed"
fi

# Step 4: Update app settings
print_status "Updating application settings..."

echo "Updating frontend environment variables..."
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$FRONTEND_APP" \
  --settings "BACKEND_API_URL=https://api.$DOMAIN" > /dev/null 2>&1

echo "Updating backend environment variables..."
az webapp config appsettings set \
  --resource-group "$RG" \
  --name "$BACKEND_APP" \
  --settings "CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN" > /dev/null 2>&1

print_success "Application settings updated"

# Step 5: Verification
print_status "Performing verification tests..."

echo ""
echo "🧪 Testing domains..."

# Test DNS resolution
echo "Testing DNS resolution:"
for subdomain in "" "www." "api."; do
    domain_to_test="${subdomain}${DOMAIN}"
    if nslookup "$domain_to_test" > /dev/null 2>&1; then
        print_success "✅ $domain_to_test resolves correctly"
    else
        print_warning "⚠️  $domain_to_test DNS not yet propagated"
    fi
done

echo ""
echo "Testing HTTPS endpoints:"

# Test HTTPS endpoints
for url in "https://$DOMAIN" "https://www.$DOMAIN" "https://api.$DOMAIN/health"; do
    if curl -s -I "$url" | head -1 | grep -q "200\|301\|302"; then
        print_success "✅ $url is responding"
    else
        print_warning "⚠️  $url not yet responding (may need time)"
    fi
done

echo ""
echo -e "${GREEN}🎉 Domain configuration completed!${NC}"
echo ""
echo "📋 Summary:"
echo "• Frontend: https://$DOMAIN"
echo "• WWW: https://www.$DOMAIN"
echo "• API: https://api.$DOMAIN"
echo ""
echo "⏰ Note: SSL certificates and DNS propagation may take up to 24 hours to fully propagate."
echo ""
echo "🔍 Verification commands:"
echo "curl -I https://$DOMAIN"
echo "curl -I https://api.$DOMAIN/health"
echo ""
echo "📊 Monitor your deployment:"
echo "https://portal.azure.com/#@ebabonline.ae/resource/subscriptions/ae912782-989c-43e5-a227-2502f9499c0f/resourceGroups/$RG/overview"