import type { RecommendationContext } from "./types";
import type { BusinessType, DeliveryModel, FounderMaturity, PricingUnit, ServicePackageItemSnapshot, Vendor } from "@launch-os/domain";

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
    government: values.some((value) => value.includes("government") || value.includes("public")),
    manufacturing: values.some((value) => value.includes("manufactur") || value.includes("industrial")),
    professionalServices: values.some((value) => value.includes("professional") || value.includes("consult"))
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
    network: labels.some((value) => value.includes("network") || value.includes("firewall")),
    documentation: labels.some((value) => value.includes("document") || value.includes("runbook") || value.includes("sop"))
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
  preferredDeliveryModels: DeliveryModel[];
  preferredPricingUnits: PricingUnit[];
  founderMaturityFit: FounderMaturity[];
  verticalStrengths: string[];
  strengths: string[];
  tradeoffs: string[];
}

const vendorProfilesByName: Record<string, VendorScoringProfile> = {
  halopsa: {
    complianceStrength: "strong",
    budgetFit: "standard",
    packageKeywords: ["help", "support", "dispatch", "co-managed", "ticket", "onsite"],
    preferredBusinessTypes: ["msp", "hybrid", "co-managed"],
    preferredDeliveryModels: ["remote", "onsite", "hybrid"],
    preferredPricingUnits: ["user", "hybrid"],
    founderMaturityFit: ["intermediate", "advanced"],
    verticalStrengths: ["general", "manufacturing", "professional-services"],
    strengths: ["PSA workflow maturity", "service desk operations", "co-managed collaboration"],
    tradeoffs: ["May feel operationally heavy for a solo founder", "Premium workflow depth requires process discipline"]
  },
  huntress: {
    complianceStrength: "advanced",
    budgetFit: "premium",
    packageKeywords: ["security", "edr", "mdr", "endpoint", "soc", "threat"],
    preferredBusinessTypes: ["mssp", "hybrid"],
    preferredDeliveryModels: ["remote", "hybrid"],
    preferredPricingUnits: ["device", "hybrid"],
    founderMaturityFit: ["beginner", "intermediate", "advanced"],
    verticalStrengths: ["healthcare", "finance", "legal"],
    strengths: ["MDR-led service delivery", "security-first launch posture", "compliance-sensitive environments"],
    tradeoffs: ["Premium security tooling can pressure budget offers", "Needs a clear security story in the package to justify pricing"]
  },
  "microsoft 365": {
    complianceStrength: "strong",
    budgetFit: "budget",
    packageKeywords: ["identity", "email", "m365", "cloud", "entra", "productivity"],
    preferredBusinessTypes: ["msp", "mssp", "hybrid", "co-managed"],
    preferredDeliveryModels: ["remote", "hybrid"],
    preferredPricingUnits: ["user", "hybrid"],
    founderMaturityFit: ["beginner", "intermediate", "advanced"],
    verticalStrengths: ["general", "healthcare", "professional-services", "legal"],
    strengths: ["identity and email baseline", "broad SMB familiarity", "good launch-stage leverage"],
    tradeoffs: ["Needs complementary tooling for MDR-depth use cases", "Can be over-relied on as a full stack by new founders"]
  },
  syncro: {
    complianceStrength: "baseline",
    budgetFit: "budget",
    packageKeywords: ["help", "rmm", "support", "budget"],
    preferredBusinessTypes: ["msp", "hybrid"],
    preferredDeliveryModels: ["remote", "hybrid"],
    preferredPricingUnits: ["user", "device"],
    founderMaturityFit: ["beginner", "intermediate"],
    verticalStrengths: ["general"],
    strengths: ["budget-conscious MSP launch", "simpler operational footprint"],
    tradeoffs: ["Less ideal for high-compliance or premium MSSP positioning", "May need augmentation as service maturity grows"]
  }
};

export function getVendorScoringProfile(vendor: Vendor): VendorScoringProfile {
  return vendorProfilesByName[normalizeText(vendor.name)] ?? {
    complianceStrength: "baseline",
    budgetFit: "standard",
    packageKeywords: [],
    preferredBusinessTypes: ["msp", "mssp", "hybrid", "co-managed"],
    preferredDeliveryModels: ["remote", "onsite", "hybrid"],
    preferredPricingUnits: ["user", "device", "hybrid"],
    founderMaturityFit: ["beginner", "intermediate", "advanced"],
    verticalStrengths: ["general"],
    strengths: ["General-purpose vendor fit"],
    tradeoffs: ["Limited structured fit metadata is available for this vendor"]
  };
}

export function isSecurityLedContext(context: RecommendationContext) {
  const capabilities = inferServiceCapabilities(context.servicePackage.items);
  return context.businessModel.businessType === "mssp" || capabilities.security;
}

export function hasDangerousExclusion(items: ServicePackageItemSnapshot[], keyword: string) {
  return items.some((item) => item.exclusions.some((exclusion) => normalizeText(exclusion).includes(keyword)));
}

export function inferPricingPosture(context: RecommendationContext) {
  const effectiveMarginPercent = calculateEffectiveMarginPercent(context) ?? 0;
  const premiumBudget = context.businessModel.budgetPositioning === "premium";
  const budgetOffer = context.businessModel.budgetPositioning === "budget";
  return {
    effectiveMarginPercent,
    isAggressiveLowMargin: effectiveMarginPercent > 0 && effectiveMarginPercent < Math.max(35, context.pricingModel.floorMarginPercent),
    supportsPremiumPositioning: premiumBudget && effectiveMarginPercent >= context.pricingModel.targetMarginPercent,
    isBudgetSensitive: budgetOffer || context.pricingModel.monthlyBasePrice < 100,
    pricingUnit: context.pricingModel.pricingUnit
  };
}
