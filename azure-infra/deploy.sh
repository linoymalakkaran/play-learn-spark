#!/bin/bash

# Play Learn Spark - Azure Deployment Script
# This script builds and deploys both frontend and backend applications to Azure App Service

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AZURE_INFRA_DIR="$SCRIPT_DIR"

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

# Function to check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command -v az &> /dev/null; then
        missing_tools+=("azure-cli")
    fi
    
    if ! command -v terraform &> /dev/null; then
        missing_tools+=("terraform")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and run the script again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to login to Azure
azure_login() {
    print_status "Checking Azure login status..."
    
    if ! az account show &> /dev/null; then
        print_status "Not logged in to Azure. Please log in..."
        az login
    else
        print_success "Already logged in to Azure"
        az account show --query "{name:name, id:id}" --output table
    fi
}

# Function to initialize and apply Terraform
deploy_infrastructure() {
    print_status "Deploying Azure infrastructure with Terraform..."
    
    cd "$AZURE_INFRA_DIR"
    
    # Check if terraform.tfvars exists
    if [ ! -f "terraform.tfvars" ]; then
        print_warning "terraform.tfvars not found. Creating from example..."
        cp terraform.tfvars.example terraform.tfvars
        print_warning "Please edit terraform.tfvars with your desired configuration"
        print_warning "Press any key to continue after editing terraform.tfvars..."
        read -n 1 -s
    fi
    
    # Initialize Terraform
    print_status "Initializing Terraform..."
    terraform init
    
    # Plan the deployment
    print_status "Planning Terraform deployment..."
    terraform plan -out=tfplan
    
    # Apply the deployment
    print_status "Applying Terraform deployment..."
    terraform apply tfplan
    
    print_success "Infrastructure deployment completed"
    
    # Get outputs
    print_status "Getting deployment outputs..."
    terraform output -json > terraform-outputs.json
    
    # Extract key values
    REGISTRY_NAME=$(terraform output -raw container_registry_name)
    REGISTRY_SERVER=$(terraform output -raw container_registry_login_server)
    FRONTEND_APP=$(terraform output -raw frontend_app_name)
    BACKEND_APP=$(terraform output -raw backend_app_name)
    
    export REGISTRY_NAME REGISTRY_SERVER FRONTEND_APP BACKEND_APP
    
    print_success "Infrastructure outputs saved to terraform-outputs.json"
}

# Function to build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    cd "$PROJECT_ROOT"
    
    # Login to Azure Container Registry
    print_status "Logging in to Azure Container Registry..."
    az acr login --name "$REGISTRY_NAME"
    
    # Build and push frontend image
    print_status "Building frontend Docker image..."
    docker build -t "$REGISTRY_SERVER/play-learn-spark-frontend:latest" .
    
    print_status "Pushing frontend Docker image..."
    docker push "$REGISTRY_SERVER/play-learn-spark-frontend:latest"
    
    # Build and push backend image
    print_status "Building backend Docker image..."
    cd server
    docker build -t "$REGISTRY_SERVER/play-learn-spark-backend:latest" .
    
    print_status "Pushing backend Docker image..."
    docker push "$REGISTRY_SERVER/play-learn-spark-backend:latest"
    
    cd "$PROJECT_ROOT"
    print_success "Docker images built and pushed successfully"
}

# Function to update App Service configurations
update_app_services() {
    print_status "Updating App Service configurations..."
    
    # Update frontend app service
    print_status "Updating frontend App Service..."
    az webapp config container set \
        --name "$FRONTEND_APP" \
        --resource-group "$(terraform -chdir="$AZURE_INFRA_DIR" output -raw resource_group_name)" \
        --docker-custom-image-name "$REGISTRY_SERVER/play-learn-spark-frontend:latest"
    
    # Update backend app service
    print_status "Updating backend App Service..."
    az webapp config container set \
        --name "$BACKEND_APP" \
        --resource-group "$(terraform -chdir="$AZURE_INFRA_DIR" output -raw resource_group_name)" \
        --docker-custom-image-name "$REGISTRY_SERVER/play-learn-spark-backend:latest"
    
    print_success "App Service configurations updated"
}

# Function to restart App Services
restart_app_services() {
    print_status "Restarting App Services..."
    
    RESOURCE_GROUP="$(terraform -chdir="$AZURE_INFRA_DIR" output -raw resource_group_name)"
    
    # Restart backend first
    print_status "Restarting backend App Service..."
    az webapp restart --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP"
    
    # Wait a bit for backend to start
    sleep 10
    
    # Restart frontend
    print_status "Restarting frontend App Service..."
    az webapp restart --name "$FRONTEND_APP" --resource-group "$RESOURCE_GROUP"
    
    print_success "App Services restarted"
}

# Function to display deployment information
display_deployment_info() {
    print_success "Deployment completed successfully!"
    echo
    echo "=== Deployment Information ==="
    echo "Frontend URL: $(terraform -chdir="$AZURE_INFRA_DIR" output -raw frontend_app_url)"
    echo "Backend URL: $(terraform -chdir="$AZURE_INFRA_DIR" output -raw backend_app_url)"
    echo "Resource Group: $(terraform -chdir="$AZURE_INFRA_DIR" output -raw resource_group_name)"
    echo "Container Registry: $(terraform -chdir="$AZURE_INFRA_DIR" output -raw container_registry_name)"
    echo
    echo "=== Next Steps ==="
    echo "1. Visit the frontend URL to test the application"
    echo "2. Check App Service logs if there are any issues"
    echo "3. Monitor Application Insights for performance metrics"
    echo
}

# Main deployment function
main() {
    print_status "Starting Play Learn Spark deployment to Azure..."
    
    check_prerequisites
    azure_login
    deploy_infrastructure
    build_and_push_images
    update_app_services
    restart_app_services
    display_deployment_info
    
    print_success "Deployment completed successfully!"
}

# Parse command line arguments
case "${1:-}" in
    "infra")
        print_status "Deploying infrastructure only..."
        check_prerequisites
        azure_login
        deploy_infrastructure
        ;;
    "images")
        print_status "Building and pushing images only..."
        check_prerequisites
        azure_login
        # Load existing outputs
        if [ -f "$AZURE_INFRA_DIR/terraform-outputs.json" ]; then
            cd "$AZURE_INFRA_DIR"
            REGISTRY_NAME=$(terraform output -raw container_registry_name)
            REGISTRY_SERVER=$(terraform output -raw container_registry_login_server)
            export REGISTRY_NAME REGISTRY_SERVER
            cd "$PROJECT_ROOT"
            build_and_push_images
        else
            print_error "Infrastructure not deployed. Run './deploy.sh infra' first."
            exit 1
        fi
        ;;
    "update")
        print_status "Updating App Services only..."
        check_prerequisites
        azure_login
        if [ -f "$AZURE_INFRA_DIR/terraform-outputs.json" ]; then
            cd "$AZURE_INFRA_DIR"
            FRONTEND_APP=$(terraform output -raw frontend_app_name)
            BACKEND_APP=$(terraform output -raw backend_app_name)
            REGISTRY_SERVER=$(terraform output -raw container_registry_login_server)
            export FRONTEND_APP BACKEND_APP REGISTRY_SERVER
            cd "$PROJECT_ROOT"
            update_app_services
            restart_app_services
        else
            print_error "Infrastructure not deployed. Run './deploy.sh infra' first."
            exit 1
        fi
        ;;
    "destroy")
        print_warning "This will destroy all Azure resources. Are you sure? (y/N)"
        read -r confirmation
        if [[ $confirmation == [yY] || $confirmation == [yY][eE][sS] ]]; then
            print_status "Destroying infrastructure..."
            cd "$AZURE_INFRA_DIR"
            terraform destroy
            print_success "Infrastructure destroyed"
        else
            print_status "Destruction cancelled"
        fi
        ;;
    "help"|"-h"|"--help")
        echo "Play Learn Spark Azure Deployment Script"
        echo
        echo "Usage: $0 [command]"
        echo
        echo "Commands:"
        echo "  (no args)  - Full deployment (infrastructure + images + update)"
        echo "  infra      - Deploy infrastructure only"
        echo "  images     - Build and push images only"
        echo "  update     - Update App Services only"
        echo "  destroy    - Destroy all Azure resources"
        echo "  help       - Show this help message"
        echo
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        print_error "Use '$0 help' to see available commands"
        exit 1
        ;;
esac