#vpc

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  instance_tenancy     = "default"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.prefix}-eks-vpc"
    Environment = "${var.prefix}-production"
  }
}

#internet gateway

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name                                        = "${var.prefix}-eks-igw"
    Environment                                 = "${var.prefix}-production"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
  depends_on = [aws_vpc.main]
}

#subnets

resource "aws_subnet" "priv_zone_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.priv_subnet_1
  availability_zone = var.az_1

  tags = {
    Name                                        = "${var.prefix}-eks-priv-sub-1"
    Environment                                 = "${var.prefix}-production"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }
  depends_on = [aws_vpc.main]
}

resource "aws_subnet" "priv_zone_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.priv_subnet_2
  availability_zone = var.az_2

  tags = {
    Name                                        = "${var.prefix}-eks-priv-sub-2"
    Environment                                 = "${var.prefix}-production"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }
  depends_on = [aws_vpc.main]
}

resource "aws_subnet" "pub_zone_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.pub_subnet_1
  availability_zone       = var.az_1
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.prefix}-eks-pub-sub-1"
    Environment                                 = "${var.prefix}-production"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
  depends_on = [aws_vpc.main]
}

resource "aws_subnet" "pub_zone_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.pub_subnet_2
  availability_zone       = var.az_2
  map_public_ip_on_launch = true

  tags = {
    Name                                        = "${var.prefix}-eks-pub-sub-2"
    Environment                                 = "${var.prefix}-production"
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
  depends_on = [aws_vpc.main]
}

#NAT 

resource "aws_eip" "eip" { #static ip for nat gateway
  domain = "vpc"

  tags = {
    Name        = "${var.prefix}-eks-nat-eip"
    Environment = "${var.prefix}-production"
  }
  depends_on = [aws_vpc.main]
}

resource "aws_nat_gateway" "natgw" {
  allocation_id = aws_eip.eip.id
  subnet_id     = aws_subnet.pub_zone_1.id


  tags = {
    Name        = "${var.prefix}-eks-nat-gateway"
    Environment = "${var.prefix}-production"
  }
  depends_on = [aws_vpc.main, aws_eip.eip, aws_internet_gateway.igw]
}

#route tables

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.natgw.id #default route
  }

  tags = {
    Name        = "${var.prefix}-eks-priv-route-table"
    Environment = "${var.prefix}-production"
  }
  depends_on = [aws_vpc.main]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id #default route
  }

  tags = {
    Name        = "${var.prefix}-eks-pub-route-table"
    Environment = "${var.prefix}-production"
  }
  depends_on = [aws_vpc.main]
}

#route table subnet associations

resource "aws_route_table_association" "priv_zone_1" {
  subnet_id      = aws_subnet.priv_zone_1.id
  route_table_id = aws_route_table.private.id
  depends_on     = [aws_vpc.main, aws_subnet.priv_zone_1]
}

resource "aws_route_table_association" "priv_zone_2" {
  subnet_id      = aws_subnet.priv_zone_2.id
  route_table_id = aws_route_table.private.id
  depends_on     = [aws_vpc.main, aws_subnet.priv_zone_2]
}

resource "aws_route_table_association" "pub_zone_1" {
  subnet_id      = aws_subnet.pub_zone_1.id
  route_table_id = aws_route_table.public.id
  depends_on     = [aws_vpc.main, aws_subnet.pub_zone_1]
}

resource "aws_route_table_association" "pub_zone_2" {
  subnet_id      = aws_subnet.pub_zone_2.id
  route_table_id = aws_route_table.public.id
  depends_on     = [aws_vpc.main, aws_subnet.pub_zone_2]
}
