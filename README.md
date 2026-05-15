# Cloud-Native E-Commerce Microservices Platform

A full-stack e-commerce platform built with a microservices architecture and deployed on AWS EKS using a complete GitOps workflow.

This project focuses on Kubernetes, CI/CD automation, GitOps deployments, event-driven communication, secure secret management, and production-style troubleshooting across distributed systems.

---

# Table of Contents

* [Architecture Diagram](#architecture-diagram)
* [Tech Stack](#tech-stack)
* [Architecture](#architecture)
* [GitOps Workflow](#gitops-workflow)
* [Security](#security)
* [Monitoring](#monitoring)
* [Troubleshooting & Real-World Issues](#troubleshooting--real-world-issues)
* [Screenshots](#screenshots)
* [Documentation](#documentation)
* [Future Improvements](#future-improvements)


---

# Architecture Diagram

![Architecture Diagram](docs/architecture.png)

---

# Tech Stack

## Backend

* FastAPI
* Tortoise ORM
* PostgreSQL
* Kafka (Strimzi)
* Stripe

## Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## Infrastructure & DevOps

* AWS EKS
* AWS RDS PostgreSQL
* AWS ECR
* AWS ALB
* AWS Secrets Manager
* Terraform
* Helm
* ArgoCD
* Argo Rollouts
* ArgoCD Image Updater
* Prometheus
* Grafana

---

# Architecture

The platform consists of 5 backend microservices:

* auth-svc
* cart-svc
* order-svc
* product-svc
* payment-svc

Services communicate through:

* Internal Kubernetes networking
* Kafka event streaming

Kafka events used:

* `order.created`
* `payment.succeeded`
* `payment.failed`

Example workflow:

* `order-svc` publishes `order.created`
* `cart-svc` consumes the event and clears the user cart
* `payment-svc` publishes payment events
* `order-svc` updates order status accordingly

Each service has its own PostgreSQL database hosted inside a shared AWS RDS instance.

---

# GitOps Workflow

The deployment pipeline is fully automated using GitOps principles:

1. Code is pushed to GitHub
2. GitHub Actions builds Docker images
3. Images are pushed to AWS ECR
4. ArgoCD Image Updater detects new image tags
5. Updated tags are committed back to Git
6. ArgoCD detects repository changes
7. Helm charts are synced automatically
8. Argo Rollouts performs canary deployments

Deployment rollout flow:

* 10% traffic
* Manual promotion to 50%
* Full rollout to 100%

---

# Security

Sensitive credentials are stored in AWS Secrets Manager and injected into Kubernetes pods using:

* CSI Secrets Store Driver
* IAM Roles for Service Accounts (IRSA)

This avoids storing secrets directly in:

* Git repositories
* Helm values
* Kubernetes manifests

Additional security measures:

* Least-privilege IAM access
* Dedicated Kubernetes service accounts
* AWS security groups

---

# Monitoring

Monitoring stack:

* Prometheus
* Grafana

Used for:

* Cluster monitoring
* Pod visibility
* Resource metrics
* Deployment troubleshooting

---

# Troubleshooting & Real-World Issues

A major goal of this project was gaining experience debugging real infrastructure and deployment issues rather than only deploying happy-path environments.

### ALB Namespace Issue

The AWS ALB stopped detecting backend services after moving them into another Kubernetes namespace.

**Diagnosis**

* Checked ALB target group health
* Reviewed ingress events

**Fix**

* Moved services back into the same namespace as the ingress resource

---

### ArgoCD Degraded Applications

Applications became degraded because required Helm values were missing during template rendering.

**Diagnosis**

* Investigated ArgoCD sync error logs

**Fix**

* Reworked secret management using AWS Secrets Manager + CSI Driver instead of Helm runtime secrets

---

### ArgoCD Image Updater Migration

Image Updater stopped functioning after upgrading versions because the annotation-based configuration became deprecated.

**Diagnosis**

* Checked Image Updater controller logs

**Fix**

* Migrated to the newer CRD-based ImageUpdater resources

---

### Kafka Persistent Volume Issues

Kafka pods stayed stuck in `Pending` state because PersistentVolumeClaims could not bind.

**Diagnosis**

* Described pending Kafka pods

**Fix**

* Disabled persistence for the portfolio environment

---

### Kafka Image Migration

Bitnami Kafka images became unavailable.

**Fix**

* Migrated to Strimzi operator
* Upgraded Kafka to 4.0
* Migrated from ZooKeeper to KRaft mode

---

### Database Port Type Error

All backend services crashed with:

```text id="s8e7rp"
ConfigurationError: Port is not an integer
```

**Diagnosis**

* Checked application pod logs

**Fix**

* Converted DB_PORT values from string to integer before constructing database URLs

---

### IRSA Trust Policy Misconfiguration

Pods failed to assume IAM roles because the trust policy referenced the wrong Kubernetes namespace.

**Diagnosis**

* Investigated FailedMount events and STS AssumeRole errors

**Fix**

* Updated IAM trust relationships and Terraform configuration

---

# Screenshots

## ArgoCD Dashboard

![ArgoCD Dashboard](docs/images/argocd-dashboard.png)

---

## Grafana Dashboard

![Grafana Dashboard](docs/images/grafana-dashboard.png)

---

# Documentation

Detailed setup, deployment, and operational procedures are available in:

* [Runbook](docs/runbook.md)

---

# Future Improvements

This infrastructure is still evolving.

Planned improvements include:

* API Gateway integration
* Redis caching
* Distributed tracing
* Improved observability
* Horizontal scaling optimizations




