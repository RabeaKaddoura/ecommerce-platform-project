resource "aws_iam_policy" "product_s3" {
  name = "${var.prefix}-product-s3-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
      Resource = "${aws_s3_bucket.product_images.arn}/*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "product_s3" {
  policy_arn = aws_iam_policy.product_s3.arn
  role       = "ecom-secrets-csi-role" #backend-sa role shared by all services
}
