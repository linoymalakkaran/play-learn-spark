# Generate random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# Locals for computed values
locals {
  resource_suffix       = random_id.suffix.hex
  resource_group_name   = var.resource_group_name != "" ? var.resource_group_name : "${var.project_name}-${var.environment}-rg"
  container_registry_name = var.container_registry_name != "" ? var.container_registry_name : "${replace(var.project_name, "-", "")}${var.environment}acr${local.resource_suffix}"
  
  # Application names
  frontend_app_name = "${var.project_name}-frontend-${var.environment}-${local.resource_suffix}"
  backend_app_name  = "${var.project_name}-backend-${var.environment}-${local.resource_suffix}"
  
  # Merge environment-specific tags with default tags
  common_tags = merge(var.tags, {
    Environment = var.environment
    CreatedBy   = "Terraform"
    CreatedOn   = timestamp()
  })
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = local.resource_group_name
  location = var.location
  tags     = local.common_tags
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = local.container_registry_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = local.common_tags
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-${var.environment}-plan-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_plan_sku

  tags = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  count               = var.enable_application_insights ? 1 : 0
  name                = "${var.project_name}-${var.environment}-insights-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = local.common_tags
}

# Log Analytics Workspace for Application Insights
resource "azurerm_log_analytics_workspace" "main" {
  count               = var.enable_application_insights ? 1 : 0
  name                = "${var.project_name}-${var.environment}-logs-${local.resource_suffix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = local.common_tags
}

# Frontend App Service (React Application)
resource "azurerm_linux_web_app" "frontend" {
  name                = local.frontend_app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = var.app_service_plan_sku != "F1" && var.app_service_plan_sku != "D1"

    application_stack {
      docker_image_name   = "nginx:latest"
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
    }

    # Health check configuration
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2

    # CORS settings
    cors {
      allowed_origins = [
        "https://${local.backend_app_name}.azurewebsites.net",
        var.enable_custom_domain && var.custom_domain_name != "" ? "https://${var.custom_domain_name}" : ""
      ]
      support_credentials = true
    }
  }

  app_settings = merge(
    {
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.main.login_server}"
      "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.main.admin_username
      "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.main.admin_password
      "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
      "WEBSITES_PORT"                    = "80"
      "PORT"                            = "80"
      "NODE_ENV"                        = "production"
      "REACT_APP_API_URL"               = "https://${local.backend_app_name}.azurewebsites.net"
    },
    var.enable_application_insights && length(azurerm_application_insights.main) > 0 ? {
      "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.main[0].instrumentation_key
      "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main[0].connection_string
    } : {}
  )

  identity {
    type = "SystemAssigned"
  }

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = local.common_tags
}

# Backend App Service (Node.js API)
resource "azurerm_linux_web_app" "backend" {
  name                = local.backend_app_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = var.app_service_plan_sku != "F1" && var.app_service_plan_sku != "D1"

    application_stack {
      docker_image_name   = "node:20-alpine"
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
    }

    # Health check configuration
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2

    # CORS settings
    cors {
      allowed_origins = [
        "https://${local.frontend_app_name}.azurewebsites.net",
        var.enable_custom_domain && var.custom_domain_name != "" ? "https://${var.custom_domain_name}" : ""
      ]
      support_credentials = true
    }
  }

  app_settings = merge(
    {
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.main.login_server}"
      "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.main.admin_username
      "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.main.admin_password
      "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
      "WEBSITES_PORT"                    = "3001"
      "PORT"                            = "3001"
      "NODE_ENV"                        = "production"
      "CORS_ORIGIN"                     = "https://${local.frontend_app_name}.azurewebsites.net"
    },
    var.enable_application_insights && length(azurerm_application_insights.main) > 0 ? {
      "APPINSIGHTS_INSTRUMENTATIONKEY"        = azurerm_application_insights.main[0].instrumentation_key
      "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main[0].connection_string
    } : {}
  )

  identity {
    type = "SystemAssigned"
  }

  logs {
    detailed_error_messages = true
    failed_request_tracing  = true

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  tags = local.common_tags
}

# Custom Domain (Optional)
resource "azurerm_app_service_custom_hostname_binding" "frontend" {
  count               = var.enable_custom_domain && var.custom_domain_name != "" ? 1 : 0
  hostname            = var.custom_domain_name
  app_service_name    = azurerm_linux_web_app.frontend.name
  resource_group_name = azurerm_resource_group.main.name

  depends_on = [azurerm_linux_web_app.frontend]
}

# Grant ACR Pull permissions to App Services
resource "azurerm_role_assignment" "frontend_acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.frontend.identity[0].principal_id
}

resource "azurerm_role_assignment" "backend_acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.backend.identity[0].principal_id
}