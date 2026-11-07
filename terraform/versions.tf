terraform {
  required_version = ">= 1.6.0"

  # State lives in the private R2 bucket (not on a laptop). Credentials come
  # from AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY = the R2 backup token
  # (pass maison-titrit/backup/r2-*); see terraform/README.md.
  backend "s3" {
    bucket                      = "maison-titrit-backups"
    key                         = "tfstate/maison-titrit/terraform.tfstate"
    region                      = "auto"
    endpoints                   = { s3 = "https://7577608ff63b9ded411f29faa3e507a7.r2.cloudflarestorage.com" }
    use_path_style              = true
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
