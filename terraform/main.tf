terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# --- CLUSTER & REPOS ---
resource "aws_ecs_cluster" "mern_cluster" {
  name = "mern-blog-cluster"
}

resource "aws_ecr_repository" "backend" {
  name         = "mern-backend"
  force_delete = true # Useful for testing
}

resource "aws_ecr_repository" "frontend" {
  name         = "mern-frontend"
  force_delete = true
}

# --- NETWORKING (Fixes internet & route access) ---
resource "aws_vpc" "mern_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "mern-blog-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.mern_vpc.id
}

resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.mern_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.mern_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_rt.id
}

# --- SECURITY GROUPS (Added Port 80) ---
resource "aws_security_group" "mern_sg" {
  name   = "mern-app-sg"
  vpc_id = aws_vpc.mern_vpc.id

  # Frontend Port
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend Port
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- LOGGING ---
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/mern-blog"
  retention_in_days = 7
}

# --- SECRETS (SSM Parameter for Mongo URI) ---
resource "aws_ssm_parameter" "mongo_uri" {
  name  = "/mern-blog/mongo-uri"
  type  = "SecureString"
  value = "REPLACE_ME_MANUALLY_IN_CONSOLE" # Terraform won't overwrite after creation

  lifecycle {
    ignore_changes = [value]
  }
}

# --- IAM ROLE (Updated with SSM Permissions) ---
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "mern-blog-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Add custom policy to allow pulling SSM secrets
resource "aws_iam_role_policy" "ssm_policy" {
  name = "ecs-ssm-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = ["ssm:GetParameters"]
      Effect   = "Allow"
      Resource = [aws_ssm_parameter.mongo_uri.arn]
    }]
  })
}

# --- TASK DEFINITION ---
resource "aws_ecs_task_definition" "mern_task" {
  family                   = "mern-blog-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "mern-backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true
      portMappings = [{ containerPort = 3000, hostPort = 3000 }]
      secrets = [
        { name = "MONGO_URI", valueFrom = aws_ssm_parameter.mongo_uri.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/mern-blog"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "backend"
        }
      }
    },
    {
      name      = "mern-frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true
      portMappings = [{ containerPort = 80, hostPort = 80 }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/mern-blog"
          "awslogs-region"        = "us-east-1"
          "awslogs-stream-prefix" = "frontend"
        }
      }
    }
  ])
}

# --- SERVICE ---
resource "aws_ecs_service" "mern_service" {
  name            = "mern-blog-service"
  cluster         = aws_ecs_cluster.mern_cluster.id
  task_definition = aws_ecs_task_definition.mern_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet.id]
    security_groups  = [aws_security_group.mern_sg.id]
    assign_public_ip = true
  }
}