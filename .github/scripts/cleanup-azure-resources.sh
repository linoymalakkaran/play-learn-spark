#!/bin/bash

# Azure Cleanup Script for Play Learn Spark CI/CD Pipeline
# This script removes all Azure resources created for the project

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
        print_error "Azure CLI is not installed."
        exit 1
    fi
    
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi
    
    print_success "Azure CLI is ready"
}

# Function to delete resource groups
delete_resource_groups() {
    print_status "Deleting resource groups..."
    
    RESOURCE_GROUPS=("rg-${PROJECT_NAME}-prod" "rg-${PROJECT_NAME}-dev")
    
    for rg in "${RESOURCE_GROUPS[@]}"; do
        if az group exists --name "$rg"; then
            print_status "Deleting resource group: $rg"
            az group delete --name "$rg" --yes --no-wait
            print_success "Resource group '$rg' deletion initiated"
        else
            print_warning "Resource group '$rg' does not exist"
        fi
    done
}

# Function to delete service principal
delete_service_principal() {
    print_status "Deleting service principal..."
    
    SP_NAME="sp-${PROJECT_NAME}-github"
    
    # Get service principal ID
    SP_ID=$(az ad sp list --display-name "$SP_NAME" --query "[0].appId" --output tsv 2>/dev/null || echo "")
    
    if [ -n "$SP_ID" ] && [ "$SP_ID" != "null" ]; then
        az ad sp delete --id "$SP_ID"
        print_success "Service principal '$SP_NAME' deleted"
    else
        print_warning "Service principal '$SP_NAME' not found"
    fi
}

# Function to clean up container images (optional)
clean_container_images() {
    print_status "Checking for container images to clean up..."
    
    if az acr repository list --name "$ACR_NAME" --output table 2>/dev/null; then
        print_warning "Container Registry '$ACR_NAME' still contains images."
        print_warning "These will be deleted when the resource group is deleted."
        print_warning "If you want to keep the images, export them before proceeding."
    else
        print_status "No container registry found or no images to clean up"
    fi
}

# Function to display what will be deleted
display_deletion_plan() {
    echo "🗑️  Deletion Plan:"
    echo "=================="
    echo ""
    echo "The following resources will be PERMANENTLY deleted:"
    echo ""
    echo "📦 Resource Groups (and all contained resources):"
    echo "├── rg-${PROJECT_NAME}-prod"
    echo "│   ├── Container Registry: ${ACR_NAME}"
    echo "│   ├── App Service Plan: plan-${PROJECT_NAME}-prod"
    echo "│   ├── Web Apps:"
    echo "│   │   ├── ${PROJECT_NAME}-backend-prod"
    echo "│   │   └── ${PROJECT_NAME}-frontend-prod"
    echo "│   └── Application Insights: ${PROJECT_NAME}-insights-prod"
    echo "│"
    echo "└── rg-${PROJECT_NAME}-dev"
    echo "    ├── App Service Plan: plan-${PROJECT_NAME}-dev"
    echo "    ├── Web Apps:"
    echo "    │   ├── ${PROJECT_NAME}-backend-dev"
    echo "    │   └── ${PROJECT_NAME}-frontend-dev"
    echo "    └── Application Insights: ${PROJECT_NAME}-insights-dev"
    echo ""
    echo "🔐 Service Principal:"
    echo "└── sp-${PROJECT_NAME}-github"
    echo ""
    echo "⚠️  WARNING: This action cannot be undone!"
    echo "⚠️  All data, configurations, and deployments will be lost!"
    echo ""
}

# Function to confirm deletion
confirm_deletion() {
    echo "Are you absolutely sure you want to delete all resources?"
    echo "Type 'DELETE' in uppercase to confirm:"
    read -r confirmation
    
    if [ "$confirmation" != "DELETE" ]; then
        print_warning "Deletion cancelled. No resources were deleted."
        exit 0
    fi
    
    echo ""
    print_warning "Starting deletion process..."
    echo "This may take several minutes to complete."
    echo ""
}

# Function to monitor deletion progress
monitor_deletion() {
    print_status "Monitoring deletion progress..."
    
    RESOURCE_GROUPS=("rg-${PROJECT_NAME}-prod" "rg-${PROJECT_NAME}-dev")
    
    while true; do
        all_deleted=true
        
        for rg in "${RESOURCE_GROUPS[@]}"; do
            if az group exists --name "$rg" 2>/dev/null; then
                all_deleted=false
                print_status "Still deleting: $rg"
            fi
        done
        
        if $all_deleted; then
            break
        fi
        
        sleep 30
    done
    
    print_success "All resource groups have been deleted"
}

# Function to verify cleanup
verify_cleanup() {
    print_status "Verifying cleanup..."
    
    RESOURCE_GROUPS=("rg-${PROJECT_NAME}-prod" "rg-${PROJECT_NAME}-dev")
    cleanup_complete=true
    
    for rg in "${RESOURCE_GROUPS[@]}"; do
        if az group exists --name "$rg" 2>/dev/null; then
            print_error "Resource group '$rg' still exists"
            cleanup_complete=false
        fi
    done
    
    # Check service principal
    SP_ID=$(az ad sp list --display-name "sp-${PROJECT_NAME}-github" --query "[0].appId" --output tsv 2>/dev/null || echo "")
    if [ -n "$SP_ID" ] && [ "$SP_ID" != "null" ]; then
        print_error "Service principal still exists"
        cleanup_complete=false
    fi
    
    if $cleanup_complete; then
        print_success "Cleanup verification complete - all resources removed"
    else
        print_error "Cleanup verification failed - some resources may still exist"
        exit 1
    fi
}

# Function to display final summary
display_cleanup_summary() {
    print_success "Azure cleanup completed successfully!"
    echo ""
    echo "✅ Deleted Resources:"
    echo "├── All resource groups and contained resources"
    echo "├── Service principal for GitHub Actions"
    echo "└── Role assignments and permissions"
    echo ""
    echo "📝 Manual Cleanup Required:"
    echo "├── Remove 'AZURE_CREDENTIALS' from GitHub Secrets"
    echo "├── Delete any local Terraform state files (if used)"
    echo "└── Remove any cached container images locally"
    echo ""
    echo "🔄 If you want to redeploy:"
    echo "└── Run the setup-azure-resources.sh script again"
}

# Main execution
main() {
    echo "🗑️  Azure Cleanup Script for Play Learn Spark CI/CD Pipeline"
    echo "=============================================================="
    echo ""
    
    check_azure_cli
    display_deletion_plan
    confirm_deletion
    clean_container_images
    delete_resource_groups
    delete_service_principal
    
    print_status "Waiting for resources to be fully deleted..."
    monitor_deletion
    verify_cleanup
    display_cleanup_summary
}

# Run main function with error handling
main "$@" || {
    print_error "Cleanup script failed!"
    echo "Some resources may not have been deleted."
    echo "Please check the Azure Portal and clean up manually if needed."
    exit 1
}