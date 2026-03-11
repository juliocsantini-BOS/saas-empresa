variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "saas-ia"
}

variable "env" {
  type    = string
  default = "prod"
}

# (vamos usar depois)
variable "jwt_secret" {
  type      = string
  sensitive = true
  default   = "change-me"
}

variable "database_url" {
  type      = string
  sensitive = true
  default   = "change-me"
}

variable "redis_url" {
  type      = string
  sensitive = true
  default   = "change-me"
}
