import type { AuditedEntity, ConfidenceLevel, ReadinessLevel, RiskLevel, TenantScoped } from "../common/types";

export interface PersistedRecommendationResult extends AuditedEntity, TenantScoped {
  scenarioId: string;
  overallScore: number;
  readinessLevel: ReadinessLevel;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  summary: string;
  resultSnapshot: Record<string, unknown>;
  detailedBreakdown: Record<string, unknown>;
}
