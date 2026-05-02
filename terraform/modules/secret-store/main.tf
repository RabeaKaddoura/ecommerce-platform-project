resource "aws_secretsmanager_secret" "store" { #secret store resource
  name                    = var.secret_name
  description             = "Database credentials for backend application"
  recovery_window_in_days = 7

  tags = {
    Name        = "${var.prefix}-secret-manager"
    Environment = "${var.prefix}-${var.env}"
  }
}

resource "aws_secretsmanager_secret_version" "values" { #populating secret store
  secret_id = aws_secretsmanager_secret.store.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    host     = split(":", var.db_endpoint)[0] #removing port at the end
    port     = tostring(var.db_port)
    dbname   = var.db_name
  })
}
