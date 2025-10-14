# Play Learn Spark - Prerequisites Installation Script for Windows (PowerShell)
# This script installs required tools for Azure deployment using winget

Write-Host "================================================================" -ForegroundColor Green
Write-Host "Play Learn Spark - Azure Deployment Prerequisites Installer" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($CommandName)
    try {
        Get-Command $CommandName -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to install via winget
function Install-WingetPackage {
    param($PackageId, $PackageName)
    
    Write-Host "[INFO] Installing $PackageName..." -ForegroundColor Yellow
    try {
        winget install --id $PackageId --silent --accept-package-agreements --accept-source-agreements
        Write-Host "[SUCCESS] $PackageName installed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "[ERROR] Failed to install $PackageName" -ForegroundColor Red
        return $false
    }
}

# Check if winget is available
if (!(Test-Command "winget")) {
    Write-Host "[ERROR] winget is not available. Please update Windows or install App Installer from Microsoft Store" -ForegroundColor Red
    Write-Host "[INFO] Alternative: Use the batch script install-prerequisites.bat" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[SUCCESS] winget is available" -ForegroundColor Green
Write-Host ""

# Check and install Azure CLI
Write-Host "[INFO] Checking for Azure CLI..." -ForegroundColor Yellow
if (!(Test-Command "az")) {
    if (Install-WingetPackage "Microsoft.AzureCLI" "Azure CLI") {
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
    }
} else {
    Write-Host "[SUCCESS] Azure CLI is already installed" -ForegroundColor Green
    az --version
}

Write-Host ""

# Check and install Terraform
Write-Host "[INFO] Checking for Terraform..." -ForegroundColor Yellow
if (!(Test-Command "terraform")) {
    Install-WingetPackage "HashiCorp.Terraform" "Terraform"
} else {
    Write-Host "[SUCCESS] Terraform is already installed" -ForegroundColor Green
    terraform --version
}

Write-Host ""

# Check Docker
Write-Host "[INFO] Checking for Docker..." -ForegroundColor Yellow
if (!(Test-Command "docker")) {
    Write-Host "[INFO] Installing Docker Desktop..." -ForegroundColor Yellow
    Install-WingetPackage "Docker.DockerDesktop" "Docker Desktop"
    Write-Host "[WARNING] Docker Desktop requires a restart after installation" -ForegroundColor Yellow
    Write-Host "[WARNING] Please restart your computer and ensure Docker Desktop is running before deployment" -ForegroundColor Yellow
} else {
    Write-Host "[SUCCESS] Docker is already installed" -ForegroundColor Green
    docker --version
}

Write-Host ""

# Check Node.js
Write-Host "[INFO] Checking for Node.js..." -ForegroundColor Yellow
if (!(Test-Command "node")) {
    Install-WingetPackage "OpenJS.NodeJS" "Node.js"
} else {
    Write-Host "[SUCCESS] Node.js is already installed" -ForegroundColor Green
    node --version
    npm --version
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "Prerequisites Installation Complete!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Close and reopen your terminal to refresh environment variables" -ForegroundColor White
Write-Host "2. Run: az login" -ForegroundColor White
Write-Host "3. Set your subscription: az account set --subscription `"ae912782-989c-43e5-a227-2502f9499c0f`"" -ForegroundColor White
Write-Host "4. Navigate to azure-infra folder: cd azure-infra" -ForegroundColor White
Write-Host "5. Run deployment: .\deploy.bat" -ForegroundColor White
Write-Host ""
Write-Host "If you encounter any issues:" -ForegroundColor Yellow
Write-Host "- Restart your terminal or computer" -ForegroundColor White
Write-Host "- Check the Azure Deployment Guide for manual installation steps" -ForegroundColor White
Write-Host "- Ensure Docker Desktop is running before deployment" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"