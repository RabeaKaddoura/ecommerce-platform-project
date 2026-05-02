output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [aws_subnet.pub_zone_1.id, aws_subnet.pub_zone_2.id]
}

output "private_subnet_ids" {
  value = [aws_subnet.priv_zone_1.id, aws_subnet.priv_zone_2.id]
}

output "nat_gateway_id" {
  value = aws_nat_gateway.natgw.id
}

output "internet_gateway_id" {
  value = aws_internet_gateway.igw.id
}
