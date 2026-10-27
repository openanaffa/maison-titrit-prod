// ---------------------------------------------------------------------------
// OCI — ARM compute for the Strapi CMS (Task 05). Provisioned once the oci
// CLI credentials exist locally (~/.oci/config). Shaped for the ALWAYS FREE
// A1 allotment (up to 4 OCPU / 24GB across instances; we use half, leaving
// room for a second instance).
// ---------------------------------------------------------------------------

variable "oci_tenancy_ocid" {
  type        = string
  description = "Tenancy OCID (console → tenancy page)."
}

variable "oci_user_ocid" {
  type        = string
  description = "User OCID (console → profile → user object)."
}

variable "oci_fingerprint" {
  type        = string
  description = "MD5 fingerprint of ~/.oci/oci_api_key_public.pem."
}

variable "oci_private_key_path" {
  type        = string
  description = "Local path to the unencrypted API private key."
  default     = "~/.oci/oci_api_key.pem"
}

variable "oci_region" {
  type        = string
  description = "Home region, e.g. eu-frankfurt-1 (the closest/cheapest to Morocco)."
}

variable "oci_compartment_ocid" {
  type        = string
  description = "Compartment for the instance resources. Defaults to the root compartment at apply time."
}

variable "ssh_public_key" {
  type        = string
  description = "Public key authorized on the instance (IDE: ~/.ssh/oci_strapi_ed25519.pub of the machine used to deploy)."
}

variable "admin_ssh_anywhere" {
  type        = bool
  description = "Open SSH to 0.0.0.0/0. True only for initial setup; tighten to your IP after first login."
  default     = true
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.oci_compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}
