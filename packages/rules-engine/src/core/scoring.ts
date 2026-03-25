import type { RecommendationContext } from "./types";
import type { BusinessType, ServicePackageItemSnapshot, Vendor } from "@launch-os/domain";

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function clampConfidence(value: number) {
  return Math.max(0.1, Math.min(0.95, Number(value.toFixed(2))));
}

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function detectVerticals(targetVerticals: string[]) {
  const values = targetVerticals.map(normalizeText);
  return {
    healthcare: values.some((value) => value.includes("health")),
    finance: values.some((value) => value.includes("finance") || value.includes("bank")),
    legal: values.some((value) => value.includes("legal")),
    government: values.some((value) => value.includes("government") || value.includes("public"))
  };
}

export function inferServiceCapabilities(items: ServicePackageItemSnapshot[]) {
  const labels = items.map((item) => normalizeText(item.serviceDefinitionId));
  return {
    helpdesk: labels.some((value) => value.includes("help") || value.includes("support")),
    endpoint: labels.some((value) => value.includes("endpoint") || value.includes("device") || value.includes("edr")),
    security: labels.some((value) => value.includes("edr") || value.includes("mdr") || value.includes("security") || value.includes("soc")),
    backup: labels.some((value) => value.includes("backup") || value.includes("continuity") || value.includes("restore")),
    identity: labels.some((value) => value.includes("identity") || value.includes("m365") || value.includes("entra") || value.includes("email")),
    network: labels.some((value) => value.includes("network") || value.includes("firewall"))
  };
}

export function calculateEffectiveMarginPercent(context: RecommendationContext) {
  if (typeof context.pricingModel.effectiveMarginPercent === "number") {
    return context.pricingModel.effectiveMarginPercent;
  }

  const revenue = context.pricingModel.monthlyBasePrice;
  const passthrough = context.pricingModel.passthroughCost;

  if (revenue <= 0) {
    return null;
  }

  return Number((((revenue - passthrough) / revenue) * 100).toFixed(2));
}

export interface VendorScoringProfile {
  complianceStrength: "baseline" | "strong" | "advanced";
  budgetFit: "budget" | "standard" | "premium";
  packageKeywords: string[];
  preferredBusinessTypes: BusinessType[];
}

const vendorProfilesByName: Record<string, VendorScoringProfile> = {
  halopsa: {
    complianceStrength: "strong",
    budgetFit: "standard",
    packageKeywords: ["help", "support", "onsite", "co-managed"],
    preferredBusinessTypes: ["msp", "hybrid", "co-managed"]
  },
  huntress: {
    complianceStrength: "advanced",
    budgetFit: "premium",
    packageKeywords: ["security", "edr", "endpoint", "soc"],
    preferredBusinessTypes: ["mssp", "hybrid"]
  },
  "microsoft 365": {
    complianceStrength: "strong",
    budgetFit: "budget",
    packageKeywords: ["identity", "email", "m365", "cloud"],
    preferredBusinessTypes: ["msp", "mssp", "hybrid", "co-managed"]
  }
};

export function getVendorScoringProfile(vendor: Vendor): VendorScoringProfile {
  return vendorProfilesByName[normalizeText(vendor.name)] ?? {
    complianceStrength: "baseline",
    budgetFit: "standard",
    packageKeywords: [],
    preferredBusinessTypes: ["msp", "mssp", "hybrid", "co-managed"]
  };
}

export function isSecurityLedContext(context: RecommendationContext) {
  const capabilities = inferServiceCapabilities(context.servicePackage.items);
  return context.businessModel.businessType === "mssp" || capabilities.security;
}

export function hasDangerousExclusion(items: ServicePackageItemSnapshot[], keyword: string) {
  return items.some((item) => item.exclusions.some((exclusion) => normalizeText(exclusion).includes(keyword)));
}
