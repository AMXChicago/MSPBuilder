import type {
  AuditedEntity,
  BudgetPositioning,
  ComplianceSensitivity,
  DeliveryModel,
  FounderMaturity,
  RecommendationFamily,
  ScenarioStatus,
  TenantScoped
} from "../common/types";
import type { FounderProfile } from "../founder-profile/types";
import type { BusinessModel } from "../business-model/types";
import type { PricingModel } from "../pricing/types";
import type { ServicePackage, ServicePackageItem } from "../service-catalog/types";

export interface FounderProfileSnapshot extends Pick<FounderProfile, "fullName" | "roleTitle" | "priorExperienceYears" | "targetGeo" | "serviceMotion" | "maturityLevel" | "salesConfidence" | "technicalDepth" | "preferredEngagementModel"> {}

export interface BusinessModelSnapshot extends Pick<BusinessModel, "name" | "businessType" | "targetVerticals" | "targetCompanySizes" | "deliveryModel" | "complianceSensitivity" | "budgetPositioning" | "founderMaturity" | "revenueStrategy" | "targetGrossMarginPercent" | "currencyCode"> {}

export interface ServicePackageItemSnapshot extends Pick<ServicePackageItem, "serviceDefinitionId" | "isRequired" | "includedQuantity" | "slaTier" | "supportHours" | "exclusions" | "priorityLevel" | "notes" | "sortOrder"> {}

export interface ServicePackageSnapshot extends Pick<ServicePackage, "name" | "marketPosition" | "description" | "targetPersona" | "includesSecurityBaseline" | "defaultSlaTier" | "defaultSupportHours" | "defaultExclusions"> {
  items: ServicePackageItemSnapshot[];
}

export interface PricingModelSnapshot extends Pick<PricingModel, "pricingUnit" | "monthlyBasePrice" | "onboardingFee" | "minimumQuantity" | "includedQuantity" | "overageUnitPrice" | "billingFrequency" | "contractTermMonths" | "passthroughCost" | "markupPercentage" | "effectiveMarginPercent" | "targetMarginPercent" | "floorMarginPercent" | "currencyCode"> {}

export interface RecommendationConstraintSnapshot {
  budgetPositioning: BudgetPositioning;
  founderMaturity: FounderMaturity;
  complianceSensitivity: ComplianceSensitivity;
  deliveryModel: DeliveryModel;
  maxMonthlyBudget?: number;
}

export interface RecommendationScenario extends AuditedEntity, TenantScoped {
  founderProfileId?: string;
  businessModelId?: string;
  servicePackageId?: string;
  pricingModelId?: string;
  contextVersion: string;
  rulesVersion: string;
  status: ScenarioStatus;
  founderProfileSnapshot?: FounderProfileSnapshot;
  businessModelSnapshot: BusinessModelSnapshot;
  servicePackageSnapshot: ServicePackageSnapshot;
  pricingModelSnapshot: PricingModelSnapshot;
  constraintSnapshot: RecommendationConstraintSnapshot;
  vendorSnapshot?: Record<string, unknown>;
}

export interface RecommendationOutputLink extends AuditedEntity, TenantScoped {
  scenarioId: string;
  recommendationFamily: RecommendationFamily;
  outputId: string;
}

export interface LegacyRecommendationScenarioInputSnapshot {
  founderProfileId?: string;
  businessModelId?: string;
  servicePackageId?: string;
  pricingInputId?: string;
  founderProfile?: Record<string, unknown>;
  businessModel?: Record<string, unknown>;
  servicePackage?: Record<string, unknown>;
  pricingInput?: Record<string, unknown>;
}
