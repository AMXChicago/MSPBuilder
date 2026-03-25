import type { AuditedEntity, RecommendationFamily, ScenarioStatus, TenantScoped } from "../common/types";

export interface RecommendationScenario extends AuditedEntity, TenantScoped {
  founderProfileId?: string;
  businessModelId?: string;
  servicePackageId?: string;
  pricingInputId?: string;
  scenarioVersion: string;
  status: ScenarioStatus;
  inputSnapshot: RecommendationScenarioInputSnapshot;
}

export interface RecommendationScenarioInputSnapshot {
  founderProfileId?: string;
  businessModelId?: string;
  servicePackageId?: string;
  pricingInputId?: string;
  founderProfile?: Record<string, unknown>;
  businessModel?: Record<string, unknown>;
  servicePackage?: Record<string, unknown>;
  pricingInput?: Record<string, unknown>;
}

export interface RecommendationOutputLink extends AuditedEntity, TenantScoped {
  scenarioId: string;
  recommendationFamily: RecommendationFamily;
  outputId: string;
}
