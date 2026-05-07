# Step Functions State Machine for Canonical Pipeline
resource "aws_sfn_state_machine" "canonical_pipeline" {
  name       = "${local.app_name}-canonical-pipeline"
  role_arn   = aws_iam_role.step_functions_role.arn
  definition = file("${path.module}/../pipelines/canonical-pipeline.json")

  tags = {
    Name = "${local.app_name}-canonical-pipeline"
  }
}

# CloudWatch Log Group for Step Functions
resource "aws_cloudwatch_log_group" "step_functions" {
  name              = "/aws/stepfunctions/${local.app_name}"
  retention_in_days = 30

  tags = {
    Name = "${local.app_name}-step-functions-logs"
  }
}

# SNS Topic for Pipeline Notifications
resource "aws_sns_topic" "pipeline_notifications" {
  name = "${local.app_name}-pipeline-notifications"

  tags = {
    Name = "${local.app_name}-pipeline-notifications"
  }
}

resource "aws_sns_topic_policy" "pipeline_notifications" {
  arn = aws_sns_topic.pipeline_notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = [
            "states.amazonaws.com",
            "cloudwatch.amazonaws.com"
          ]
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.pipeline_notifications.arn
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "step_functions_failures" {
  alarm_name          = "${local.app_name}-step-functions-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "ExecutionsFailed"
  namespace           = "AWS/States"
  period              = "300"
  statistic           = "Sum"
  threshold           = "0"
  alarm_description   = "Alert when Step Functions executions fail"
  alarm_actions       = [aws_sns_topic.pipeline_notifications.arn]

  dimensions = {
    StateMachineArn = aws_sfn_state_machine.canonical_pipeline.arn
  }

  tags = {
    Name = "${local.app_name}-step-functions-failures"
  }
}

# CloudWatch Alarm for ECS Service CPU
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${local.app_name}-ecs-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alert when ECS CPU is high"
  alarm_actions       = [aws_sns_topic.pipeline_notifications.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.backend.name
  }

  tags = {
    Name = "${local.app_name}-ecs-cpu-high"
  }
}

# CloudWatch Alarm for RDS CPU
resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "${local.app_name}-rds-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alert when RDS CPU is high"
  alarm_actions       = [aws_sns_topic.pipeline_notifications.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = {
    Name = "${local.app_name}-rds-cpu-high"
  }
}
