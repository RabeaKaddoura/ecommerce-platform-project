data "aws_iam_policy_document" "image_updater_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"
    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:sub"
      values   = ["system:serviceaccount:argocd:argocd-image-updater-controller"]
    }
    condition {
      test     = "StringEquals"
      variable = "${replace(module.eks.cluster_oidc_issuer_url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
    principals {
      identifiers = [module.eks.oidc_provider_arn]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "image_updater" {
  assume_role_policy = data.aws_iam_policy_document.image_updater_assume_role_policy.json
  name               = "${var.prefix}-image-updater-role"
}

resource "aws_iam_role_policy_attachment" "image_updater_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.image_updater.name
}

output "image_updater_role_arn" {
  value = aws_iam_role.image_updater.arn
}
