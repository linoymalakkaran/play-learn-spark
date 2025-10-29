output "resource_group_name" { value = azurerm_resource_group.rg.name }
output "storage_account_name" { value = azurerm_storage_account.sa.name }
output "static_site_url" { value = azurerm_storage_account.sa.primary_web_endpoint }
output "backend_fqdn" { value = azurerm_container_group.backend.fqdn }
output "terraform_state_container" { value = azurerm_storage_container.tfstate.name }
