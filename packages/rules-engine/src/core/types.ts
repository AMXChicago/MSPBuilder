import type { BusinessModel, FounderProfile, PricingModel, ServicePackage, StackRecommendation, Vendor } from "@launch-os/domain";

export interface RecommendationContext {
  founderProfile: FounderProfile;
  businessModel: BusinessModel;
  servicePackages: ServicePackage[];
  pricingModels: PricingModel[];
  vendors: Vendor[];
}

export interface RecommendationResult<TData> {
  code: string;
  score: number;
  summary: string;
  reasons: string[];
  data: TData;
}

export interface RecommendationPolicy<TData> {
  code: string;
  evaluate(context: RecommendationContext): RecommendationResult<TData>[];
}

export interface StackRecommendationOutput {
  recommendations: StackRecommendationSeed[];
}

export interface StackRecommendationSeed {
  vendorIds: string[];
  rationale: string[];
  confidenceScore: number;
}
