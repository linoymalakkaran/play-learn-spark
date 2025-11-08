# Core infra: resource group, storage for static site + terraform state, container instance backend

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "random_id" "suffix" { 
  byte_length = var.random_id_byte_length 
}

resource "azurerm_resource_group" "rg" {
  name     = "${local.name_prefix}-rg"
  location = var.location
  tags     = var.tags
}

# Storage account (also static website + terraform state container)
resource "azurerm_storage_account" "sa" {
  name                     = replace(substr(lower("${var.project_name}${random_id.suffix.hex}"), 0, var.storage_account_name_max_length), "-", "")
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = var.storage_account_tier
  account_replication_type = var.storage_replication_type
  tags                     = var.tags

  static_website {
    index_document     = var.static_website_index_document
    error_404_document = var.static_website_error_document
  }
}

# Terraform state container
resource "azurerm_storage_container" "tfstate" {
  name                  = var.terraform_state_container_name
  storage_account_name  = azurerm_storage_account.sa.name
  container_access_type = var.terraform_state_access_type
}

# Log Analytics Workspace for Container Logging
resource "azurerm_log_analytics_workspace" "container_logs" {
  name                = "${local.name_prefix}-logs"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = var.log_analytics_sku
  retention_in_days   = var.log_analytics_retention_days
  tags                = var.tags
}

# Backend Container Instance with proper configuration
resource "azurerm_container_group" "backend" {
  name                = "${local.name_prefix}-backend"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_address_type     = var.container_ip_address_type
  dns_name_label      = "${local.name_prefix}-backend"
  os_type             = var.container_os_type
  restart_policy      = var.container_restart_policy

  # Log Analytics Integration
  diagnostics {
    log_analytics {
      workspace_id  = azurerm_log_analytics_workspace.container_logs.workspace_id
      workspace_key = azurerm_log_analytics_workspace.container_logs.primary_shared_key
    }
  }

  # GitHub Container Registry authentication
  image_registry_credential {
    server   = var.container_registry_server
    username = var.github_username
    password = var.github_token
  }

  container {
    name   = var.container_name
    image  = "${var.container_image_name}:${var.image_tag}"
    cpu    = var.container_cpu
    memory = var.container_memory

    ports {
      port     = var.container_port
      protocol = var.container_protocol
    }

    environment_variables = {
      NODE_ENV          = var.environment
      PORT              = var.container_port
      MONGODB_URI       = "${var.mongodb_atlas_connection_string}/${var.database_name}"
      GOOGLE_AI_API_KEY = var.google_ai_api_key
      JWT_SECRET        = var.jwt_secret
    }
  }

  tags = var.tags
}
