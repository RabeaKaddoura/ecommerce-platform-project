output "ecr_repository_name" {
  value       = aws_ecr_repository.ecr.name
  description = "Name of the ECR repository"
}

output "ecr_repository_arn" {
  value       = aws_ecr_repository.ecr.arn
  description = "ARN of the ECR repository"
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.ecr.repository_url
  description = "URL for pushing/pulling images"
}
