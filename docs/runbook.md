# Operations Runbook

## 1. Infrastructure Setup (Terraform)
```bash
cd terraform/prod
terraform init
terraform plan
terraform apply
```
Update kubeconfig after apply:
```bash
aws eks update-kubeconfig --region <AWS_REGION> --name <CLUSTER_NAME>
```
---
## 2. Namespace Creation
```bash
kubectl create namespace argocd
kubectl create namespace argo-rollouts
kubectl create namespace monitoring
```
---
## 3. Argo Rollouts Installation
Must be installed before ArgoCD so that Rollout CRDs exist when ArgoCD syncs the helm charts:
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argo-rollouts argo/argo-rollouts -n argo-rollouts --create-namespace
```
---
## 4. Kafka Installation
```bash
# Install Strimzi operator
kubectl apply -f https://strimzi.io/install/latest?namespace=default -n default

# Wait for operator to be running
kubectl get pods -n default -l name=strimzi-cluster-operator

# Create Kafka cluster
kubectl apply -f helm/kafka.yaml

# Wait for Kafka to be ready
kubectl wait kafka/kafka --for=condition=Ready --timeout=300s -n default

# Verify bootstrap service
kubectl get service -n default | grep kafka
```
Bootstrap server: `kafka-kafka-bootstrap.default.svc.cluster.local:9092`

---
## 5. Database Initialization
Get DB credentials from Secrets Manager:
```bash
aws secretsmanager get-secret-value --secret-id <secret-id e.g. /prod/backend/secrets> --query SecretString --output text
```
Connect to RDS from inside the cluster (RDS is in private subnet, not reachable locally):
```bash
kubectl run psql --image=postgres:17 --restart=Never --rm -it --env=PGPASSWORD=<DB_PASSWORD> -- psql "host=<RDS_ENDPOINT> port=5432 user=<DB_USERNAME> dbname=postgres sslmode=require"
```
```sql
CREATE DATABASE auth_db;
CREATE DATABASE cart_db;
CREATE DATABASE order_db;
CREATE DATABASE payment_db;
CREATE DATABASE product_db;
\q
```
---
## 6. ArgoCD Installation
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --server-side --force-conflicts
```
Get admin password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```
Port forward to access UI:
```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443
```
---
## 7. ArgoCD Image Updater Installation
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/config/install.yaml
```
Annotate Image Updater service account with IAM role ARN (Terraform output):
```bash
kubectl annotate serviceaccount argocd-image-updater-controller -n argocd eks.amazonaws.com/role-arn=<image_updater_role_arn>
kubectl rollout restart deployment argocd-image-updater-controller -n argocd
```
Apply ImageUpdater CRs:
```bash
kubectl apply -f argocd/image-updater.yaml
```
---
## 8. Deploy Shared Resources
Deploy ALB ingress and backend-common before ArgoCD takes over the rest:
```bash
helm install backend-common ./helm/backend-common
helm install alb ./helm/alb
```
Get ALB DNS name and update frontend values.yaml productServiceUrl:
```bash
kubectl get ingress alb-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
---
## 9. Update Image Tags and Deploy via ArgoCD
Update image tags in each chart's values.yaml to match the latest ECR tags, then commit and push:
```bash
git add .
git commit -m "update image tags"
git push
```
Apply the ApplicationSet — ArgoCD will sync all helm charts from the repo:
```bash
kubectl apply -f argocd/application.yaml
```
---
## 10. Prometheus and Grafana Installation
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```
Without persistence (testing):
```bash
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace --set prometheus.prometheusSpec.storageSpec=null --set alertmanager.alertmanagerSpec.storage=null
```
Port forward Prometheus:
```bash
kubectl port-forward svc/prometheus-server -n monitoring 4001:80
```
Port forward Grafana:
```bash
kubectl port-forward svc/monitoring-grafana -n monitoring 3000:80
```
Get Grafana admin password:
```bash
kubectl get secret monitoring-grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode
```
---
## 11. Stripe Webhook Registration
After ALB is provisioned, register in Stripe dashboard:
- URL: `http://<ALB_DNS_NAME>/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook secret and add it to AWS Secrets Manager under `stripe_webhook_secret`
---
## 12. Promote User to Admin
```bash
kubectl run psql --image=postgres:17 --restart=Never --rm -it --env=PGPASSWORD=<DB_PASSWORD> -- psql "host=<RDS_ENDPOINT> port=5432 user=<DB_USERNAME> dbname=auth_db sslmode=require"
```
```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
\q
```
---
## Common Operations
Check pod logs:
```bash
kubectl logs -f <pod-name> -n <namespace>
```
Force ArgoCD sync:
```bash
argocd app sync <app-name>
```
Canary rollout status:
```bash
kubectl argo rollouts get rollout <rollout-name> -n default --watch
```
Promote canary:
```bash
kubectl argo rollouts promote <rollout-name> -n default
```
Abort canary:
```bash
kubectl argo rollouts abort <rollout-name> -n default
```
---
## Local Development
Start all services:
```bash
docker-compose up --build
```
Stripe webhook forwarding:
```bash
stripe listen --forward-to localhost:8004/api/payments/webhook
```