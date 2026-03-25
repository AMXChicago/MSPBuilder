import type { PackageCompletenessOutput, RecommendationContext, RecommendationPolicy } from "../core/types";

export const packageCompletenessPolicy: RecommendationPolicy<PackageCompletenessOutput> = {
  code: "package.completeness.stub",
  family: "package-completeness",
  evaluate(context: RecommendationContext) {
    const missingCapabilities: string[] = [];

    if (!context.servicePackage) {
      missingCapabilities.push("servicePackage");
    }

    if (context.servicePackageItems.length === 0) {
      missingCapabilities.push("servicePackageItems");
    }

    return [
      {
        code: "package.completeness.base",
        family: "package-completeness",
        score: missingCapabilities.length === 0 ? 60 : 25,
        summary: "Checks whether a package has enough structure to evaluate readiness.",
        reasons: ["Coverage heuristics will be added in a later implementation pass."],
        data: {
          isComplete: missingCapabilities.length === 0,
          missingCapabilities
        }
      }
    ];
  }
};
