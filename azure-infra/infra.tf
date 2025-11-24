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

# Azure Container Apps Environment
resource "azurerm_container_app_environment" "backend" {
  name                       = "${local.name_prefix}-env"
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.container_logs.id
  tags                       = var.tags
}

# Backend Container App - Improved reliability over Container Instance
resource "azurerm_container_app" "backend" {
  name                         = "${local.name_prefix}-backend"
  container_app_environment_id = azurerm_container_app_environment.backend.id
  resource_group_name          = azurerm_resource_group.rg.name
  revision_mode               = "Single"
  tags                        = var.tags

  # Registry configuration for GitHub Container Registry
  registry {
    server               = var.container_registry_server
    username             = var.github_username
    password_secret_name = "github-token"
  }

  # Secret for GitHub registry authentication
  secret {
    name  = "github-token"
    value = var.github_token
  }

  secret {
    name  = "mongodb-uri"
    value = "${replace(var.mongodb_atlas_connection_string, "/test", "")}/${var.database_name}?retryWrites=true&w=majority"
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  secret {
    name  = "google-ai-key"
    value = var.google_ai_api_key
  }

  # Ingress configuration for external access
  ingress {
    external_enabled = true
    target_port      = var.container_port
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = var.container_name
      image  = "${var.container_image_name}:${var.image_tag}"
      cpu    = var.container_cpu
      memory = "${var.container_memory}Gi"

      # Environment variables using secrets
      env {
        name  = "NODE_ENV"
        value = var.environment == "dev" ? "development" : var.environment
      }

      env {
        name  = "PORT"
        value = tostring(var.container_port)
      }

      env {
        name        = "MONGODB_URI"
        secret_name = "mongodb-uri"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret"
      }

      env {
        name        = "GOOGLE_AI_API_KEY"
        secret_name = "google-ai-key"
      }

      # Health probes
      liveness_probe {
        transport = "HTTP"
        port      = var.container_port
        path      = "/api/health"
        initial_delay = 30
        interval_seconds = 30
        timeout = 10
        failure_count_threshold = 3
      }

      readiness_probe {
        transport = "HTTP"
        port      = var.container_port
        path      = "/api/health"
        interval_seconds = 10
        timeout = 5
        failure_count_threshold = 3
      }
    }
  }
}
