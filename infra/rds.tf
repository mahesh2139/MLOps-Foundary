# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.project_name}-db-subnet-group-${local.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${local.project_name}-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "main" {
  identifier                 = "${local.project_name}-db-${local.environment}"
  engine                     = "postgres"
  engine_version             = "15.2"
  instance_class             = var.rds_instance_class
  allocated_storage           = var.rds_allocated_storage
  db_name                    = "mlopsdb"
  username                   = "mlopsadmin"
  password                   = random_password.db_password.result
  db_subnet_group_name       = aws_db_subnet_group.main.name
  vpc_security_group_ids     = [aws_security_group.rds.id]
  publicly_accessible        = false
  skip_final_snapshot        = local.environment == "dev" ? true : false
  final_snapshot_identifier  = "${local.project_name}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  backup_retention_period    = local.environment == "prod" ? 30 : 7
  multi_az                   = local.environment == "prod" ? true : false
  storage_encrypted          = true
  deletion_protection        = local.environment == "prod" ? true : false

  tags = {
    Name = "${local.project_name}-db"
  }
}

# Random password for RDS
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Secrets Manager for RDS Credentials
resource "aws_secretsmanager_secret" "rds_credentials" {
  name                    = "${local.project_name}/rds/credentials"
  recovery_window_in_days = 7

  tags = {
    Name = "${local.project_name}-rds-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  secret_string = jsonencode({
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = aws_db_instance.main.db_name
    username = aws_db_instance.main.username
    password = random_password.db_password.result
  })
}

# RDS Enhanced Monitoring Role
resource "aws_iam_role" "rds_monitoring" {
  name = "${local.project_name}-rds-monitoring-role-${local.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Parameter Group
resource "aws_db_parameter_group" "main" {
  name   = "${local.project_name}-db-params-${local.environment}"
  family = "postgres15"

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = {
    Name = "${local.project_name}-db-parameter-group"
  }
}
