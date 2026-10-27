// DNS for maisontitrit.com — mirrors the live zone (verified 2026-10-27).
// Apex A records + www CNAME route the storefront to Vercel.
// cdn CNAME routes to the Cloudflare R2 public bucket.
// TXT records lock email spoofing (SPF/DKIM/DMARC all reject).

locals {
  apex_names = ["maisontitrit.com"]
}

resource "cloudflare_record" "apex_a" {
  count = length(var.apex_a_records)

  zone_id = var.zone_id
  name    = "maisontitrit.com"
  type    = "A"
  content = var.apex_a_records[count.index]
  ttl     = 300
  proxied = false
}

resource "cloudflare_record" "www_cname" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = var.www_cname_target
  ttl     = 300
  proxied = false
}

// NOTE: the live "cdn" CNAME (public.r2.dev) is Cloudflare-generated from the
// R2 bucket config and rejects any API edit (error 1052) — it is intentionally
// NOT managed here. Create/rotate it in the R2 public-bucket settings instead
// (dashboard → R2 → bucket → Settings → Public development site).

// cms A record → the OCI Strapi VM. Proxied so Cloudflare terminates TLS;
// the VM itself listens on 127.0.0.1:1337 (docker compose).
resource "cloudflare_record" "cms_a" {
  zone_id = var.zone_id
  name    = "cms"
  type    = "A"
  content = oci_core_instance.cms.public_ip
  ttl     = 1
  proxied = true
}

resource "cloudflare_record" "spf" {
  zone_id = var.zone_id
  name    = "maisontitrit.com"
  type    = "TXT"
  content = var.spf_record
  ttl     = 1
  proxied = false
}

resource "cloudflare_record" "dkim_refuse" {
  zone_id = var.zone_id
  name    = "*._domainkey"
  type    = "TXT"
  content = var.dkim_record
  ttl     = 1
  proxied = false
}

resource "cloudflare_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc"
  type    = "TXT"
  content = var.dmarc_record
  ttl     = 1
  proxied = false
}
