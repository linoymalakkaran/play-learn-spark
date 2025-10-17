# Combined App Service for React + Node.js deployment
resource "azurerm_linux_web_app" "combined_app" {
  name                = "${var.project_name}-${var.environment}-${local.resource_suffix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_service_plan.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = var.app_service_plan_sku != "F1" && var.app_service_plan_sku != "D1"

    application_stack {
      docker_image_name   = var.combined_docker_image
      docker_registry_url = "https://${azurerm_container_registry.main.login_server}"
    }

    # Health check configuration
    health_check_path                 = "/health"
    health_check_eviction_time_in_min = 2

    # CORS settings for the combined app
    cors {
      allowed_origins = [
        "https://${var.project_name}-${var.environment}-${local.resource_suffix}.azurewebsites.net",
        var.enable_custom_domain && var.custom_domain_name != "" ? "https://${var.custom_domain_name}" : "",
        "http://localhost:3000",
        "http://localhost:8080"
      ]
      support_credentials = true
    }
  }

  app_settings = merge(
    {
      # Docker Configuration
      "DOCKER_REGISTRY_SERVER_URL"      = "https://${azurerm_container_registry.main.login_server}"
      "DOCKER_REGISTRY_SERVER_USERNAME" = azurerm_container_registry.main.admin_username
      "DOCKER_REGISTRY_SERVER_PASSWORD" = azurerm_container_registry.main.admin_password
      "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
      "WEBSITES_PORT"                    = "80"
      
      # Application Configuration
      "PORT"                            = "80"
      "NODE_ENV"                        = "production"
      "DATABASE_PATH"                   = "/app/server/data/database.sqlite"
      "SQLITE_DB_PATH"                  = "/app/server/data/database.sqlite"
      
      # CORS Configuration
      "CORS_ORIGIN"                     = "*"
      "CORS_METHODS"                    = "GET,HEAD,PUT,PATCH,POST,DELETE"
      "CORS_CREDENTIALS"                = "true"
      
      # App Configuration
      "APP_NAME"                        = var.project_name
      "MAX_UPLOAD_SIZE"                 = "10mb"
      "SESSION_SECRET"                  = "azure-production-secret-${local.resource_suffix}"
      
      # Logging
      "LOG_LEVEL"                       = "info"
      "LOG_FILE"                        = "/app/server/logs/app.log"
      
      # Performance
      "MAX_REQUEST_SIZE"                = "10mb"
      "TIMEOUT"                         = "30000"
      
      # Security
      "SECURITY_HEADERS"                = "true"
      "RATE_LIMIT"                      = "1000"
      
      # File Upload
      "UPLOAD_DIRECTORY"                = "/app/server/uploads"
      "MAX_FILE_SIZE"                   = "5242880"
      
      # Health Check
      "HEALTH_CHECK_PATH"               = "/health"
      "HEALTH_CHECK_TIMEOUT"            = "5000"
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