variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token with Zone.DNS Edit permissions for maisontitrit.com (pass: cloudflare/maisontitrit/api-token)."
  sensitive   = true
}

variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID for maisontitrit.com."
  default     = "9c65bf2d00e9df7d88d4712b0eb7c08f"
}

variable "apex_a_records" {
  description = "Apex A records pointing at Vercel (two IPs may rotate; keep in sync with the Vercel domains inspector)."
  type        = list(string)
  default     = ["64.29.17.1", "216.198.79.1"]
}

variable "www_cname_target" {
  type        = string
  description = "CNAME target for www.maisontitrit.com (Vercel)."
  default     = "44cbb78f5a4b9225.vercel-dns-017.com"
}


variable "spf_record" {
  type        = string
  description = "Apex SPF record. Allows Cloudflare Email Routing (inbound forwarding); Brevo passes DMARC via its own DKIM, so it needs no entry here."
  default     = "v=spf1 include:_spf.mx.cloudflare.net ~all"
}

variable "dkim_record" {
  type        = string
  description = "Wildcard DKIM refusal record — any selector without its own record (e.g. Brevo's brevo1/brevo2._domainkey) resolves to an empty key."
  default     = "v=DKIM1; p="
}

variable "dmarc_record" {
  type        = string
  description = "DMARC policy. p=reject enforces; set rua= to a mailbox you actually monitor."
  default     = "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; rua=mailto:ops@maisontitrit.com"
}
