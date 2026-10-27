output "zone_id" {
  value = var.zone_id
}

output "managed_record_names" {
  value = [
    "maisontitrit.com/APEX_A",
    "www.maisontitrit.com",
    "cdn.maisontitrit.com",
    "maisontitrit.com/SPF",
    "*._domainkey.maisontitrit.com",
    "_dmarc.maisontitrit.com",
  ]
}
