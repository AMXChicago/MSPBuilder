import type { RecommendationContext, RecommendationPolicy, StackFitOutput } from "../core/types";

export const stackFitScoringPolicy: RecommendationPolicy<StackFitOutput> = {
  code: "stack.fit.stub",
  family: "stack-fit",
  evaluate(context: RecommendationContext) {
    const suggestedVendorIds = context.vendors
      .filter((vendor) => vendor.supportsMultiTenant)
      .slice(0, 3)
      .map((vendor) => vendor.id);

    return [
      {
        code: "stack.fit.base",
        family: "stack-fit",
        score: suggestedVendorIds.length > 0 ? 50 : 10,
        summary: "Produces a stack-fit shell from business, package, pricing, and constraint snapshots.",
        reasons: ["Vendor fit scoring will later weight posture, compliance, and package composition."],
        data: {
          suggestedVendorIds,
          fitNotes: ["The policy now depends on recommendation snapshots rather than UI-oriented input shapes."]
        }
      }
    ];
  }
};
