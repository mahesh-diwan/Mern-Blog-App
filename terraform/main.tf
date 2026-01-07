terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Or your closest region
}

# ECS Cluster for our MERN App
resource "aws_ecs_cluster" "mern_cluster" {
  name = "mern-blog-cluster"
}

# ECR Repositories to store our Docker Images
resource "aws_ecr_repository" "backend" {
  name = "mern-backend"
}

resource "aws_ecr_repository" "frontend" {
  name = "mern-frontend"
}

# 1. Create a VPC
resource "aws_vpc" "mern_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "mern-blog-vpc" }
}

# 2. Create a Public Subnet (for Frontend/Load Balancer)
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.mern_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
}

# 3. Security Group for the Backend (Port 3000)
resource "aws_security_group" "backend_sg" {
  name   = "backend-sg"
  vpc_id = aws_vpc.mern_vpc.id

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # We will narrow this down later
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
# IAM Role for ECS Task Execution
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

# Attach the standard execution policy
resource "aws_iam_role_policy_attachment" "ecs_execution_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_ecs_task_definition" "mern_task" {
  family                   = "mern-blog-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512" # 0.5 vCPU
  memory                   = "1024" # 1GB RAM
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    # Backend Container
    {
      name      = "mern-backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true
      portMappings = [{
        containerPort = 3000
        hostPort      = 3000
      }]
      environment = [
        { name = "NODE_ENV", value = "production" }
      ]
    },
    # Frontend Container (Nginx)
    {
      name      = "mern-frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true
      portMappings = [{
        containerPort = 80
        hostPort      = 80
      }]
    }
  ])
}
resource "aws_ecs_service" "mern_service" {
  name            = "mern-blog-service"
  cluster         = aws_ecs_cluster.mern_cluster.id
  task_definition = aws_ecs_task_definition.mern_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet.id]
    security_groups  = [aws_security_group.backend_sg.id]
    assign_public_ip = true
  }
}