import type { PackageCompletenessOutput, RecommendationContext, RecommendationPolicy } from "../core/types";

export const packageCompletenessPolicy: RecommendationPolicy<PackageCompletenessOutput> = {
  code: "package.completeness.stub",
  family: "package-completeness",
  evaluate(context: RecommendationContext) {
    const missingCapabilities: string[] = [];

    if (context.servicePackage.items.length === 0) {
      missingCapabilities.push("package-items");
    }

    if (!context.servicePackage.items.some((item) => item.isRequired)) {
      missingCapabilities.push("required-service");
    }

    return [
      {
        code: "package.completeness.base",
        family: "package-completeness",
        score: missingCapabilities.length === 0 ? 60 : 25,
        summary: "Checks whether a package has enough composition detail for recommendation scoring.",
        reasons: ["Coverage heuristics will be added in a later implementation pass."],
        data: {
          isComplete: missingCapabilities.length === 0,
          missingCapabilities
        }
      }
    ];
  }
};
