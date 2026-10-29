# Maison Titrit — production infrastructure (codified)

Managed: Cloudflare DNS records for maisontitrit.com.
Not managed here (by design): Vercel project/envs, R2 bucket contents,
OCI compute (stubbed for a future section).

Terraform state: local by default — keep an eye on `terraform.tfstate`,
it is gitignored. Nothing secret belongs inside any *.tf file; every
sensitive value is a variable fed from terraform.tfvars (gitignored).

## Import the live records into state

Grab record IDs once:

```sh
CLOUDFLARE_API_TOKEN=$(pass show cloudflare/maisontitrit/api-token) \
  curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?per_page=50"
```

Then, per record:

```sh
terraform import cloudflare_dns_record.root_a_1 "<zone_id>/<record_id>"
```

## Workflow

```sh
cd terraform
terraform init
terraform plan   # review drift against the live zone
terraform apply
```

## State

State is in the private R2 bucket `maison-titrit-backups` at `tfstate/maison-titrit/terraform.tfstate` (migrated from local on 2026-10-29). Before any `tofu` command:

```sh
export AWS_ACCESS_KEY_ID=$(pass show maison-titrit/backup/r2-access-key-id)
export AWS_SECRET_ACCESS_KEY=$(pass show maison-titrit/backup/r2-secret-access-key)
tofu init
```

No state locking: run one `tofu apply` at a time.
