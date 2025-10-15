#!/bin/bash

# Alternative Azure Setup Script using Container Instances
# This script creates Azure Container Instances instead of App Services to avoid quota issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="play-learn-spark"
ACR_NAME="playlearnspark"
LOCATION="eastus"

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

# Create Container Instances for hosting
create_container_instances() {
    print_status "Creating Azure Container Instances..."
    
    # Create production backend container instance
    az container create \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --name "${PROJECT_NAME}-backend-prod" \
        --image "nginx:alpine" \
        --os-type Linux \
        --cpu 1 --memory 1 \
        --ports 3001 \
        --dns-name-label "${PROJECT_NAME}-backend-prod" \
        --environment-variables NODE_ENV=production
    
    # Create production frontend container instance
    az container create \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --name "${PROJECT_NAME}-frontend-prod" \
        --image "nginx:alpine" \
        --os-type Linux \
        --cpu 1 --memory 1 \
        --ports 80 \
        --dns-name-label "${PROJECT_NAME}-frontend-prod" \
        --environment-variables NODE_ENV=production
    
    # Create development backend container instance
    az container create \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --name "${PROJECT_NAME}-backend-dev" \
        --image "nginx:alpine" \
        --os-type Linux \
        --cpu 0.5 --memory 0.5 \
        --ports 3001 \
        --dns-name-label "${PROJECT_NAME}-backend-dev" \
        --environment-variables NODE_ENV=development
    
    # Create development frontend container instance
    az container create \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --name "${PROJECT_NAME}-frontend-dev" \
        --image "nginx:alpine" \
        --os-type Linux \
        --cpu 0.5 --memory 0.5 \
        --ports 80 \
        --dns-name-label "${PROJECT_NAME}-frontend-dev" \
        --environment-variables NODE_ENV=development
    
    print_success "Container Instances created"
}

# Get service principal credentials
get_service_principal_creds() {
    print_status "Getting service principal credentials..."
    
    SP_APP_ID=$(az ad sp list --display-name "sp-${PROJECT_NAME}-github" --query "[0].appId" --output tsv)
    TENANT_ID=$(az account show --query tenantId --output tsv)
    SUBSCRIPTION_ID=$(az account show --query id --output tsv)
    
    if [ -n "$SP_APP_ID" ] && [ "$SP_APP_ID" != "null" ]; then
        print_success "Service principal found: $SP_APP_ID"
        
        print_warning "Add this to GitHub Secrets as 'AZURE_CREDENTIALS':"
        echo "{"
        echo "  \"clientId\": \"$SP_APP_ID\","
        echo "  \"clientSecret\": \"[YOUR_CLIENT_SECRET_FROM_CREATION]\","
        echo "  \"subscriptionId\": \"$SUBSCRIPTION_ID\","
        echo "  \"tenantId\": \"$TENANT_ID\""
        echo "}"
        echo ""
        print_warning "Note: You'll need the client secret from when the service principal was created."
    else
        print_error "Service principal not found. Creating new one..."
        
        SP_OUTPUT=$(az ad sp create-for-rbac \
            --name "sp-${PROJECT_NAME}-github" \
            --role "Contributor" \
            --scopes "/subscriptions/$SUBSCRIPTION_ID" \
            --sdk-auth)
        
        print_success "New service principal created!"
        print_warning "Add this to GitHub Secrets as 'AZURE_CREDENTIALS':"
        echo "$SP_OUTPUT"
    fi
}

# Display URLs
display_urls() {
    print_success "Setup completed!"
    echo ""
    echo "🔗 Your application URLs will be:"
    echo "├── Production Frontend: https://${PROJECT_NAME}-frontend-prod.${LOCATION}.azurecontainer.io"
    echo "├── Production Backend:  https://${PROJECT_NAME}-backend-prod.${LOCATION}.azurecontainer.io:3001"
    echo "├── Dev Frontend:        https://${PROJECT_NAME}-frontend-dev.${LOCATION}.azurecontainer.io"
    echo "└── Dev Backend:         https://${PROJECT_NAME}-backend-dev.${LOCATION}.azurecontainer.io:3001"
    echo ""
    echo "📦 Container Registry: ${ACR_NAME}.azurecr.io"
}

# Main execution
main() {
    echo "🚀 Alternative Azure Setup using Container Instances"
    echo "===================================================="
    echo ""
    
    create_container_instances
    get_service_principal_creds
    display_urls
}

main "$@"