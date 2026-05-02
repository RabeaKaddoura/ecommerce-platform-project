# General
prefix     = "ecom"
aws_region = "us-east-1"
env        = "prod"

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
