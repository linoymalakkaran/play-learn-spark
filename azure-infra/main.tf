terraform {# Configure the Azure Provider

  required_version = ">= 1.5.0"terraform {

  required_providers {  required_version = ">=1.0"

    azurerm = {  

      source  = "hashicorp/azurerm"  required_providers {

      version = "~> 3.100"    azurerm = {

    }      source  = "hashicorp/azurerm"

    random = {      version = "~>3.74"

      source  = "hashicorp/random"    }

      version = "~> 3.5"    random = {

    }      source  = "hashicorp/random"

  }      version = "~>3.1"

  backend "azurerm" {}    }

}  }



provider "azurerm" {  # Remote state storage in Azure Storage

  features {}  backend "azurerm" {

}    # These values will be provided via workflow environment variables

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