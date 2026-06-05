#Fetch the managed AllViewer origin request policy dynamically
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

#Fetch the managed CachingDisabled policy dynamically
data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

#Fetch the managed CachingOptimized policy dynamically
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

resource "aws_s3_bucket" "product_images" {
  bucket = "${var.prefix}-product-images-${var.env}"
  tags = {
    Name        = "${var.prefix}-product-images"
    Environment = "${var.prefix}-${var.env}"
  }
}

resource "aws_s3_bucket_public_access_block" "product_images" {
  bucket                  = aws_s3_bucket.product_images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


resource "aws_cloudfront_origin_access_control" "product_images" {
  name                              = "${var.prefix}-product-images-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

#CloudFront distribution — S3 + ALB origins

resource "aws_cloudfront_distribution" "product_images" {
  enabled     = true
  comment     = "${var.prefix}-cdn-${var.env}"
  price_class = "PriceClass_100"

  #Origin 1: S3 (product images).
  origin {
    domain_name              = aws_s3_bucket.product_images.bucket_regional_domain_name
    origin_id                = "product-images-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.product_images.id
  }

  #Origin 2: ALB (frontend + all API traffic).
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  #Cache behavior 1: /images/* → S3, long cache.
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    target_origin_id       = "product-images-s3"
    viewer_protocol_policy = "allow-all"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    #AWS managed: CachingOptimized.
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  #Cache behavior 2: /api/* → ALB, NO cache. 
  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "allow-all"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    #AWS managed: CachingDisabled.
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_disabled.id
    #AWS managed: AllViewer — forwards all headers/cookies/query strings.
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  #Cache behavior 3: /assets/* → ALB, long cache;
  #Vite fingerprints filenames so long TTL is safe.
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "allow-all"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    #AWS managed: CachingOptimized.
    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  #Default behavior: everything else → ALB, no cache;
  #index.html must never be stale after a deploy.
  default_cache_behavior {
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "allow-all"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    #AWS managed: CachingDisabled.
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name        = "${var.prefix}-cdn"
    Environment = "${var.prefix}-${var.env}"
  }
}



resource "aws_s3_bucket_policy" "product_images" {
  bucket = aws_s3_bucket.product_images.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.product_images.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.product_images.arn
        }
      }
    }]
  })
}


output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.product_images.domain_name}"
}

output "s3_bucket_name" {
  value = aws_s3_bucket.product_images.bucket
}

output "cloudfront_distribution_id" {
  description = "Needed for cache invalidation in CI/CD after frontend deploys"
  value       = aws_cloudfront_distribution.product_images.id
}
