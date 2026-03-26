import {
  BillingFrequency as PrismaBillingFrequency,
  BudgetPositioning as PrismaBudgetPositioning,
  BusinessType as PrismaBusinessType,
  ComplianceSensitivity as PrismaComplianceSensitivity,
  DeliveryModel as PrismaDeliveryModel,
  FounderMaturity as PrismaFounderMaturity,
  LifecycleStatus as PrismaLifecycleStatus,
  PackageTier as PrismaPackageTier,
  PricingUnit as PrismaPricingUnit,
  PriorityLevel as PrismaPriorityLevel,
  ScenarioStatus as PrismaScenarioStatus,
  SlaTier as PrismaSlaTier,
  SupportHours as PrismaSupportHours,
  VendorCategory as PrismaVendorCategory,
  Prisma,
  type BusinessModel as PrismaBusinessModelRecord,
  type FounderProfile as PrismaFounderProfileRecord,
  type PricingModel as PrismaPricingModelRecord,
  type RecommendationResultRecord as PrismaRecommendationResultRecord,
  type RecommendationScenario as PrismaRecommendationScenarioRecord,
  type ServiceDefinition as PrismaServiceDefinitionRecord,
  type ServicePackage as PrismaServicePackageRecord,
  type ServicePackageItem as PrismaServicePackageItemRecord,
  type Vendor as PrismaVendorRecord
} from "@prisma/client";
import type {
  BillingFrequency,
  BudgetPositioning,
  BusinessModel,
  BusinessType,
  ComplianceSensitivity,
  DeliveryModel,
  FounderMaturity,
  FounderProfile,
  LifecycleStatus,
  PersistedRecommendationResult,
  PricingModel,
  PricingUnit,
  PriorityLevel,
  RecommendationScenario,
  ScenarioStatus,
  ServiceDefinition,
  ServicePackageAggregate,
  ServicePackageItem,
  SlaTier,
  SupportHours,
  Vendor
} from "@launch-os/domain";

const lifecycleStatusMap: Record<LifecycleStatus, PrismaLifecycleStatus> = {
  draft: "DRAFT",
  active: "ACTIVE",
  archived: "ARCHIVED"
};

const businessTypeMap: Record<BusinessType, PrismaBusinessType> = {
  msp: "MSP",
  mssp: "MSSP",
  hybrid: "HYBRID",
  "co-managed": "CO_MANAGED"
};

const deliveryModelMap: Record<DeliveryModel, PrismaDeliveryModel> = {
  remote: "REMOTE",
  onsite: "ONSITE",
  hybrid: "HYBRID"
};

const complianceMap: Record<ComplianceSensitivity, PrismaComplianceSensitivity> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH"
};

const budgetMap: Record<BudgetPositioning, PrismaBudgetPositioning> = {
  budget: "BUDGET",
  standard: "STANDARD",
  premium: "PREMIUM"
};

const founderMaturityMap: Record<FounderMaturity, PrismaFounderMaturity> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED"
};

const packageTierMap: Record<ServicePackageAggregate["marketPosition"], PrismaPackageTier> = {
  good: "GOOD",
  better: "BETTER",
  best: "BEST",
  enterprise: "ENTERPRISE"
};

const slaTierMap: Record<SlaTier, PrismaSlaTier> = {
  "best-effort": "BEST_EFFORT",
  standard: "STANDARD",
  priority: "PRIORITY",
  "24x7": "TWENTY_FOUR_SEVEN"
};

const supportHoursMap: Record<SupportHours, PrismaSupportHours> = {
  "business-hours": "BUSINESS_HOURS",
  "extended-hours": "EXTENDED_HOURS",
  "24x7": "TWENTY_FOUR_SEVEN"
};

const priorityLevelMap: Record<PriorityLevel, PrismaPriorityLevel> = {
  low: "LOW",
  standard: "STANDARD",
  high: "HIGH",
  critical: "CRITICAL"
};

const pricingUnitMap: Record<PricingUnit, PrismaPricingUnit> = {
  user: "USER",
  device: "DEVICE",
  hybrid: "HYBRID"
};

const billingFrequencyMap: Record<BillingFrequency, PrismaBillingFrequency> = {
  monthly: "MONTHLY",
  quarterly: "QUARTERLY",
  annual: "ANNUAL"
};

const scenarioStatusMap: Record<ScenarioStatus, PrismaScenarioStatus> = {
  draft: "DRAFT",
  evaluated: "EVALUATED"
};

const vendorCategoryMap: Record<Vendor["category"], PrismaVendorCategory> = {
  psa: "PSA",
  rmm: "RMM",
  mdr: "MDR",
  backup: "BACKUP",
  documentation: "DOCUMENTATION",
  "email-security": "EMAIL_SECURITY",
  identity: "IDENTITY"
};

export function toPrismaLifecycleStatus(value: LifecycleStatus) {
  return lifecycleStatusMap[value];
}

export function toPrismaBusinessType(value: BusinessType) {
  return businessTypeMap[value];
}

export function toPrismaDeliveryModel(value: DeliveryModel) {
  return deliveryModelMap[value];
}

export function toPrismaComplianceSensitivity(value: ComplianceSensitivity) {
  return complianceMap[value];
}

export function toPrismaBudgetPositioning(value: BudgetPositioning) {
  return budgetMap[value];
}

export function toPrismaFounderMaturity(value: FounderMaturity) {
  return founderMaturityMap[value];
}

export function toPrismaPackageTier(value: ServicePackageAggregate["marketPosition"]) {
  return packageTierMap[value];
}

export function toPrismaSlaTier(value: SlaTier) {
  return slaTierMap[value];
}

export function toPrismaSupportHours(value: SupportHours) {
  return supportHoursMap[value];
}

export function toPrismaPriorityLevel(value: PriorityLevel) {
  return priorityLevelMap[value];
}

export function toPrismaPricingUnit(value: PricingUnit) {
  return pricingUnitMap[value];
}

export function toPrismaBillingFrequency(value: BillingFrequency) {
  return billingFrequencyMap[value];
}

export function toPrismaScenarioStatus(value: ScenarioStatus) {
  return scenarioStatusMap[value];
}

export function toPrismaVendorCategory(value: Vendor["category"]) {
  return vendorCategoryMap[value];
}

export function fromPrismaFounderProfile(record: PrismaFounderProfileRecord): FounderProfile {
  return {
    id: record.id,
    organizationId: record.organizationId,
    userId: record.userId,
    fullName: record.fullName,
    roleTitle: record.roleTitle,
    priorExperienceYears: record.priorExperienceYears,
    targetGeo: record.targetGeo,
    serviceMotion: record.serviceMotion as FounderProfile["serviceMotion"],
    maturityLevel: record.maturityLevel as FounderProfile["maturityLevel"],
    salesConfidence: record.salesConfidence,
    technicalDepth: record.technicalDepth,
    preferredEngagementModel: record.preferredEngagementModel as FounderProfile["preferredEngagementModel"],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaBusinessModel(record: PrismaBusinessModelRecord): BusinessModel {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    businessType: record.businessType === "CO_MANAGED" ? "co-managed" : record.businessType.toLowerCase() as BusinessType,
    targetVerticals: record.targetVerticals,
    targetCompanySizes: record.targetCompanySizes,
    deliveryModel: record.deliveryModel.toLowerCase() as DeliveryModel,
    complianceSensitivity: record.complianceSensitivity.toLowerCase() as ComplianceSensitivity,
    budgetPositioning: record.budgetPositioning.toLowerCase() as BudgetPositioning,
    founderMaturity: record.founderMaturity.toLowerCase() as FounderMaturity,
    revenueStrategy: record.revenueStrategy as BusinessModel["revenueStrategy"],
    targetGrossMarginPercent: Number(record.targetGrossMarginPercent),
    currencyCode: record.currencyCode as BusinessModel["currencyCode"],
    status: record.status.toLowerCase() as LifecycleStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaServiceDefinition(record: PrismaServiceDefinitionRecord): ServiceDefinition {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    category: record.category.toLowerCase() as ServiceDefinition["category"],
    description: record.description,
    baseUnit: record.baseUnit as ServiceDefinition["baseUnit"],
    status: record.status.toLowerCase() as LifecycleStatus,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaServicePackageItem(record: PrismaServicePackageItemRecord): ServicePackageItem {
  return {
    id: record.id,
    organizationId: record.organizationId,
    servicePackageId: record.servicePackageId,
    serviceDefinitionId: record.serviceDefinitionId,
    isRequired: record.isRequired,
    includedQuantity: Number(record.includedQuantity),
    slaTier: record.slaTier === "BEST_EFFORT" ? "best-effort" : record.slaTier === "TWENTY_FOUR_SEVEN" ? "24x7" : record.slaTier.toLowerCase() as SlaTier,
    supportHours: record.supportHours === "BUSINESS_HOURS" ? "business-hours" : record.supportHours === "EXTENDED_HOURS" ? "extended-hours" : "24x7",
    exclusions: record.exclusions,
    priorityLevel: record.priorityLevel.toLowerCase() as PriorityLevel,
    ...(record.notes !== null ? { notes: record.notes } : {}),
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaServicePackage(
  record: PrismaServicePackageRecord & { items: PrismaServicePackageItemRecord[] }
): ServicePackageAggregate {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    marketPosition: record.marketPosition.toLowerCase() as ServicePackageAggregate["marketPosition"],
    description: record.description,
    targetPersona: record.targetPersona,
    includesSecurityBaseline: record.includesSecurityBaseline,
    defaultSlaTier: record.defaultSlaTier === "BEST_EFFORT" ? "best-effort" : record.defaultSlaTier === "TWENTY_FOUR_SEVEN" ? "24x7" : record.defaultSlaTier.toLowerCase() as SlaTier,
    defaultSupportHours: record.defaultSupportHours === "BUSINESS_HOURS" ? "business-hours" : record.defaultSupportHours === "EXTENDED_HOURS" ? "extended-hours" : "24x7",
    defaultExclusions: record.defaultExclusions,
    status: record.status.toLowerCase() as LifecycleStatus,
    items: [...record.items].sort((left, right) => left.sortOrder - right.sortOrder).map(fromPrismaServicePackageItem),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaPricingModel(record: PrismaPricingModelRecord): PricingModel {
  return {
    id: record.id,
    organizationId: record.organizationId,
    servicePackageId: record.servicePackageId,
    pricingUnit: record.pricingUnit.toLowerCase() as PricingUnit,
    currencyCode: record.currencyCode as PricingModel["currencyCode"],
    monthlyBasePrice: Number(record.monthlyBasePrice),
    onboardingFee: Number(record.onboardingFee),
    minimumQuantity: record.minimumQuantity,
    includedQuantity: record.includedQuantity,
    overageUnitPrice: Number(record.overageUnitPrice),
    billingFrequency: record.billingFrequency.toLowerCase() as BillingFrequency,
    contractTermMonths: record.contractTermMonths,
    passthroughCost: Number(record.passthroughCost),
    markupPercentage: Number(record.markupPercentage),
    ...(record.effectiveMarginPercent !== null ? { effectiveMarginPercent: Number(record.effectiveMarginPercent) } : {}),
    targetMarginPercent: Number(record.targetMarginPercent),
    floorMarginPercent: Number(record.floorMarginPercent),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaRecommendationScenario(record: PrismaRecommendationScenarioRecord): RecommendationScenario {
  const founderProfileSnapshot = record.founderProfileSnapshot
    ? record.founderProfileSnapshot as unknown as RecommendationScenario["founderProfileSnapshot"]
    : null;

  return {
    id: record.id,
    organizationId: record.organizationId,
    ...(record.founderProfileId ? { founderProfileId: record.founderProfileId } : {}),
    ...(record.businessModelId ? { businessModelId: record.businessModelId } : {}),
    ...(record.servicePackageId ? { servicePackageId: record.servicePackageId } : {}),
    ...(record.pricingModelId ? { pricingModelId: record.pricingModelId } : {}),
    contextVersion: record.contextVersion,
    rulesVersion: record.rulesVersion,
    status: record.status.toLowerCase() as ScenarioStatus,
    ...(founderProfileSnapshot ? { founderProfileSnapshot } : {}),
    businessModelSnapshot: record.businessModelSnapshot as unknown as RecommendationScenario["businessModelSnapshot"],
    servicePackageSnapshot: record.servicePackageSnapshot as unknown as RecommendationScenario["servicePackageSnapshot"],
    pricingModelSnapshot: record.pricingModelSnapshot as unknown as RecommendationScenario["pricingModelSnapshot"],
    constraintSnapshot: record.constraintSnapshot as unknown as RecommendationScenario["constraintSnapshot"],
    ...(record.vendorSnapshot ? { vendorSnapshot: record.vendorSnapshot as unknown as Record<string, unknown> } : {}),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaPersistedRecommendationResult(record: PrismaRecommendationResultRecord): PersistedRecommendationResult {
  return {
    id: record.id,
    organizationId: record.organizationId,
    scenarioId: record.scenarioId,
    overallScore: Number(record.overallScore),
    readinessLevel: record.readinessLevel as PersistedRecommendationResult["readinessLevel"],
    riskLevel: record.riskLevel as PersistedRecommendationResult["riskLevel"],
    confidenceLevel: record.confidenceLevel as PersistedRecommendationResult["confidenceLevel"],
    confidenceScore: Number(record.confidenceScore),
    summary: record.summary,
    resultSnapshot: record.resultSnapshot as unknown as Record<string, unknown>,
    detailedBreakdown: record.detailedBreakdown as unknown as Record<string, unknown>,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function fromPrismaVendor(record: PrismaVendorRecord): Vendor {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    category: record.category === "EMAIL_SECURITY" ? "email-security" : record.category.toLowerCase() as Vendor["category"],
    ...(record.websiteUrl ? { websiteUrl: record.websiteUrl } : {}),
    msspFriendly: record.msspFriendly,
    supportsMultiTenant: record.supportsMultiTenant,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

export function toPrismaDecimal(value: number | undefined) {
  if (typeof value !== "number") {
    return undefined;
  }

  return new Prisma.Decimal(value);
}
