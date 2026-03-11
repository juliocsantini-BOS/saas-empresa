terraform {
  backend "s3" {
    bucket         = "saas-ia-tfstate-457915501239-us-east-1"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "saas-ia-tflock"
    encrypt        = true
  }
}
