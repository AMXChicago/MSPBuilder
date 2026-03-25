import type {
  BaselineCategory,
  RecommendationConstraintSnapshot,
  BusinessModelSnapshot,
  FounderProfileSnapshot,
  PricingModelSnapshot,
  RecommendationFamily,
  ServicePackageSnapshot,
  Vendor,
  VendorCostProfile
} from "@launch-os/domain";

export interface RecommendationContext {
  scenarioId?: string;
  contextVersion: string;
  rulesVersion: string;
  founderProfile?: FounderProfileSnapshot;
  businessModel: BusinessModelSnapshot;
  servicePackage: ServicePackageSnapshot;
  pricingModel: PricingModelSnapshot;
  constraints: RecommendationConstraintSnapshot;
  vendors: Vendor[];
  vendorCostProfiles: VendorCostProfile[];
  availableBaselines: SecurityBaselineOption[];
  generatedAt: string;
}

export interface SecurityBaselineOption {
  category: BaselineCategory;
  code: string;
  label: string;
}

export interface RecommendationResult<TData> {
  code: string;
  family: RecommendationFamily;
  score: number;
  confidence: number;
  summary: string;
  reasons: string[];
  contributingFactors: string[];
  positiveSignals: string[];
  negativeSignals: string[];
  data: TData;
}

export interface RecommendationPolicy<TData> {
  code: string;
  family: RecommendationFamily;
  evaluate(context: RecommendationContext): RecommendationResult<TData>[];
}

export type ReadinessLevel = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type ConfidenceLevel = "low" | "medium" | "high";

export interface RecommendationWeights {
  pricingReadiness: number;
  packageCompleteness: number;
  stackFit: number;
  securityBaseline: number;
}

export interface RecommendationAggregateExplainability {
  summary: string;
  reasons: string[];
  contributingFactors: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

export interface PricingReadinessOutput {
  isReady: boolean;
  missingFields: string[];
  riskFlags: string[];
  improvementNotes: string[];
  effectiveMarginPercent: number | null;
}

export interface PackageCompletenessOutput {
  isComplete: boolean;
  missingCapabilities: string[];
  packageRisks: string[];
  packageNotes: string[];
}

export interface VendorScoreBreakdown {
  vendorId: string;
  vendorName: string;
  totalScore: number;
  categoryFit: number;
  msspFriendliness: number;
  multiTenantSupport: number;
  complianceFit: number;
  packageAlignment: number;
  budgetAlignment: number;
  reasons: string[];
}

export interface StackFitOutput {
  suggestedVendorIds: string[];
  fitNotes: string[];
  scoreBreakdown: VendorScoreBreakdown[];
}

export interface SecurityBaselineSelectionOutput {
  suggestedBaselineCodes: string[];
  rationale: string[];
  priorityLevel: "standard" | "high" | "critical";
}

export interface UnifiedRecommendationResult {
  overallScore: number;
  readinessLevel: ReadinessLevel;
  riskLevel: RiskLevel;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  weights: RecommendationWeights;
  pricingReadiness: RecommendationResult<PricingReadinessOutput>;
  packageCompleteness: RecommendationResult<PackageCompletenessOutput>;
  stackFitSummary: RecommendationResult<StackFitOutput>;
  securityBaselineSummary: RecommendationResult<SecurityBaselineSelectionOutput>;
  explainability: RecommendationAggregateExplainability;
}

export interface RecommendationPreviewResponse {
  context: RecommendationContext;
  result: UnifiedRecommendationResult;
  detailedBreakdown: {
    pricingReadiness: RecommendationResult<PricingReadinessOutput>;
    packageCompleteness: RecommendationResult<PackageCompletenessOutput>;
    stackFit: RecommendationResult<StackFitOutput>;
    securityBaseline: RecommendationResult<SecurityBaselineSelectionOutput>;
  };
}

export interface RecommendationScenarioPreview {
  context: RecommendationContext;
  outputs: RecommendationResult<unknown>[];
}
