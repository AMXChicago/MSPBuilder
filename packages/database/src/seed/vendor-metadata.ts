export interface VendorMetadataSeed {
  name: string;
  category: "psa" | "rmm" | "mdr" | "backup" | "documentation" | "email-security" | "identity";
  msspFriendly: boolean;
  supportsMultiTenant: boolean;
  strengths: string[];
}

export const vendorMetadataSeeds: VendorMetadataSeed[] = [
  {
    name: "HaloPSA",
    category: "psa",
    msspFriendly: true,
    supportsMultiTenant: true,
    strengths: ["PSA workflows", "multi-tenant operations"]
  },
  {
    name: "Huntress",
    category: "mdr",
    msspFriendly: true,
    supportsMultiTenant: true,
    strengths: ["security-led MSP delivery", "SOC-oriented workflows"]
  },
  {
    name: "Microsoft 365",
    category: "identity",
    msspFriendly: true,
    supportsMultiTenant: true,
    strengths: ["identity foundation", "SMB familiarity"]
  }
];
