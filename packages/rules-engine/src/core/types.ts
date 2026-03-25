import type {
  BaselineCategory,
  BusinessModel,
  FounderProfile,
  PricingInput,
  RecommendationFamily,
  ServicePackage,
  ServicePackageItem,
  StackRecommendation,
  Vendor,
  VendorCostProfile
} from "@launch-os/domain";

export interface RecommendationContext {
  organizationId: string;
  founderProfile: FounderProfile | null;
  businessModel: BusinessModel | null;
  servicePackage: ServicePackage | null;
  servicePackageItems: ServicePackageItem[];
  pricingInput: PricingInput | null;
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
}

export interface PackageCompletenessOutput {
  isComplete: boolean;
  missingCapabilities: string[];
}

export interface StackFitOutput {
  suggestedVendorIds: string[];
  fitNotes: string[];
}

export interface SecurityBaselineSelectionOutput {
  suggestedBaselineCodes: string[];
  rationale: string[];
}
