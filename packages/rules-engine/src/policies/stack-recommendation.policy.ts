import type { RecommendationContext, RecommendationPolicy, StackRecommendationOutput } from "../core/types";

export const stackRecommendationPolicy: RecommendationPolicy<StackRecommendationOutput> = {
  code: "stack.recommendation.default",
  evaluate(context: RecommendationContext) {
    const vendors = context.vendors.filter((vendor) => vendor.supportsMultiTenant && vendor.msspFriendly);

    if (vendors.length === 0) {
      return [];
    }

    return [
      {
        code: "stack.multi-tenant-preferred",
        score: 85,
        summary: "Prioritize vendors that support multi-tenant MSP/MSSP operations.",
        reasons: [
          "The platform must support multi-tenant operations by default.",
          "Vendor shortlist favors tools that reduce delivery fragmentation."
        ],
        data: {
          recommendations: [
            {
              vendorIds: vendors.slice(0, 3).map((vendor) => vendor.id),
              rationale: [
                "Supports multi-tenant operations",
                "Aligned with MSP/MSSP delivery workflows"
              ],
              confidenceScore: 0.85
            }
          ]
        }
      }
    ];
  }
};
