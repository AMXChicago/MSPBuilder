import type { PricingReadinessOutput, RecommendationContext, RecommendationPolicy } from "../core/types";

export const pricingReadinessPolicy: RecommendationPolicy<PricingReadinessOutput> = {
  code: "pricing.readiness.stub",
  family: "pricing-readiness",
  evaluate(context: RecommendationContext) {
    const missingFields: string[] = [];

    if (context.pricingModel.minimumQuantity <= 0) {
      missingFields.push("minimumQuantity");
    }

    if (context.pricingModel.markupPercentage < 0) {
      missingFields.push("markupPercentage");
    }

    if (context.pricingModel.passthroughCost < 0) {
      missingFields.push("passthroughCost");
    }

    return [
      {
        code: "pricing.readiness.base",
        family: "pricing-readiness",
        score: missingFields.length === 0 ? 55 : 20,
        summary: "Checks whether enough pricing detail exists for MSP margin evaluation.",
        reasons: ["Effective margin scoring will be added in a later implementation pass."],
        data: {
          isReady: missingFields.length === 0,
          missingFields
        }
      }
    ];
  }
};
