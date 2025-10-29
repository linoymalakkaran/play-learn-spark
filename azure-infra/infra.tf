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

# Backend Container Instance (pull image from GHCR)
resource "azurerm_container_group" "backend" {
  name                = "${local.name_prefix}-backend"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  ip_address_type     = "Public"
  dns_name_label      = substr(replace("${local.name_prefix}${random_id.suffix.hex}","_",""),0,60)
  os_type             = "Linux"

  container {
    name   = "api"
    image  = "ghcr.io/linoymalakkaran/play-learn-spark-backend:latest"
    cpu    = 0.5
    memory = 1.0

    ports { port = 3000 }

    environment_variables = {
      NODE_ENV     = var.environment
      PORT         = 3000
      MONGO_URI    = "${var.mongodb_atlas_connection_string}/playlearnspark?retryWrites=true&w=majority"
      GOOGLE_AI_KEY = var.google_ai_api_key
    }

    secure_environment_variables = {
      JWT_SECRET = var.jwt_secret
    }
  }

  tags = var.tags
}
