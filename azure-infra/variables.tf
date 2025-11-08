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
  default     = "East US"
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

# Storage Account Configuration
variable "storage_account_tier" {
  description = "The access tier of the storage account"
  type        = string
  default     = "Standard"
  
  validation {
    condition     = contains(["Standard", "Premium"], var.storage_account_tier)
    error_message = "Storage account tier must be either Standard or Premium."
  }
}

variable "storage_replication_type" {
  description = "The replication type of the storage account"
  type        = string
  default     = "LRS"
  
  validation {
    condition     = contains(["LRS", "GRS", "RAGRS", "ZRS", "GZRS", "RAGZRS"], var.storage_replication_type)
    error_message = "Storage replication type must be one of: LRS, GRS, RAGRS, ZRS, GZRS, RAGZRS."
  }
}

variable "static_website_index_document" {
  description = "The name of the index document for the static website"
  type        = string
  default     = "index.html"
}

variable "static_website_error_document" {
  description = "The name of the error document for the static website"
  type        = string
  default     = "index.html"
}

# Container Configuration
variable "container_registry_server" {
  description = "Container registry server"
  type        = string
  default     = "ghcr.io"
}

variable "container_image_name" {
  description = "Base container image name (without tag)"
  type        = string
  default     = "ghcr.io/linoymalakkaran/play-learn-spark-backend"
}

variable "container_cpu" {
  description = "CPU allocation for the container (in cores)"
  type        = number
  default     = 1.0
  
  validation {
    condition     = var.container_cpu > 0 && var.container_cpu <= 4
    error_message = "Container CPU must be between 0.1 and 4 cores."
  }
}

variable "container_memory" {
  description = "Memory allocation for the container (in GB)"
  type        = number
  default     = 2.0
  
  validation {
    condition     = var.container_memory > 0 && var.container_memory <= 16
    error_message = "Container memory must be between 0.5 and 16 GB."
  }
}

variable "container_name" {
  description = "Name of the container within the container group"
  type        = string
  default     = "api"
}

variable "container_port" {
  description = "Port to expose on the container"
  type        = number
  default     = 3000
}

variable "container_protocol" {
  description = "Protocol for the container port"
  type        = string
  default     = "TCP"
  
  validation {
    condition     = contains(["TCP", "UDP"], var.container_protocol)
    error_message = "Container protocol must be TCP or UDP."
  }
}

variable "container_os_type" {
  description = "Operating system type for the container"
  type        = string
  default     = "Linux"
  
  validation {
    condition     = contains(["Linux", "Windows"], var.container_os_type)
    error_message = "Container OS type must be Linux or Windows."
  }
}

variable "container_restart_policy" {
  description = "Restart policy for the container group"
  type        = string
  default     = "OnFailure"
  
  validation {
    condition     = contains(["Always", "Never", "OnFailure"], var.container_restart_policy)
    error_message = "Container restart policy must be Always, Never, or OnFailure."
  }
}

variable "container_ip_address_type" {
  description = "IP address type for the container group"
  type        = string
  default     = "Public"
  
  validation {
    condition     = contains(["Public", "Private"], var.container_ip_address_type)
    error_message = "Container IP address type must be Public or Private."
  }
}

# Database Configuration
variable "database_name" {
  description = "Name of the database to append to MongoDB connection string"
  type        = string
  default     = "playlearnspark"
}

# Log Analytics Configuration
variable "log_analytics_sku" {
  description = "SKU for Log Analytics Workspace"
  type        = string
  default     = "PerGB2018"
  
  validation {
    condition     = contains(["Free", "Standalone", "PerNode", "PerGB2018"], var.log_analytics_sku)
    error_message = "Log Analytics SKU must be one of: Free, Standalone, PerNode, PerGB2018."
  }
}

variable "log_analytics_retention_days" {
  description = "Number of days to retain logs in Log Analytics"
  type        = number
  default     = 30
  
  validation {
    condition     = var.log_analytics_retention_days >= 30 && var.log_analytics_retention_days <= 730
    error_message = "Log Analytics retention must be between 30 and 730 days."
  }
}

# Terraform State Configuration
variable "terraform_state_container_name" {
  description = "Name of the container for Terraform state"
  type        = string
  default     = "tfstate"
}

variable "terraform_state_access_type" {
  description = "Access type for the Terraform state container"
  type        = string
  default     = "private"
  
  validation {
    condition     = contains(["private", "blob", "container"], var.terraform_state_access_type)
    error_message = "Terraform state access type must be private, blob, or container."
  }
}

# Infrastructure Configuration
variable "random_id_byte_length" {
  description = "Byte length for random ID suffix"
  type        = number
  default     = 4
  
  validation {
    condition     = var.random_id_byte_length >= 1 && var.random_id_byte_length <= 16
    error_message = "Random ID byte length must be between 1 and 16."
  }
}

variable "storage_account_name_max_length" {
  description = "Maximum length for storage account name"
  type        = number
  default     = 24
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