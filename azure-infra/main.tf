# Configure the Azure Provider
terraform {
  required_version = ">=1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.74"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.1"
    }
  }

  # Uncomment and configure for remote state storage
  # backend "azurerm" {
  #   resource_group_name  = "tfstate-rg"
  #   storage_account_name = "tfstatestorage"
  #   container_name       = "tfstate"
  #   key                  = "play-learn-spark.terraform.tfstate"
  # }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
    
    app_service {
      purge_soft_deleted_on_destroy = true
    }
  }
}