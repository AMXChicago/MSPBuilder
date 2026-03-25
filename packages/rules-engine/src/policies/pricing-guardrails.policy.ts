import type { RecommendationContext, RecommendationPolicy } from "../core/types";

interface PricingGuardrailOutput {
  packageId: string;
  floorMarginPercent: number;
  targetMarginPercent: number;
}

export const pricingGuardrailsPolicy: RecommendationPolicy<PricingGuardrailOutput> = {
  code: "pricing.guardrails.default",
  evaluate(context: RecommendationContext) {
    return context.pricingModels.map((pricingModel) => ({
      code: `pricing.guardrails.${pricingModel.servicePackageId}`,
      score: 80,
      summary: "Maintain a healthy margin floor before publishing package pricing.",
      reasons: [
        `Target margin set at ${pricingModel.targetMarginPercent}%`,
        `Floor margin set at ${pricingModel.floorMarginPercent}%`
      ],
      data: {
        packageId: pricingModel.servicePackageId,
        floorMarginPercent: pricingModel.floorMarginPercent,
        targetMarginPercent: pricingModel.targetMarginPercent
      }
    }));
  }
};
