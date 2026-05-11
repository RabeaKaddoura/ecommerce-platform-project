#Network Module

module "network" {
  source = "../modules/network"

  cluster_name  = var.cluster_name
  vpc_cidr      = var.vpc_cidr
  prefix        = var.prefix
  env           = var.env
  az_1          = var.az_1
  az_2          = var.az_2
  priv_subnet_1 = var.priv_subnet_1
  priv_subnet_2 = var.priv_subnet_2
  pub_subnet_1  = var.pub_subnet_1
  pub_subnet_2  = var.pub_subnet_2
}

#EKS Module


module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 21.0"

  name               = var.cluster_name
  kubernetes_version = var.cluster_version


  enable_irsa             = true
  endpoint_public_access  = true
  endpoint_private_access = true

  enable_cluster_creator_admin_permissions = true

  #overriding defaults
  create_cloudwatch_log_group = false
  enable_kms_key_rotation     = false

  vpc_id     = module.network.vpc_id
  subnet_ids = module.network.private_subnet_ids

  #extending cluster security group
  security_group_additional_rules = {
    allow = {
      description                = "To node 1025-65535"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "egress"
      source_node_security_group = true
    }
  }


  #extending node-to-node security group rules
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
    egress_all = {
      description = "Node all egress"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "egress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  eks_managed_node_groups = {
    workers = {
      ami_type       = "AL2023_x86_64_STANDARD"
      instance_types = ["m7i-flex.large"]

      min_size     = 2
      max_size     = 3
      desired_size = 2
    }
  }

  tags = {
    Name        = "${var.prefix}-eks-cluster"
    Environment = "${var.prefix}-${var.env}"
  }
}


module "eks_blueprints_addons" {
  source  = "aws-ia/eks-blueprints-addons/aws"
  version = "~> 1.23.0"

  cluster_name      = module.eks.cluster_name
  cluster_endpoint  = module.eks.cluster_endpoint
  cluster_version   = module.eks.cluster_version
  oidc_provider_arn = module.eks.oidc_provider_arn

  eks_addons = {
    coredns = {
      most_recent = true
    }
    vpc-cni = {
      most_recent    = true
      before_compute = true
    }
    kube-proxy = {
      most_recent = true
    }
  }

  enable_aws_load_balancer_controller          = true
  enable_metrics_server                        = true
  enable_secrets_store_csi_driver              = true
  enable_secrets_store_csi_driver_provider_aws = true

  secrets_store_csi_driver = {
    set = [
      {
        name  = "syncSecret.enabled"
        value = "true"
      }
    ]
  }


  aws_load_balancer_controller = { #load balancer controller configuration
    repository    = "https://aws.github.io/eks-charts"
    chart         = "aws-load-balancer-controller"
    namespace     = "kube-system"
    chart_version = "1.17.0"

    wait          = true
    wait_for_jobs = true

    values = [
      yamlencode({ #adjusting helm values
        cluster_name = module.eks.cluster_name
        region       = var.aws_region
        vpcId        = module.network.vpc_id
        replicaCount = 2
      })
    ]
  }
}





#ECR Module

module "ecr" {
  source = "../modules/ecr"

  prefix = var.prefix
  env    = var.env
}



#RDS Module

resource "random_password" "db_password" { #randomly generated db password
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}:?"
}

module "postgres" {
  source = "../modules/rds"

  prefix         = var.prefix
  env            = var.env
  db_name        = var.db_name
  subnet_ids     = module.network.private_subnet_ids
  vpc_id         = module.network.vpc_id
  eks_node_sg_id = module.eks.node_security_group_id
  db_username    = var.db_username
  db_password    = random_password.db_password.result

  depends_on = [module.eks]
}


#secret store

module "secret_store" {
  source                 = "../modules/secret-store"
  prefix                 = var.prefix
  env                    = var.env
  secret_name            = var.secret_name
  db_username            = module.postgres.db_username
  db_endpoint            = module.postgres.db_endpoint
  db_port                = module.postgres.db_port
  db_password            = random_password.db_password.result
  auth_secret_key        = var.auth_secret_key
  stripe_secret_key      = var.stripe_secret_key
  stripe_webhook_secret  = var.stripe_webhook_secret
  stripe_publishable_key = var.stripe_publishable_key

}


