# Terraform variables for PlayLearnSpark infra (prod + dev)# Variables for the Play Learn Spark infrastructure



variable "environment" {variable "project_name" {

  description = "Deployment environment (dev or prod)"  description = "The name of the project"

  type        = string  type        = string

  default     = "dev"  default     = "play-learn-spark"

  validation {}

    condition     = contains(["dev", "prod"], var.environment)

    error_message = "environment must be one of: dev, prod"variable "environment" {

  }  description = "The deployment environment (dev, staging, prod)"

}  type        = string

  default     = "dev"

variable "location" {  

  description = "Azure region"  validation {

  type        = string    condition     = contains(["dev", "staging", "prod"], var.environment)

  default     = "UAE North"    error_message = "Environment must be one of: dev, staging, prod."

}  }

}

variable "project_name" {

  description = "Base project name"variable "location" {

  type        = string  description = "The Azure region where resources will be created"

  default     = "play-learn-spark"  type        = string

}  default     = "East US"

}

variable "mongodb_atlas_connection_string" {

  description = "MongoDB Atlas connection string (without database name)"variable "resource_group_name" {

  type        = string  description = "The name of the resource group"

  sensitive   = true  type        = string

}  default     = ""

}

variable "jwt_secret" {

  description = "JWT secret for backend"variable "app_service_plan_sku" {

  type        = string  description = "The SKU for the App Service Plan"

  sensitive   = true  type        = string

}  default     = "B1"

  

variable "google_ai_api_key" {  validation {

  description = "Google AI Studio API key"    condition = contains([

  type        = string      "F1", "D1", "B1", "B2", "B3", 

  sensitive   = true      "S1", "S2", "S3", 

  default     = ""      "P1v2", "P2v2", "P3v2", 

}      "P1v3", "P2v3", "P3v3"

    ], var.app_service_plan_sku)

variable "tags" {    error_message = "App Service Plan SKU must be a valid Azure App Service SKU."

  description = "Azure resource tags"  }

  type        = map(string)}

  default = {

    ManagedBy = "Terraform"variable "frontend_docker_image" {

    Project   = "PlayLearnSpark"  description = "Docker image for the frontend application"

  }  type        = string

}  default     = "nginx:latest"

}

variable "backend_docker_image" {
  description = "Docker image for the backend application"
  type        = string
  default     = "node:20-alpine"
}

variable "combined_docker_image" {
  description = "Docker image for the combined frontend + backend application"
  type        = string
  default     = "nginx:latest"
}

variable "use_docker_hub" {
  description = "Use Docker Hub instead of Azure Container Registry"
  type        = bool
  default     = false
}

variable "container_registry_name" {
  description = "Name of the Azure Container Registry"
  type        = string
  default     = ""
}

variable "enable_application_insights" {
  description = "Enable Application Insights for monitoring"
  type        = bool
  default     = true
}

variable "enable_custom_domain" {
  description = "Enable custom domain for the applications"
  type        = bool
  default     = false
}

variable "custom_domain_name" {
  description = "Custom domain name for the frontend application"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default = {
    Project     = "Play Learn Spark"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

# AI Service Configuration
variable "google_ai_api_key" {
  description = "Google AI Studio API key for AI content generation"
  type        = string
  sensitive   = true
  default     = ""
}

variable "openai_api_key" {
  description = "OpenAI API key for backup AI content generation"
  type        = string
  sensitive   = true
  default     = ""
}

variable "huggingface_api_key" {
  description = "Hugging Face API key for AI content generation"
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_api_key" {
  description = "Anthropic API key for AI content generation"
  type        = string
  sensitive   = true
  default     = ""
}