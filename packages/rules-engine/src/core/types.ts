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
  data: TData;
}

export interface RecommendationPolicy<TData> {
  code: string;
  family: RecommendationFamily;
  evaluate(context: RecommendationContext): RecommendationResult<TData>[];
}

export interface RecommendationScenarioPreview {
  context: RecommendationContext;
  outputs: RecommendationResult<unknown>[];
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
