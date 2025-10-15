#!/bin/bash

# Azure Setup Script for Play Learn Spark CI/CD Pipeline
# This script creates the necessary Azure resources for the GitHub Actions deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUBSCRIPTION_ID=""
LOCATION="eastus"
PROJECT_NAME="play-learn-spark"
ACR_NAME="playlearnspark"

# Function to print colored output
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

# Function to check if Azure CLI is installed and logged in
check_azure_cli() {
    print_status "Checking Azure CLI..."
    
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI is not installed. Please install it first."
        echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    print_success "Azure CLI is ready"
}

# Function to get subscription ID
get_subscription() {
    if [ -z "$SUBSCRIPTION_ID" ]; then
        print_status "Getting current subscription..."
        SUBSCRIPTION_ID=$(az account show --query id --output tsv)
    fi
    
    print_status "Using subscription: $SUBSCRIPTION_ID"
}

# Function to create service principal
create_service_principal() {
    print_status "Creating service principal for GitHub Actions..."
    
    SP_NAME="sp-${PROJECT_NAME}-github"
    
    # Check if service principal already exists
    if az ad sp list --display-name "$SP_NAME" --query "[0].appId" --output tsv &> /dev/null; then
        print_warning "Service principal '$SP_NAME' already exists. Skipping creation."
        APP_ID=$(az ad sp list --display-name "$SP_NAME" --query "[0].appId" --output tsv)
    else
        # Create service principal
        SP_OUTPUT=$(az ad sp create-for-rbac \
            --name "$SP_NAME" \
            --role "Contributor" \
            --scopes "/subscriptions/$SUBSCRIPTION_ID" \
            --sdk-auth)
        
        APP_ID=$(echo "$SP_OUTPUT" | jq -r '.clientId')
        print_success "Service principal created: $APP_ID"
        
        print_warning "Add this to GitHub Secrets as 'AZURE_CREDENTIALS':"
        echo "$SP_OUTPUT"
        echo ""
    fi
    
    # Add additional roles for Container Registry
    print_status "Adding ACR roles to service principal..."
    az role assignment create \
        --assignee "$APP_ID" \
        --role "AcrPush" \
        --scope "/subscriptions/$SUBSCRIPTION_ID" || true
    
    az role assignment create \
        --assignee "$APP_ID" \
        --role "AcrPull" \
        --scope "/subscriptions/$SUBSCRIPTION_ID" || true
    
    print_success "Service principal configured with necessary permissions"
}

# Function to create resource groups
create_resource_groups() {
    print_status "Creating resource groups..."
    
    # Production resource group
    az group create \
        --name "rg-${PROJECT_NAME}-prod" \
        --location "$LOCATION" \
        --tags Environment=Production Project="$PROJECT_NAME"
    
    # Development resource group
    az group create \
        --name "rg-${PROJECT_NAME}-dev" \
        --location "$LOCATION" \
        --tags Environment=Development Project="$PROJECT_NAME"
    
    print_success "Resource groups created"
}

# Function to create Container Registry
create_container_registry() {
    print_status "Creating Azure Container Registry..."
    
    az acr create \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --name "$ACR_NAME" \
        --sku Standard \
        --admin-enabled true \
        --tags Project="$PROJECT_NAME"
    
    print_success "Container Registry created: $ACR_NAME"
}

# Function to create App Service Plans
create_app_service_plans() {
    print_status "Creating App Service Plans..."
    
    # Production App Service Plan
    az appservice plan create \
        --name "plan-${PROJECT_NAME}-prod" \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --sku P1v2 \
        --is-linux \
        --tags Environment=Production Project="$PROJECT_NAME"
    
    # Development App Service Plan
    az appservice plan create \
        --name "plan-${PROJECT_NAME}-dev" \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --sku B1 \
        --is-linux \
        --tags Environment=Development Project="$PROJECT_NAME"
    
    print_success "App Service Plans created"
}

# Function to create Web Apps
create_web_apps() {
    print_status "Creating Web Apps..."
    
    ACR_LOGIN_SERVER="${ACR_NAME}.azurecr.io"
    
    # Production Web Apps
    az webapp create \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --plan "plan-${PROJECT_NAME}-prod" \
        --name "${PROJECT_NAME}-backend-prod" \
        --deployment-container-image-name "${ACR_LOGIN_SERVER}/${PROJECT_NAME}-backend:latest" \
        --tags Environment=Production Project="$PROJECT_NAME" Component=Backend
    
    az webapp create \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --plan "plan-${PROJECT_NAME}-prod" \
        --name "${PROJECT_NAME}-frontend-prod" \
        --deployment-container-image-name "${ACR_LOGIN_SERVER}/${PROJECT_NAME}-frontend:latest" \
        --tags Environment=Production Project="$PROJECT_NAME" Component=Frontend
    
    # Development Web Apps
    az webapp create \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --plan "plan-${PROJECT_NAME}-dev" \
        --name "${PROJECT_NAME}-backend-dev" \
        --deployment-container-image-name "${ACR_LOGIN_SERVER}/${PROJECT_NAME}-backend:dev-latest" \
        --tags Environment=Development Project="$PROJECT_NAME" Component=Backend
    
    az webapp create \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --plan "plan-${PROJECT_NAME}-dev" \
        --name "${PROJECT_NAME}-frontend-dev" \
        --deployment-container-image-name "${ACR_LOGIN_SERVER}/${PROJECT_NAME}-frontend:dev-latest" \
        --tags Environment=Development Project="$PROJECT_NAME" Component=Frontend
    
    print_success "Web Apps created"
}

# Function to configure Web Apps
configure_web_apps() {
    print_status "Configuring Web Apps..."
    
    # Configure container settings and environment variables
    APPS=("${PROJECT_NAME}-backend-prod" "${PROJECT_NAME}-frontend-prod" "${PROJECT_NAME}-backend-dev" "${PROJECT_NAME}-frontend-dev")
    
    for app in "${APPS[@]}"; do
        if [[ $app == *"prod"* ]]; then
            RG="rg-${PROJECT_NAME}-prod"
        else
            RG="rg-${PROJECT_NAME}-dev"
        fi
        
        # Enable container logging
        az webapp log config \
            --name "$app" \
            --resource-group "$RG" \
            --docker-container-logging filesystem
        
        # Configure health check (if app supports it)
        if [[ $app == *"backend"* ]]; then
            az webapp config set \
                --name "$app" \
                --resource-group "$RG" \
                --health-check-path "/health" || true
        fi
        
        # Set continuous deployment
        az webapp deployment container config \
            --name "$app" \
            --resource-group "$RG" \
            --enable-cd true || true
    done
    
    print_success "Web Apps configured"
}

# Function to create Application Insights
create_app_insights() {
    print_status "Creating Application Insights..."
    
    # Production Application Insights
    az monitor app-insights component create \
        --app "${PROJECT_NAME}-insights-prod" \
        --location "$LOCATION" \
        --resource-group "rg-${PROJECT_NAME}-prod" \
        --tags Environment=Production Project="$PROJECT_NAME"
    
    # Development Application Insights
    az monitor app-insights component create \
        --app "${PROJECT_NAME}-insights-dev" \
        --location "$LOCATION" \
        --resource-group "rg-${PROJECT_NAME}-dev" \
        --tags Environment=Development Project="$PROJECT_NAME"
    
    print_success "Application Insights created"
}

# Function to display summary
display_summary() {
    print_success "Azure setup completed successfully!"
    echo ""
    echo "📋 Created Resources:"
    echo "├── Resource Groups:"
    echo "│   ├── rg-${PROJECT_NAME}-prod"
    echo "│   └── rg-${PROJECT_NAME}-dev"
    echo "├── Container Registry: ${ACR_NAME}"
    echo "├── App Service Plans:"
    echo "│   ├── plan-${PROJECT_NAME}-prod (P1v2)"
    echo "│   └── plan-${PROJECT_NAME}-dev (B1)"
    echo "├── Web Apps:"
    echo "│   ├── ${PROJECT_NAME}-backend-prod"
    echo "│   ├── ${PROJECT_NAME}-frontend-prod"
    echo "│   ├── ${PROJECT_NAME}-backend-dev"
    echo "│   └── ${PROJECT_NAME}-frontend-dev"
    echo "└── Application Insights:"
    echo "    ├── ${PROJECT_NAME}-insights-prod"
    echo "    └── ${PROJECT_NAME}-insights-dev"
    echo ""
    echo "🔗 Useful URLs:"
    echo "├── Production Frontend: https://${PROJECT_NAME}-frontend-prod.azurewebsites.net"
    echo "├── Production Backend:  https://${PROJECT_NAME}-backend-prod.azurewebsites.net"
    echo "├── Dev Frontend:        https://${PROJECT_NAME}-frontend-dev.azurewebsites.net"
    echo "└── Dev Backend:         https://${PROJECT_NAME}-backend-dev.azurewebsites.net"
    echo ""
    echo "⚙️  Next Steps:"
    echo "1. Add the service principal JSON to GitHub Secrets as 'AZURE_CREDENTIALS'"
    echo "2. Update workflow files with your resource names if different"
    echo "3. Create and push to 'prod' branch to trigger deployment"
    echo "4. Check the GitHub Actions PIPELINE_README.md for detailed instructions"
}

# Main execution
main() {
    echo "🚀 Azure Setup Script for Play Learn Spark CI/CD Pipeline"
    echo "=========================================================="
    echo ""
    
    # Confirm execution
    read -p "This script will create Azure resources. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    check_azure_cli
    get_subscription
    create_service_principal
    create_resource_groups
    create_container_registry
    create_app_service_plans
    create_web_apps
    configure_web_apps
    create_app_insights
    display_summary
}

# Run main function
main "$@"