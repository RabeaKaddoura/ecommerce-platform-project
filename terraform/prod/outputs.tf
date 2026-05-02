#general outputs

output "region" {
  description = "aws region"
  value       = var.aws_region
}


#network outputs

output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = join(",", module.network.public_subnet_ids)
}

#eks outputs

output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ids attached to the cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "oidc_provider_arn" {
  description = "arn for the cluster's OIDC provider"
  value       = module.eks.oidc_provider_arn
}

#RDS outputs

output "rds_endpoint" {
  description = "RDS endpoint for backend connection"
  value       = module.postgres.db_endpoint
  sensitive   = true
}

output "rds_database_name" {
  description = "Database name"
  value       = module.postgres.db_name
}

output "db_password" { #for testing purposes
  value     = random_password.db_password.result
  sensitive = true
}

#ECR outputs

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.ecr_repository_url
}

output "ecr_repository_name" {
  description = "ECR repository name"
  value       = module.ecr.ecr_repository_name
}
