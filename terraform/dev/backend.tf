terraform {
  backend "s3" {
    bucket       = "ecom-tf-backend-dev-s3-bucket"
    key          = "ecom-eks/terraform"
    region       = "us-east-1"
    use_lockfile = true
  }
}
