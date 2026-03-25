import type { RecommendationContext, RecommendationPolicy, SecurityBaselineSelectionOutput } from "../core/types";
import { clampConfidence, clampScore, detectVerticals, inferServiceCapabilities, isSecurityLedContext } from "../core/scoring";

export const securityBaselineSelectionPolicy: RecommendationPolicy<SecurityBaselineSelectionOutput> = {
  code: "security.baseline.v1",
  family: "security-baseline",
  evaluate(context: RecommendationContext) {
    const capabilities = inferServiceCapabilities(context.servicePackage.items);
    const verticals = detectVerticals(context.businessModel.targetVerticals);
    const rationale: string[] = [];
    let priorityLevel: "standard" | "high" | "critical" = "standard";

    if (context.businessModel.businessType === "mssp" || context.constraints.complianceSensitivity === "high") {
      priorityLevel = "critical";
      rationale.push("Business posture and compliance sensitivity require a security-first baseline.");
    } else if (isSecurityLedContext(context) || verticals.healthcare || verticals.finance) {
      priorityLevel = "high";
      rationale.push("Vertical and package profile indicate elevated security expectations.");
    } else {
      rationale.push("Baseline selection focuses on practical foundational controls for the current service model.");
    }

    const suggestedBaselineCodes = context.availableBaselines
      .filter((baseline) => {
        if (baseline.category === "identity") return true;
        if (baseline.category === "endpoint") return capabilities.endpoint || capabilities.security || isSecurityLedContext(context);
        if (baseline.category === "backup") return capabilities.backup || context.constraints.complianceSensitivity === "high" || verticals.healthcare || verticals.finance;
        if (baseline.category === "email") return verticals.legal || verticals.healthcare || capabilities.identity;
        if (baseline.category === "network") return context.businessModel.deliveryModel !== "remote";
        return false;
      })
      .map((baseline) => baseline.code);

    if (capabilities.security) {
      rationale.push("Security-oriented package items justify stronger endpoint and identity controls.");
    }

    if (verticals.healthcare || verticals.finance) {
      rationale.push("Target verticals introduce stronger continuity and access-control expectations.");
    }

    const score = clampScore(55 + suggestedBaselineCodes.length * 10 + (priorityLevel === "critical" ? 10 : priorityLevel === "high" ? 5 : 0));

    return [
      {
        code: "security.baseline.primary",
        family: "security-baseline",
        score,
        confidence: clampConfidence(0.63 + suggestedBaselineCodes.length * 0.03),
        summary: `Suggested a ${priorityLevel} priority security baseline based on business posture, compliance sensitivity, and package content.`,
        reasons: rationale,
        data: {
          suggestedBaselineCodes,
          rationale,
          priorityLevel
        }
      }
    ];
  }
};
