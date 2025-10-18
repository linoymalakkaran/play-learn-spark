# Output values for the Play Learn Spark infrastructure

output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "resource_group_location" {
  description = "The location of the resource group"
  value       = azurerm_resource_group.main.location
}

output "container_registry_name" {
  description = "The name of the Azure Container Registry (if used)"
  value       = var.use_docker_hub ? "Docker Hub" : azurerm_container_registry.main[0].name
}

output "container_registry_login_server" {
  description = "The login server URL of the container registry"
  value       = var.use_docker_hub ? "index.docker.io" : azurerm_container_registry.main[0].login_server
}

output "container_registry_admin_username" {
  description = "The admin username for the Azure Container Registry (if used)"
  value       = var.use_docker_hub ? "N/A - Using Docker Hub" : azurerm_container_registry.main[0].admin_username
  sensitive   = true
}

output "container_registry_admin_password" {
  description = "The admin password for the Azure Container Registry (if used)"
  value       = var.use_docker_hub ? "N/A - Using Docker Hub" : azurerm_container_registry.main[0].admin_password
  sensitive   = true
}

output "app_service_plan_name" {
  description = "The name of the App Service Plan"
  value       = azurerm_service_plan.main.name
}

output "frontend_app_name" {
  description = "The name of the frontend App Service"
  value       = try(azurerm_linux_web_app.frontend.name, azurerm_linux_web_app.combined_app.name)
}

output "frontend_app_url" {
  description = "The URL of the frontend application"
  value       = try("https://${azurerm_linux_web_app.frontend.default_hostname}", "https://${azurerm_linux_web_app.combined_app.default_hostname}")
}

output "combined_app_name" {
  description = "The name of the combined App Service"
  value       = azurerm_linux_web_app.combined_app.name
}

output "combined_app_url" {
  description = "The URL of the combined application"
  value       = "https://${azurerm_linux_web_app.combined_app.default_hostname}"
}

output "backend_app_name" {
  description = "The name of the backend App Service"
  value       = azurerm_linux_web_app.backend.name
}

output "backend_app_url" {
  description = "The URL of the backend application"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "application_insights_instrumentation_key" {
  description = "The instrumentation key for Application Insights"
  value       = var.enable_application_insights ? azurerm_application_insights.main[0].instrumentation_key : null
  sensitive   = true
}

output "application_insights_connection_string" {
  description = "The connection string for Application Insights"
  value       = var.enable_application_insights ? azurerm_application_insights.main[0].connection_string : null
  sensitive   = true
}

output "custom_domain_verification_id" {
  description = "The custom domain verification ID (if custom domain is enabled)"
  value       = var.enable_custom_domain && var.custom_domain_name != "" ? azurerm_linux_web_app.frontend.custom_domain_verification_id : null
  sensitive   = true
}

# Docker build and push commands
output "docker_build_commands" {
  description = "Commands to build and push Docker images"
  value = {
    frontend = [
      "# Build and push frontend image:",
      "docker build -t ${azurerm_container_registry.main.login_server}/${var.project_name}-frontend:latest .",
      "docker push ${azurerm_container_registry.main.login_server}/${var.project_name}-frontend:latest"
    ]
    backend = [
      "# Build and push backend image:",
      "cd server",
      "docker build -t ${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest .",
      "docker push ${azurerm_container_registry.main.login_server}/${var.project_name}-backend:latest"
    ]
    login = [
      "# Login to Azure Container Registry:",
      "az acr login --name ${azurerm_container_registry.main.name}"
    ]
  }
}