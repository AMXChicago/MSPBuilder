import type { RecommendationContext, RecommendationPolicy, StackFitOutput } from "../core/types";

export const stackFitScoringPolicy: RecommendationPolicy<StackFitOutput> = {
  code: "stack.fit.stub",
  family: "stack-fit",
  evaluate(context: RecommendationContext) {
    const suggestedVendorIds = context.vendors.slice(0, 3).map((vendor) => vendor.id);

    return [
      {
        code: "stack.fit.base",
        family: "stack-fit",
        score: suggestedVendorIds.length > 0 ? 50 : 10,
        summary: "Produces an initial vendor shortlist structure for future fit scoring.",
        reasons: ["Fit scoring is not implemented yet; this only wires the evaluation path."],
        data: {
          suggestedVendorIds,
          fitNotes: ["Vendor scoring rules will consider business type, compliance, and package mix."]
        }
      }
    ];
  }
};
