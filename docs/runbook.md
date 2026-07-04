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
## 2. Cluster Bootstrap (Ansible)
All steps from namespace creation through Prometheus/Grafana are automated via Ansible.

Before running, fill in your AWS account ID in `ansible/bootstrap.yaml`:
```yaml
image_updater_role_arn: "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/ecom-image-updater-role"
```
Then run from the repo root:
```bash
ansible-playbook ansible/bootstrap.yml
```
The playbook automates:
- Namespace creation (argocd, argo-rollouts, monitoring)
- Argo Rollouts installation
- Strimzi operator + Kafka cluster (waits for ready)
- ArgoCD installation
- ArgoCD Image Updater installation + IAM role annotation
- backend-common, ALB, Redis helm installs
- Prometheus + Grafana installation

After the playbook completes, run the following manual steps before proceeding:
1. Get ALB DNS: `kubectl get ingress alb-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'`
2. Add it to `terraform/prod/terraform.tfvars` as `alb_dns_name`
3. Run `cd terraform/prod && terraform apply`

---
## 3. Update Image Tags, Secret Store ARN, and CloudFront URL, then Deploy via ArgoCD
Update image tags in each chart's values.yaml to match the latest ECR tags, Secret Store ARN in backend-common chart, and CloudFront URL in frontend chart. S3 bucket name should already be set from Terraform outputs in helm/frontend/values.yaml.
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
## 4. Database Initialization
RDS is in a private subnet — must be accessed from inside the cluster via a temporary pod.

Get DB credentials from Secrets Manager:
```bash
aws secretsmanager get-secret-value --secret-id <secret-id e.g. /prod/backend/secrets> --query SecretString --output text
```
Connect and create databases:
```bash
kubectl run psql --image=postgres:17 --restart=Never --rm -it --env='PGPASSWORD=<DB_PASSWORD>' -- psql "host=<RDS_ENDPOINT> port=5432 user=<DB_USERNAME> dbname=postgres sslmode=require"
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
## 5. Stripe Webhook Registration
After ALB is provisioned, register in Stripe dashboard:
- URL: `https://<CLOUDFRONT_DOMAIN>/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the webhook secret and add it to AWS Secrets Manager under `stripe_webhook_secret`

---
## 6. Promote User to Admin
```bash
kubectl run psql --image=postgres:17 --restart=Never --rm -it --env='PGPASSWORD=<DB_PASSWORD>' -- psql "host=<RDS_ENDPOINT> port=5432 user=<DB_USERNAME> dbname=auth_db sslmode=require"
```
```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your@email.com';
\q
```
---
## 7. ArgoCD UI Access
Get admin password:
```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d
```
Port forward to access UI:
```bash
kubectl port-forward -n argocd svc/argocd-server 8080:443
```
---
## 8. Monitoring Access
Port forward Prometheus:
```bash
kubectl port-forward svc/monitoring-kube-prometheus-prometheus -n monitoring 4001:9090
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