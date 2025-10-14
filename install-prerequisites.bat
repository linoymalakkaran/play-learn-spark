@echo off
REM Play Learn Spark - Prerequisites Installation Script for Windows
REM This script installs required tools for Azure deployment

setlocal enabledelayedexpansion

echo ================================================================
echo Play Learn Spark - Azure Deployment Prerequisites Installer
echo ================================================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% == 0 (
    echo [INFO] Running with administrator privileges
) else (
    echo [WARNING] Some installations may require administrator privileges
    echo [WARNING] If installations fail, please run this script as administrator
)

echo.

REM Function to check if a command exists
:check_command
where %1 >nul 2>nul
goto :eof

REM Check and install Chocolatey if not present
echo [INFO] Checking for Chocolatey package manager...
call :check_command choco
if %errorlevel% neq 0 (
    echo [INFO] Chocolatey not found. Installing Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Chocolatey
        echo [INFO] Please install Chocolatey manually from https://chocolatey.org/install
        pause
        exit /b 1
    )
    echo [SUCCESS] Chocolatey installed successfully
    REM Refresh environment variables
    call refreshenv
) else (
    echo [SUCCESS] Chocolatey is already installed
)

echo.

REM Check and install Azure CLI
echo [INFO] Checking for Azure CLI...
call :check_command az
if %errorlevel% neq 0 (
    echo [INFO] Azure CLI not found. Installing Azure CLI...
    choco install azure-cli -y
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Azure CLI via Chocolatey
        echo [INFO] Trying alternative installation method...
        echo [INFO] Downloading Azure CLI installer...
        powershell -Command "Invoke-WebRequest -Uri 'https://aka.ms/installazurecliwindows' -OutFile 'AzureCLI.msi'"
        echo [INFO] Please run AzureCLI.msi to install Azure CLI manually
        pause
    ) else (
        echo [SUCCESS] Azure CLI installed successfully
    )
    call refreshenv
) else (
    echo [SUCCESS] Azure CLI is already installed
    az --version
)

echo.

REM Check and install Terraform
echo [INFO] Checking for Terraform...
call :check_command terraform
if %errorlevel% neq 0 (
    echo [INFO] Terraform not found. Installing Terraform...
    choco install terraform -y
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Terraform via Chocolatey
        echo [INFO] Please install Terraform manually from https://www.terraform.io/downloads.html
        pause
    ) else (
        echo [SUCCESS] Terraform installed successfully
    )
    call refreshenv
) else (
    echo [SUCCESS] Terraform is already installed
    terraform --version
)

echo.

REM Check Docker
echo [INFO] Checking for Docker...
call :check_command docker
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found. Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo [INFO] After installing Docker Desktop, restart this script
    pause
    exit /b 1
) else (
    echo [SUCCESS] Docker is already installed
    docker --version
)

echo.

REM Check Node.js (for local development)
echo [INFO] Checking for Node.js...
call :check_command node
if %errorlevel% neq 0 (
    echo [INFO] Node.js not found. Installing Node.js...
    choco install nodejs -y
    if %errorlevel% neq 0 (
        echo [WARNING] Failed to install Node.js via Chocolatey
        echo [INFO] Please install Node.js manually from https://nodejs.org/
    ) else (
        echo [SUCCESS] Node.js installed successfully
    )
    call refreshenv
) else (
    echo [SUCCESS] Node.js is already installed
    node --version
    npm --version
)

echo.
echo ================================================================
echo Prerequisites Installation Complete!
echo ================================================================
echo.
echo Next steps:
echo 1. Close and reopen your terminal to refresh environment variables
echo 2. Run: az login
echo 3. Set your subscription: az account set --subscription "ae912782-989c-43e5-a227-2502f9499c0f"
echo 4. Navigate to azure-infra folder: cd azure-infra
echo 5. Run deployment: deploy.bat
echo.
echo If you encounter any issues, please:
echo - Restart your terminal
echo - Run this script as administrator
echo - Check the Azure Deployment Guide for manual installation steps
echo.
pause