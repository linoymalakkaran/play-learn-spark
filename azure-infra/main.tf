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

  # Remote state storage in Azure Storage
  backend "azurerm" {
    # These values will be provided via workflow environment variables
    # resource_group_name  = var.terraform_state_resource_group
    # storage_account_name = var.terraform_state_storage_account
    container_name = "tfstate"
    key           = "play-learn-spark.terraform.tfstate"
  }
}

# Configure the Microsoft Azure Provider
provider "azurerm" {
  skip_provider_registration = true
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}