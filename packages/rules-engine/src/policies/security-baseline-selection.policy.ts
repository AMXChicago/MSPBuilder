import type { RecommendationContext, RecommendationPolicy, SecurityBaselineSelectionOutput } from "../core/types";

export const securityBaselineSelectionPolicy: RecommendationPolicy<SecurityBaselineSelectionOutput> = {
  code: "security.baseline.stub",
  family: "security-baseline",
  evaluate(context: RecommendationContext) {
    const suggestedBaselineCodes = context.availableBaselines.slice(0, 3).map((baseline) => baseline.code);

    return [
      {
        code: "security.baseline.base",
        family: "security-baseline",
        score: suggestedBaselineCodes.length > 0 ? 58 : 15,
        summary: "Produces a baseline selection shell tied to recommendation context.",
        reasons: ["Selection rules will later consider compliance sensitivity and business type."],
        data: {
          suggestedBaselineCodes,
          rationale: ["Current implementation exposes structure only, not final baseline logic."]
        }
      }
    ];
  }
};
