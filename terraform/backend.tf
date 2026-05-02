terraform {
  backend "s3" {
    bucket       = "coiner-tf-backend-s3-bucket"
    key          = "coiner-eks/terraform"
    region       = "us-east-1"
    use_lockfile = true
  }
}
