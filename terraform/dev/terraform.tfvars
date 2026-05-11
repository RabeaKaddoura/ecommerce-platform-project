# General
prefix     = "ecom"
aws_region = "us-east-1"
env        = "dev"

# network

vpc_cidr = "10.0.0.0/16"

az_1 = "us-east-1a"
az_2 = "us-east-1b"

priv_subnet_1 = "10.0.1.0/24"
priv_subnet_2 = "10.0.2.0/24"

pub_subnet_1 = "10.0.101.0/24"
pub_subnet_2 = "10.0.102.0/24"

#eks  

cluster_name = "ecom-cluster"


#secret store

auth_secret_key        = "8f42a3b9c1e6d7f0a2b5c8d4e9f3a6b1c7d2e5f8a4b0c9d3e6f1a8b2c5d7e0f4"
stripe_secret_key      = "sk_test_xxx"
stripe_webhook_secret  = "whsec_xxx"
stripe_publishable_key = "51TKIryDq9rvsBqPl2JpR2wvbLj1C8nnd2FylbVHI2YDI5QyoFhVRf00hXrRls2tmi3FUN95mzTi2yzqcyU64cUB200ByQvYLDk"
