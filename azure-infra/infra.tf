# Core infra: resource group, storage for static site + terraform state, container instance backend

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "random_id" "suffix" { byte_length = 4 }

resource "azurerm_resource_group" "rg" {
  name     = "${local.name_prefix}-rg"
  location = var.location
  tags     = var.tags
}

# Storage account (also static website + terraform state container)
resource "azurerm_storage_account" "sa" {
  name                     = replace(substr(lower("${var.project_name}${random_id.suffix.hex}"),0,24),"-","")
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.tags

  static_website {
    index_document     = "index.html"
    error_404_document = "404.html"
  }
}

# Terraform state container
resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = "private"
}

# Log Analytics Workspace for Container Logging
resource "azurerm_log_analytics_workspace" "container_logs" {
  name                = "${local.name_prefix}-logs"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

# Backend Container Instance with proper configuration
resource "azurerm_container_group" "backend" {
  name                = "${local.name_prefix}-backend"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_address_type     = "Public"
  dns_name_label      = "${local.name_prefix}-backend"
  os_type             = "Linux"
  restart_policy      = "OnFailure"

  # Log Analytics Integration
  diagnostics {
    log_analytics {
      workspace_id  = azurerm_log_analytics_workspace.container_logs.workspace_id
      workspace_key = azurerm_log_analytics_workspace.container_logs.primary_shared_key
    }
  }

  # GitHub Container Registry authentication
  image_registry_credential {
    server   = "ghcr.io"
    username = var.github_username
    password = var.github_token
  }

  container {
    name   = "api"
    image  = "ghcr.io/linoymalakkaran/play-learn-spark-backend:${var.image_tag}"
    cpu    = 1.0    # Increased resources based on our findings
    memory = 2.0

    ports {
      port     = 3000
      protocol = "TCP"
    }

    environment_variables = {
      NODE_ENV = var.environment
      PORT     = 3000
    }

    # Secure environment variables
    secure_environment_variables = {
      MONGODB_URI   = var.mongodb_atlas_connection_string  # Fixed variable name
      GOOGLE_AI_KEY = var.google_ai_api_key
      JWT_SECRET    = var.jwt_secret
    }
  }

  tags = var.tags
}
