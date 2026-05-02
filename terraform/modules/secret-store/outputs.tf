output "secretmanager_id" {
  description = "secret manager id"
  value       = aws_secretsmanager_secret.store.id
}

output "secretmanager_arn" {
  description = "secret manager arn"
  value       = aws_secretsmanager_secret.store.arn
}

