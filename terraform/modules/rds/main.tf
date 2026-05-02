resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.prefix}-db-subnet-group"
    Environment = "${var.prefix}-production"
  }
}

resource "aws_db_instance" "db" {
  allocated_storage   = 20
  db_name             = replace(var.db_name, "-", "")
  engine              = "postgres"
  engine_version      = "17.6"
  instance_class      = "db.t3.micro"
  username            = var.db_username
  password            = var.db_password
  skip_final_snapshot = true

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.default.name

  tags = {
    Name        = "${var.prefix}-eks-db"
    Environment = "${var.prefix}-production"
  }
}

#RDS security group

resource "aws_security_group" "rds_sg" {
  name_prefix = "${var.prefix}-rds-sg-"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.prefix}-rds-sg"
    Environment = "${var.prefix}-production"
  }
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_eks" {
  description                  = "Allow from EKS nodes"
  security_group_id            = aws_security_group.rds_sg.id
  referenced_security_group_id = var.eks_node_sg_id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_vpc_security_group_egress_rule" "rds_egress" {
  description       = "Allow all outbound traffic"
  security_group_id = aws_security_group.rds_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
