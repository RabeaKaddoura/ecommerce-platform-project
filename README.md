# 🚀 Cloud-Native E-Commerce Microservices Platform

A full-stack e-commerce platform built with a microservices architecture and deployed on AWS EKS using a complete GitOps workflow.

This project focuses on Kubernetes, CI/CD automation, GitOps deployments, event-driven communication, secure secret management, and production-style troubleshooting across distributed systems.

---

# 📌 Table of Contents

* 📐 [Architecture Diagram](#architecture-diagram)
* 🧰 [Tech Stack](#tech-stack)
* 🏗️ [Architecture](#architecture)
* 🔄 [GitOps Workflow](#gitops-workflow)
* 🔐 [Security](#security)
* 📊 [Monitoring](#monitoring)
* 🧯 [Troubleshooting & Real-World Issues](#troubleshooting--real-world-issues)
* 🖼️ [Screenshots](#screenshots)
* 📚 [Documentation](#documentation)
* 🚧 [Future Improvements](#future-improvements)

---

# 📐 Architecture Diagram

![Architecture Diagram](docs/architecture.png)

---

# 🧰 Tech Stack

## 🖥️ Backend

* FastAPI
* Tortoise ORM
* PostgreSQL
* Kafka (Strimzi)
* Stripe

## 🎨 Frontend

* React
* TypeScript
* Vite
* TailwindCSS

## ☁️ Infrastructure & DevOps

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

# 🏗️ Architecture

The platform consists of 5 backend microservices:

* auth-svc
* cart-svc
* order-svc
* product-svc
* payment-svc

Services communicate through:

* Kubernetes internal networking
* Kafka event streaming

### Kafka events

* `order.created`
* `payment.succeeded`
* `payment.failed`

### Example flow

* order-svc → publishes `order.created`
* cart-svc → consumes event and clears cart
* payment-svc → publishes payment result
* order-svc → updates order status

Each service uses its own PostgreSQL database inside a shared AWS RDS instance.

---

# 🔄 GitOps Workflow

1. Code pushed to GitHub
2. GitHub Actions builds Docker images
3. Images pushed to AWS ECR
4. ArgoCD Image Updater detects new tags
5. Updates committed back to Git
6. ArgoCD syncs Helm charts
7. Argo Rollouts executes canary deployment

### 🚦 Canary strategy

* 10% traffic
* 50% manual promotion
* 100% rollout

---

# 🔐 Security

Secrets are managed via AWS Secrets Manager and injected using:

* CSI Secrets Store Driver
* IAM Roles for Service Accounts (IRSA)

### Benefits

* No secrets in Git
* No Helm secrets exposure
* Least-privilege access enforced

---

# 📊 Monitoring

* Prometheus
* Grafana

Used for:

* Cluster health
* Pod metrics
* Deployment debugging

---

# 🧯 Troubleshooting & Real-World Issues

This project focuses heavily on real failure scenarios.

### ⚠️ ALB Namespace Issue

ALB stopped detecting services after namespace separation.

Fix: moved ingress + services into same namespace.

---

### ⚠️ ArgoCD Degraded Apps

Missing Helm values caused template failures.

Fix: migrated secrets to AWS Secrets Manager + CSI driver.

---

### ⚠️ Image Updater Breakage

Annotation-based config deprecated after upgrade.

Fix: migrated to CRD-based ImageUpdater resources.

---

### ⚠️ Kafka PVC Pending

No storage class available.

Fix: disabled persistence for portfolio setup.

---

### ⚠️ Bitnami Kafka Removal

Images became unavailable.

Fix: migrated to Strimzi + Kafka 4.0 + KRaft mode.

---

### ⚠️ DB Port Crash

Port injected as string from secrets.

Fix: casted to integer in service config.

---

### ⚠️ IRSA Misconfiguration

Wrong namespace in IAM trust policy.

Fix: updated Terraform + trust relationship.

---

# 🖼️ Screenshots

## 🧭 ArgoCD Dashboard

![ArgoCD Dashboard](docs/images/argocd-dashboard.png)

---

## 📈 Grafana Dashboard

![Grafana Dashboard](docs/images/grafana-dashboard.png)

---

# 📚 Documentation

Setup and operational procedures:

* Runbook → `docs/runbook.md`

---

# 🚧 Future Improvements

* API Gateway integration
* Redis caching layer
* Distributed tracing
* Performance optimization
* Observability upgrades


* Event-driven systems
* Production debugging
