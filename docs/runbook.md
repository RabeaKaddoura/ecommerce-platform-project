# Operations Runbook
## 1. Infrastructure Setup (Terraform)
```bash
cd terraform
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
kubectl create namespace frontend
kubectl create namespace backend
kubectl create namespace argocd
kubectl create namespace monitoring
kubectl create namespace argo-rollouts ###
```
---
## 3. ArgoCD Installation
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```
Get admin password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```
Port forward to access UI:
```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443
```
Deploy application:
```bash
kubectl apply -f argocd/application.yaml ###        
```
---
## 4. ArgoCD Image Updater Installation
```bash
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/config/install.yaml
```
Attach ECR read policy to Image Updater IAM role (ARNs are Terraform outputs):
```bash
aws iam attach-role-policy \
  --role-name <IMAGE_UPDATER_ROLE_NAME> \
  --policy-arn <ECR_READ_POLICY_ARN>
```
---
## 5. Argo Rollouts Installation
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm install argo-rollouts argo/argo-rollouts -n argo-rollouts --create-namespace
```
---
## 6. Kafka Installation
```bash
#Install Strimzi operator
kubectl apply -f https://strimzi.io/install/latest?namespace=default -n default

#Wait for operator to be running
kubectl get pods -n default -l name=strimzi-cluster-operator

#Create Kafka cluster
kubectl apply -f helm/kafka.yaml

#Wait for Kafka to be ready
kubectl wait kafka/kafka --for=condition=Ready --timeout=300s -n default

#Verify bootstrap service
kubectl get service -n default | grep kafka
```
Verify Kafka is running:
```bash
kubectl get pods -n default -l app.kubernetes.io/name=kafka
```
---
## 7. Prometheus Installation
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```
With EBS persistence:
```bash
helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```
Without persistence (testing):
```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace \
  --set prometheus.prometheusSpec.storageSpec=null \
  --set alertmanager.alertmanagerSpec.storage=null
```
Port forward:
```bash
kubectl port-forward svc/prometheus-server -n monitoring 4001:80
```
---
## 8. Database Initialization
```bash
#Get DB password from Secrets Manager~
aws secretsmanager get-secret-value --secret-id <secret store id e.g. /prod/backend/secrets> --query SecretString --output text

# Connect to RDS from inside the cluster (RDS is in private subnet, not reachable locally)
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
## 9. Helm Deployments
Deploy backend-common first (shared secret provider and service account):
```bash
helm install backend-common ./helm/backend-common \
  --set secretProvider.secretArn=<ARN> \
  --set serviceAccountRoleArn=<IAM_ROLE_ARN>
```
Deploy backend services:
```bash
helm install auth-svc ./helm/auth-svc --set appSecrets.secretKey=<value>
helm install cart-svc ./helm/cart-svc
helm install order-svc ./helm/order-svc
helm install product-svc ./helm/product-svc
helm install payment-svc ./helm/payment-svc \
  --set appSecrets.stripeSecretKey=<value> \
  --set appSecrets.stripeWebhookSecret=<value>
```
Deploy ALB ingress first to get DNS:
```bash
helm install alb ./helm/alb
```
Get ALB DNS name:
```bash
kubectl get ingress alb-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```
Deploy frontend with ALB DNS:
```bash
helm install frontend ./helm/frontend \
  --set config.productServiceUrl=http://<ALB_DNS> \
  --set config.stripePublishableKey=<value>
```
---
## 10. Stripe Webhook Registration
After ALB is provisioned, register in Stripe dashboard:
- URL: `http://<ALB_DNS_NAME>/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook secret and update it in AWS Secrets Manager
---
## 11. Promote User to Admin
```bash
psql -h <RDS_ENDPOINT> -U postgres -d auth_db
```
```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
\q
```
---
## Common Operations
Restart a deployment:
```bash
kubectl rollout restart deployment/<service-name> -n <namespace>
```
Check pod logs:
```bash
kubectl logs -f deployment/<service-name> -n <namespace>
```
Force ArgoCD sync:
```bash
argocd app sync <app-name>
```
Canary rollout status:
```bash
kubectl argo rollouts get rollout <rollout-name> -n <namespace> --watch
```
Promote canary:
```bash
kubectl argo rollouts promote <rollout-name> -n <namespace>
```
Abort canary:
```bash
kubectl argo rollouts abort <rollout-name> -n <namespace>
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