#general
variable "prefix" {
  description = "tag prefix"
  type        = string
  default     = "ecom"
}

variable "env" {
  description = "environment"
  type        = string
}

variable "aws_region" {
  description = "aws region"
  type        = string
  default     = "us-east-1"
}

#network 

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}


variable "az_1" {
  description = "first availability zone"
  type        = string
  default     = "us-east-1a"
}

variable "az_2" {
  description = "second availability zone"
  type        = string
  default     = "us-east-1b"
}

variable "priv_subnet_1" {
  description = "first private subnet CIDR block"
  type        = string
  default     = "10.0.1.0/24"
}

variable "priv_subnet_2" {
  description = "second private subnet CIDR block"
  type        = string
  default     = "10.0.2.0/24"
}


variable "pub_subnet_1" {
  description = "first public subnet CIDR block"
  type        = string
  default     = "10.0.101.0/24"
}

variable "pub_subnet_2" {
  description = "second public subnet CIDR block"
  type        = string
  default     = "10.0.102.0/24"
}

#eks

variable "cluster_name" {
  description = "eks cluster name"
  type        = string
  default     = "ecom-cluster"
}

variable "cluster_version" {
  description = "eks cluster version"
  type        = string
  default     = "1.34"
}

#db
variable "db_username" {
  description = "database username"
  type        = string
  default     = "adminuser"
}

variable "db_name" {
  description = "database name"
  type        = string
  default     = "ecom"
}


#secret store

variable "secret_name" {
  description = "secret store name"
  type        = string
  default     = "/prodd/backend/secrets"
}

variable "auth_secret_key" {}

variable "stripe_secret_key" {}

variable "stripe_publishable_key" {}

variable "stripe_webhook_secret" {}
