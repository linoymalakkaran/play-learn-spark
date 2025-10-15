#!/bin/bash

# DNS Verification Script for playlearnspark.dpdns.org
# Run this periodically to check DNS propagation status

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="playlearnspark.dpdns.org"
VERIFICATION_ID="492ED0045D7AE1BBA344D6CE35F07A8F5ED11893EF1BEC08CF05E1568115D2A5"
FRONTEND_TARGET="play-learn-spark-frontend-dev-5b809751.azurewebsites.net"
BACKEND_TARGET="play-learn-spark-backend-dev-5b809751.azurewebsites.net"

echo -e "${BLUE}🔍 DNS Verification for $DOMAIN${NC}"
echo "========================================"
echo ""

# Function to check DNS record
check_dns_record() {
    local record_type=$1
    local record_name=$2
    local expected_value=$3
    local description=$4
    
    echo -e "${BLUE}Checking $description...${NC}"
    
    if [ "$record_type" = "TXT" ]; then
        result=$(nslookup -type=TXT "$record_name" 8.8.8.8 2>/dev/null | grep -i "text" | head -1 || echo "")
        if echo "$result" | grep -q "$expected_value"; then
            echo -e "${GREEN}✅ $description: FOUND${NC}"
            return 0
        else
            echo -e "${RED}❌ $description: NOT FOUND${NC}"
            echo "   Expected: $expected_value"
            return 1
        fi
    elif [ "$record_type" = "CNAME" ]; then
        result=$(nslookup "$record_name" 8.8.8.8 2>/dev/null | grep -i "canonical name" | head -1 || echo "")
        if echo "$result" | grep -q "$expected_value"; then
            echo -e "${GREEN}✅ $description: FOUND${NC}"
            echo "   Points to: $expected_value"
            return 0
        else
            echo -e "${RED}❌ $description: NOT FOUND${NC}"
            echo "   Should point to: $expected_value"
            return 1
        fi
    fi
}

# Check nameserver resolution
echo -e "${BLUE}Checking nameserver resolution...${NC}"
if nslookup "$DOMAIN" 8.8.8.8 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Domain nameservers are responding${NC}"
    ns_working=true
else
    echo -e "${YELLOW}⚠️  Domain nameservers not yet responding (DNS propagation in progress)${NC}"
    ns_working=false
fi

echo ""

if [ "$ns_working" = true ]; then
    # Check required DNS records
    echo -e "${BLUE}Checking DNS records...${NC}"
    echo ""
    
    # Check TXT record for domain verification
    check_dns_record "TXT" "asuid.$DOMAIN" "$VERIFICATION_ID" "Domain Verification TXT Record"
    echo ""
    
    # Check CNAME records
    check_dns_record "CNAME" "$DOMAIN" "$FRONTEND_TARGET" "Root Domain CNAME"
    echo ""
    
    check_dns_record "CNAME" "www.$DOMAIN" "$FRONTEND_TARGET" "WWW Subdomain CNAME"
    echo ""
    
    check_dns_record "CNAME" "api.$DOMAIN" "$BACKEND_TARGET" "API Subdomain CNAME"
    echo ""
    
    # Test HTTP connectivity
    echo -e "${BLUE}Testing HTTP connectivity...${NC}"
    
    for url in "https://$DOMAIN" "https://www.$DOMAIN" "https://api.$DOMAIN/health"; do
        if curl -s -I "$url" --connect-timeout 10 | head -1 | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✅ $url is responding${NC}"
        else
            echo -e "${YELLOW}⚠️  $url not yet responding${NC}"
        fi
    done
    
else
    echo -e "${YELLOW}⏳ Waiting for DNS propagation...${NC}"
    echo ""
    echo "This is normal for a newly registered domain."
    echo "DNS propagation can take 15 minutes to 24 hours."
    echo ""
    echo -e "${BLUE}What to do now:${NC}"
    echo "1. Configure DNS records in your dpdns.org control panel"
    echo "2. Add the required TXT and CNAME records"
    echo "3. Wait 15-30 minutes and run this script again"
    echo ""
    echo -e "${BLUE}Required DNS records:${NC}"
    echo ""
    echo "TXT Record:"
    echo "  Name: asuid.playlearnspark"
    echo "  Value: $VERIFICATION_ID"
    echo ""
    echo "CNAME Records:"
    echo "  @ → $FRONTEND_TARGET"
    echo "  www → $FRONTEND_TARGET"
    echo "  api → $BACKEND_TARGET"
fi

echo ""
echo -e "${BLUE}📊 Current Status Summary:${NC}"
echo "Domain: $DOMAIN"
echo "Registration: ✅ Complete"
echo "Nameservers: $([ "$ns_working" = true ] && echo "✅ Active" || echo "⏳ Propagating")"
echo "DNS Records: $([ "$ns_working" = true ] && echo "🔍 Check results above" || echo "⏳ Pending configuration")"
echo ""
echo "Next step: $([ "$ns_working" = true ] && echo "Run ./configure-domain.sh if all DNS records are configured" || echo "Configure DNS records and wait for propagation")"