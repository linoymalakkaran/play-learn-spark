@echo off
REM Play Learn Spark - Azure Deployment Script for Windows
REM This script builds and deploys both frontend and backend applications to Azure App Service

setlocal enabledelayedexpansion

REM Configuration
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set AZURE_INFRA_DIR=%SCRIPT_DIR%

REM Function to print status messages
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to check if required tools are installed
:check_prerequisites
call :print_status "Checking prerequisites..."

where az >nul 2>nul
if %errorlevel% neq 0 (
    call :print_error "Azure CLI not found. Please install Azure CLI."
    exit /b 1
)

where terraform >nul 2>nul
if %errorlevel% neq 0 (
    call :print_error "Terraform not found. Please install Terraform."
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    call :print_error "Docker not found. Please install Docker."
    exit /b 1
)

call :print_success "All prerequisites are installed"
goto :eof

REM Function to login to Azure
:azure_login
call :print_status "Checking Azure login status..."

az account show >nul 2>nul
if %errorlevel% neq 0 (
    call :print_status "Not logged in to Azure. Please log in..."
    az login
) else (
    call :print_success "Already logged in to Azure"
    az account show --query "{name:name, id:id}" --output table
)
goto :eof

REM Function to initialize and apply Terraform
:deploy_infrastructure
call :print_status "Deploying Azure infrastructure with Terraform..."

cd /d "%AZURE_INFRA_DIR%"

REM Check if terraform.tfvars exists
if not exist "terraform.tfvars" (
    call :print_warning "terraform.tfvars not found. Creating from example..."
    copy terraform.tfvars.example terraform.tfvars >nul
    call :print_warning "Please edit terraform.tfvars with your desired configuration"
    call :print_warning "Press any key to continue after editing terraform.tfvars..."
    pause >nul
)

REM Initialize Terraform
call :print_status "Initializing Terraform..."
terraform init
if %errorlevel% neq 0 (
    call :print_error "Terraform init failed"
    exit /b 1
)

REM Plan the deployment
call :print_status "Planning Terraform deployment..."
terraform plan -out=tfplan
if %errorlevel% neq 0 (
    call :print_error "Terraform plan failed"
    exit /b 1
)

REM Apply the deployment
call :print_status "Applying Terraform deployment..."
terraform apply tfplan
if %errorlevel% neq 0 (
    call :print_error "Terraform apply failed"
    exit /b 1
)

call :print_success "Infrastructure deployment completed"

REM Get outputs
call :print_status "Getting deployment outputs..."
terraform output -json > terraform-outputs.json

REM Extract key values
for /f "delims=" %%i in ('terraform output -raw container_registry_name') do set REGISTRY_NAME=%%i
for /f "delims=" %%i in ('terraform output -raw container_registry_login_server') do set REGISTRY_SERVER=%%i
for /f "delims=" %%i in ('terraform output -raw frontend_app_name') do set FRONTEND_APP=%%i
for /f "delims=" %%i in ('terraform output -raw backend_app_name') do set BACKEND_APP=%%i

call :print_success "Infrastructure outputs saved to terraform-outputs.json"
goto :eof

REM Function to build and push Docker images
:build_and_push_images
call :print_status "Building and pushing Docker images..."

cd /d "%PROJECT_ROOT%"

REM Login to Azure Container Registry
call :print_status "Logging in to Azure Container Registry..."
az acr login --name "%REGISTRY_NAME%"
if %errorlevel% neq 0 (
    call :print_error "Failed to login to Azure Container Registry"
    exit /b 1
)

REM Build and push frontend image
call :print_status "Building frontend Docker image..."
cd client
docker build -t "%REGISTRY_SERVER%/play-learn-spark-frontend:latest" .
if %errorlevel% neq 0 (
    call :print_error "Failed to build frontend Docker image"
    exit /b 1
)
cd ..

call :print_status "Pushing frontend Docker image..."
docker push "%REGISTRY_SERVER%/play-learn-spark-frontend:latest"
if %errorlevel% neq 0 (
    call :print_error "Failed to push frontend Docker image"
    exit /b 1
)

REM Build and push backend image
call :print_status "Building backend Docker image..."
cd server
docker build -t "%REGISTRY_SERVER%/play-learn-spark-backend:latest" .
if %errorlevel% neq 0 (
    call :print_error "Failed to build backend Docker image"
    exit /b 1
)

call :print_status "Pushing backend Docker image..."
docker push "%REGISTRY_SERVER%/play-learn-spark-backend:latest"
if %errorlevel% neq 0 (
    call :print_error "Failed to push backend Docker image"
    exit /b 1
)

cd /d "%PROJECT_ROOT%"
call :print_success "Docker images built and pushed successfully"
goto :eof

REM Function to update App Service configurations
:update_app_services
call :print_status "Updating App Service configurations..."

REM Get resource group name
cd /d "%AZURE_INFRA_DIR%"
for /f "delims=" %%i in ('terraform output -raw resource_group_name') do set RESOURCE_GROUP=%%i

REM Update frontend app service
call :print_status "Updating frontend App Service..."
az webapp config container set --name "%FRONTEND_APP%" --resource-group "%RESOURCE_GROUP%" --docker-custom-image-name "%REGISTRY_SERVER%/play-learn-spark-frontend:latest"
if %errorlevel% neq 0 (
    call :print_error "Failed to update frontend App Service"
    exit /b 1
)

REM Update backend app service
call :print_status "Updating backend App Service..."
az webapp config container set --name "%BACKEND_APP%" --resource-group "%RESOURCE_GROUP%" --docker-custom-image-name "%REGISTRY_SERVER%/play-learn-spark-backend:latest"
if %errorlevel% neq 0 (
    call :print_error "Failed to update backend App Service"
    exit /b 1
)

call :print_success "App Service configurations updated"
goto :eof

REM Function to restart App Services
:restart_app_services
call :print_status "Restarting App Services..."

cd /d "%AZURE_INFRA_DIR%"
for /f "delims=" %%i in ('terraform output -raw resource_group_name') do set RESOURCE_GROUP=%%i

REM Restart backend first
call :print_status "Restarting backend App Service..."
az webapp restart --name "%BACKEND_APP%" --resource-group "%RESOURCE_GROUP%"

REM Wait a bit for backend to start
timeout /t 10 /nobreak >nul

REM Restart frontend
call :print_status "Restarting frontend App Service..."
az webapp restart --name "%FRONTEND_APP%" --resource-group "%RESOURCE_GROUP%"

call :print_success "App Services restarted"
goto :eof

REM Function to display deployment information
:display_deployment_info
call :print_success "Deployment completed successfully!"
echo.
echo === Deployment Information ===
cd /d "%AZURE_INFRA_DIR%"
for /f "delims=" %%i in ('terraform output -raw frontend_app_url') do echo Frontend URL: %%i
for /f "delims=" %%i in ('terraform output -raw backend_app_url') do echo Backend URL: %%i
for /f "delims=" %%i in ('terraform output -raw resource_group_name') do echo Resource Group: %%i
for /f "delims=" %%i in ('terraform output -raw container_registry_name') do echo Container Registry: %%i
echo.
echo === Next Steps ===
echo 1. Visit the frontend URL to test the application
echo 2. Check App Service logs if there are any issues
echo 3. Monitor Application Insights for performance metrics
echo.
goto :eof

REM Main deployment function
:main
call :print_status "Starting Play Learn Spark deployment to Azure..."

call :check_prerequisites
if %errorlevel% neq 0 exit /b 1

call :azure_login
if %errorlevel% neq 0 exit /b 1

call :deploy_infrastructure
if %errorlevel% neq 0 exit /b 1

call :build_and_push_images
if %errorlevel% neq 0 exit /b 1

call :update_app_services
if %errorlevel% neq 0 exit /b 1

call :restart_app_services
if %errorlevel% neq 0 exit /b 1

call :display_deployment_info

call :print_success "Deployment completed successfully!"
goto :eof

REM Parse command line arguments
if "%1"=="infra" (
    call :print_status "Deploying infrastructure only..."
    call :check_prerequisites
    call :azure_login
    call :deploy_infrastructure
) else if "%1"=="images" (
    call :print_status "Building and pushing images only..."
    call :check_prerequisites
    call :azure_login
    if exist "%AZURE_INFRA_DIR%terraform-outputs.json" (
        cd /d "%AZURE_INFRA_DIR%"
        for /f "delims=" %%i in ('terraform output -raw container_registry_name') do set REGISTRY_NAME=%%i
        for /f "delims=" %%i in ('terraform output -raw container_registry_login_server') do set REGISTRY_SERVER=%%i
        cd /d "%PROJECT_ROOT%"
        call :build_and_push_images
    ) else (
        call :print_error "Infrastructure not deployed. Run 'deploy.bat infra' first."
        exit /b 1
    )
) else if "%1"=="update" (
    call :print_status "Updating App Services only..."
    call :check_prerequisites
    call :azure_login
    if exist "%AZURE_INFRA_DIR%terraform-outputs.json" (
        cd /d "%AZURE_INFRA_DIR%"
        for /f "delims=" %%i in ('terraform output -raw frontend_app_name') do set FRONTEND_APP=%%i
        for /f "delims=" %%i in ('terraform output -raw backend_app_name') do set BACKEND_APP=%%i
        for /f "delims=" %%i in ('terraform output -raw container_registry_login_server') do set REGISTRY_SERVER=%%i
        cd /d "%PROJECT_ROOT%"
        call :update_app_services
        call :restart_app_services
    ) else (
        call :print_error "Infrastructure not deployed. Run 'deploy.bat infra' first."
        exit /b 1
    )
) else if "%1"=="destroy" (
    set /p confirmation="This will destroy all Azure resources. Are you sure? (y/N): "
    if /i "!confirmation!"=="y" (
        call :print_status "Destroying infrastructure..."
        cd /d "%AZURE_INFRA_DIR%"
        terraform destroy
        call :print_success "Infrastructure destroyed"
    ) else (
        call :print_status "Destruction cancelled"
    )
) else if "%1"=="help" (
    echo Play Learn Spark Azure Deployment Script
    echo.
    echo Usage: %0 [command]
    echo.
    echo Commands:
    echo   (no args^)  - Full deployment (infrastructure + images + update^)
    echo   infra      - Deploy infrastructure only
    echo   images     - Build and push images only
    echo   update     - Update App Services only
    echo   destroy    - Destroy all Azure resources
    echo   help       - Show this help message
    echo.
) else if "%1"=="" (
    call :main
) else (
    call :print_error "Unknown command: %1"
    call :print_error "Use '%0 help' to see available commands"
    exit /b 1
)