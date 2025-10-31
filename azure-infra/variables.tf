# Variables for the Play Learn Spark infrastructure

variable "project_name" {
  description = "The name of the project"
  type        = string
  default     = "play-learn-spark"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "The Azure region where resources will be created"
  type        = string
  default     = "UAE North"
}

variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
  default     = ""
}

variable "app_service_plan_sku" {
  description = "The SKU for the App Service Plan"
  type        = string
  default     = "B1"
  
  validation {
    condition = contains([
      "F1", "D1", "B1", "B2", "B3", 
      "S1", "S2", "S3", 
      "P1v2", "P2v2", "P3v2", 
      "P1v3", "P2v3", "P3v3"
    ], var.app_service_plan_sku)
    error_message = "App Service Plan SKU must be a valid Azure App Service SKU."
  }
}

variable "frontend_docker_image" {
  description = "Docker image for the frontend application"
  type        = string
  default     = "nginx:latest"
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

# Database Configuration
variable "mongodb_atlas_connection_string" {
  description = "MongoDB Atlas connection string (without database name)"
  type        = string
  sensitive   = true
}

# Security Configuration
variable "jwt_secret" {
  description = "JWT secret for backend authentication"
  type        = string
  sensitive   = true
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

# Container Image Configuration
variable "image_tag" {
  description = "Docker image tag for the backend container"
  type        = string
  default     = "latest"
}

# GitHub Container Registry Authentication
variable "github_username" {
  description = "GitHub username for GHCR authentication"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub Personal Access Token for GHCR authentication"
  type        = string
  sensitive   = true
}

# Resource Tags
variable "tags" {
  description = "Tags to be applied to all resources"
  type        = map(string)
  default = {
    Project     = "Play Learn Spark"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}