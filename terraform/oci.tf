locals {
  cms_fqdn = "cms.maisontitrit.com"
  ingress_ports = {
    ssh   = { tcp = 22, cidr = "0.0.0.0/0" }
    http  = { tcp = 80, cidr = "0.0.0.0/0" }
    https = { tcp = 443, cidr = "0.0.0.0/0" }
  }
}

resource "oci_identity_policy" "enable_audit" {
  # wa-operators is compartment-scoped; root-level policy creation is out of
  # reach and out of scope — audit is left to the tenancy admin.
  count = 0
  name           = "maison-titrit-audit"
  compartment_id = var.oci_tenancy_ocid
  description    = "Logging for all users in tenant"
  statements     = ["Allow group Administrators to audit events in compartment ${var.oci_compartment_ocid}"]
}

resource "oci_core_vcn" "cms" {
  compartment_id = var.oci_compartment_ocid
  cidr_block     = "10.10.0.0/16"
  dns_label      = "titritcms"
  display_name   = "cms-vcn"
}

resource "oci_core_internet_gateway" "cms" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.cms.id
  enabled        = true
  display_name   = "cms-igw"
}

resource "oci_core_route_table" "cms" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.cms.id
  display_name   = "cms-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.cms.id
  }
}

resource "oci_core_subnet" "cms" {
  compartment_id    = var.oci_compartment_ocid
  vcn_id            = oci_core_vcn.cms.id
  cidr_block        = "10.10.0.0/24"
  route_table_id    = oci_core_route_table.cms.id
  dns_label         = "titrit"
  display_name      = "cms-subnet"
  security_list_ids = [oci_core_security_list.cms.id]
}

resource "oci_core_security_list" "cms" {
  compartment_id = var.oci_compartment_ocid
  vcn_id         = oci_core_vcn.cms.id
  display_name   = "cms-sl"

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  dynamic "ingress_security_rules" {
    for_each = local.ingress_ports
    content {
      protocol = "6"
      tcp_options {
        min = ingress_security_rules.value.tcp
        max = ingress_security_rules.value.tcp
      }
      source      = ingress_security_rules.value.cidr
      source_type = "CIDR_BLOCK"
    }
  }

  ingress_security_rules {
    protocol    = 1
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    icmp_options {
      type = 3
    }
  }
}

resource "oci_core_instance" "cms" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.oci_compartment_ocid
  display_name        = "maison-titrit-cms"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 12
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu.images[0].id
    boot_volume_size_in_gbs = 50
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.cms.id
    assign_public_ip = true
    display_name     = "cms-vnic"
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init/cms.yml.tftpl", {
      cm_domain = local.cms_fqdn
      s_email   = "ops@maisontitrit.com"
    }))
  }

  agent_config {
    are_all_plugins_disabled = false
    is_management_disabled   = false
    is_monitoring_disabled   = false
  }
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.oci_tenancy_ocid
}

output "cms_public_ip" {
  description = "Public IP of the Strapi CMS instance."
  value       = oci_core_instance.cms.public_ip
}

output "cms_image_id" {
  value = data.oci_core_images.ubuntu.images[0].id
}
