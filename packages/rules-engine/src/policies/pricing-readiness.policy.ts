import type { PricingReadinessOutput, RecommendationContext, RecommendationPolicy } from "../core/types";

export const pricingReadinessPolicy: RecommendationPolicy<PricingReadinessOutput> = {
  code: "pricing.readiness.stub",
  family: "pricing-readiness",
  evaluate(context: RecommendationContext) {
    const missingFields: string[] = [];

    if (!context.pricingInput) {
      missingFields.push("pricingInput");
    }

    if (!context.businessModel) {
      missingFields.push("businessModel");
    }

    return [
      {
        code: "pricing.readiness.base",
        family: "pricing-readiness",
        score: missingFields.length === 0 ? 55 : 20,
        summary: "Checks whether enough pricing inputs exist to run full pricing guardrails.",
        reasons: ["Scoring logic is intentionally stubbed for now."],
        data: {
          isReady: missingFields.length === 0,
          missingFields
        }
      }
    ];
  }
};
