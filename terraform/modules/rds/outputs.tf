output "db_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.db.endpoint
}

output "db_name" {
  description = "Database name"
  value       = aws_db_instance.db.db_name
}

output "db_port" {
  description = "Database port"
  value       = aws_db_instance.db.port
}

output "db_username" {
  description = "Database username"
  value       = aws_db_instance.db.username
}
