import type {
  ConfidenceLevel,
  PackageCompletenessOutput,
  PricingReadinessOutput,
  RecommendationContext,
  RecommendationPreviewResponse,
  RecommendationResult,
  RecommendationWeights,
  RiskLevel,
  SecurityBaselineSelectionOutput,
  StackFitOutput,
  UnifiedRecommendationResult,
  ReadinessLevel,
  ExplanationItem
} from "./types";
import { clampConfidence, clampScore } from "./scoring";
import { recommendationRegistry } from "../registry/default-registry";

export const defaultRecommendationWeights: RecommendationWeights = {
  pricingReadiness: 0.3,
  packageCompleteness: 0.25,
  stackFit: 0.3,
  securityBaseline: 0.15
};

function resolveReadinessLevel(score: number): ReadinessLevel {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function resolveRiskLevel(negativeSignals: number, pricing: RecommendationResult<PricingReadinessOutput>, packageResult: RecommendationResult<PackageCompletenessOutput>): RiskLevel {
  if (!pricing.data.isReady || !packageResult.data.isComplete || negativeSignals >= 6) {
    return "high";
  }
  if (negativeSignals >= 3) {
    return "medium";
  }
  return "low";
}

function resolveConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 0.72) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}

function uniqueExplanationItems(items: ExplanationItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.category}|${item.impact}|${item.message}|${item.recommendedAction ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildMissingInformation(context: RecommendationContext, detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"]) {
  const missingSections: string[] = [];
  const warnings: string[] = [];

  if (!context.founderProfile) {
    missingSections.push("founder-profile");
    warnings.push("Founder profile is missing, so recommendations may not reflect operator readiness accurately.");
  }

  if (context.businessModel.targetVerticals.length === 0) {
    missingSections.push("target-verticals");
    warnings.push("Target verticals are missing, which weakens stack and security fit guidance.");
  }

  if (context.servicePackage.items.length === 0) {
    missingSections.push("service-package-items");
    warnings.push("No services are included in the package, so package and stack recommendations are incomplete.");
  }

  if (detailedBreakdown.pricingReadiness.data.missingFields.length > 0) {
    missingSections.push("pricing-fields");
    warnings.push(`Pricing is incomplete: ${detailedBreakdown.pricingReadiness.data.missingFields.join(", ")}.`);
  }

  if (!context.pricingModel.contractTermMonths || !context.pricingModel.billingFrequency) {
    missingSections.push("pricing-term-structure");
  }

  if (detailedBreakdown.packageCompleteness.data.missingCapabilities.length > 0) {
    warnings.push(`Package capability gaps detected: ${detailedBreakdown.packageCompleteness.data.missingCapabilities.join(", ")}.`);
  }

  if (detailedBreakdown.stackFit.data.coverageGaps.length > 0) {
    warnings.push(...detailedBreakdown.stackFit.data.coverageGaps);
  }

  return {
    missingSections: unique(missingSections),
    warnings: unique(warnings),
    hasBlockingGaps: missingSections.length > 0 || !detailedBreakdown.pricingReadiness.data.isReady || !detailedBreakdown.packageCompleteness.data.isComplete
  };
}

function buildTopActionItems(detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"]) {
  return unique([
    ...detailedBreakdown.pricingReadiness.data.missingFields.map((field) => `Complete pricing field: ${field}`),
    ...detailedBreakdown.pricingReadiness.data.improvementNotes,
    ...detailedBreakdown.packageCompleteness.data.missingCapabilities.map((capability) => `Add or clarify package capability: ${capability}`),
    ...detailedBreakdown.packageCompleteness.data.packageRisks,
    ...detailedBreakdown.stackFit.data.coverageGaps,
    ...detailedBreakdown.stackFit.data.topChoices.flatMap((choice) => choice.tradeoffs.slice(0, 1).map((tradeoff) => `Evaluate stack tradeoff: ${tradeoff}`)),
    ...detailedBreakdown.securityBaseline.data.rationale
  ]).slice(0, 8);
}

function buildRecommendedNextSteps(result: { readinessLevel: ReadinessLevel; riskLevel: RiskLevel; confidenceLevel: ConfidenceLevel; missingInformation: { hasBlockingGaps: boolean } }, detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"]) {
  const steps: string[] = [];

  if (result.missingInformation.hasBlockingGaps) {
    steps.push("Complete missing workflow inputs before treating this recommendation as launch-ready.");
  }

  if (result.riskLevel === "high") {
    steps.push("Resolve the highest-risk package and pricing gaps before validating the offer internally.");
  }

  if (detailedBreakdown.stackFit.data.topChoices.length > 0) {
    steps.push(`Review ${detailedBreakdown.stackFit.data.topChoices[0].vendorName} as the lead stack choice and confirm cost assumptions.`);
  }

  if (result.readinessLevel === "medium" || result.readinessLevel === "low") {
    steps.push("Iterate on package scope and pricing assumptions, then rebuild the recommendation preview.");
  }

  if (result.confidenceLevel !== "high") {
    steps.push("Add more complete business and package detail to improve recommendation confidence.");
  }

  if (steps.length === 0) {
    steps.push("Review the recommended stack and security baseline, then move into operator validation and scenario comparison.");
  }

  return unique(steps).slice(0, 5);
}

function buildLaunchBlockers(missingInformation: UnifiedRecommendationResult["missingInformation"], detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"]) {
  return unique([
    ...missingInformation.missingSections.map((section) => `Missing section: ${section}`),
    ...detailedBreakdown.pricingReadiness.data.riskFlags,
    ...detailedBreakdown.packageCompleteness.data.missingCapabilities.map((capability) => `Missing capability: ${capability}`),
    ...detailedBreakdown.packageCompleteness.data.packageRisks,
    ...detailedBreakdown.stackFit.data.coverageGaps
  ]).slice(0, 6);
}

function buildLaunchAccelerators(detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"]) {
  return unique([
    ...detailedBreakdown.pricingReadiness.positiveSignals,
    ...detailedBreakdown.packageCompleteness.positiveSignals,
    ...detailedBreakdown.stackFit.data.topChoices.slice(0, 2).map((choice) => `${choice.vendorName} is a strong stack candidate for the current offer.`),
    ...detailedBreakdown.securityBaseline.positiveSignals
  ]).slice(0, 6);
}

export function aggregateRecommendation(
  context: RecommendationContext,
  detailedBreakdown: RecommendationPreviewResponse["detailedBreakdown"],
  weights: RecommendationWeights = defaultRecommendationWeights
): UnifiedRecommendationResult {
  const weightedScore = clampScore(
    detailedBreakdown.pricingReadiness.score * weights.pricingReadiness +
      detailedBreakdown.packageCompleteness.score * weights.packageCompleteness +
      detailedBreakdown.stackFit.score * weights.stackFit +
      detailedBreakdown.securityBaseline.score * weights.securityBaseline
  );

  const positiveSignals = unique([
    ...detailedBreakdown.pricingReadiness.positiveSignals,
    ...detailedBreakdown.packageCompleteness.positiveSignals,
    ...detailedBreakdown.stackFit.positiveSignals,
    ...detailedBreakdown.securityBaseline.positiveSignals
  ]);

  const negativeSignals = unique([
    ...detailedBreakdown.pricingReadiness.negativeSignals,
    ...detailedBreakdown.packageCompleteness.negativeSignals,
    ...detailedBreakdown.stackFit.negativeSignals,
    ...detailedBreakdown.securityBaseline.negativeSignals
  ]);

  const contributingFactors = unique([
    ...detailedBreakdown.pricingReadiness.contributingFactors,
    ...detailedBreakdown.packageCompleteness.contributingFactors,
    ...detailedBreakdown.stackFit.contributingFactors,
    ...detailedBreakdown.securityBaseline.contributingFactors
  ]);

  const reasons = unique([
    ...detailedBreakdown.pricingReadiness.reasons,
    ...detailedBreakdown.packageCompleteness.reasons,
    ...detailedBreakdown.stackFit.reasons,
    ...detailedBreakdown.securityBaseline.reasons
  ]).slice(0, 10);

  const explanationItems = uniqueExplanationItems([
    ...detailedBreakdown.pricingReadiness.explanationItems,
    ...detailedBreakdown.packageCompleteness.explanationItems,
    ...detailedBreakdown.stackFit.explanationItems,
    ...detailedBreakdown.securityBaseline.explanationItems
  ]);

  const missingInformation = buildMissingInformation(context, detailedBreakdown);

  const confidenceScore = clampConfidence(
    (detailedBreakdown.pricingReadiness.confidence +
      detailedBreakdown.packageCompleteness.confidence +
      detailedBreakdown.stackFit.confidence +
      detailedBreakdown.securityBaseline.confidence) /
      4 -
      negativeSignals.length * 0.02 +
      positiveSignals.length * 0.01 -
      missingInformation.missingSections.length * 0.08
  );

  const readinessLevel = missingInformation.hasBlockingGaps ? "low" : resolveReadinessLevel(weightedScore);
  const riskLevel = resolveRiskLevel(negativeSignals.length + missingInformation.warnings.length, detailedBreakdown.pricingReadiness, detailedBreakdown.packageCompleteness);
  const confidenceLevel = resolveConfidenceLevel(confidenceScore);

  const summary =
    missingInformation.hasBlockingGaps
      ? "Recommendation preview is incomplete because required workflow inputs or package and pricing details are still missing."
      : readinessLevel === "high"
        ? riskLevel === "low"
          ? "Strong MSP/MSSP foundation with coherent pricing, package design, and recommendation fit."
          : "Strong core foundation with some operational or commercial risks to resolve."
        : readinessLevel === "medium"
          ? "Promising MSP/MSSP design with meaningful gaps that should be addressed before launch."
          : "Early-stage recommendation profile with significant gaps in pricing, package design, or baseline readiness.";

  const baseResult: UnifiedRecommendationResult = {
    overallScore: missingInformation.hasBlockingGaps ? Math.min(weightedScore, 49) : weightedScore,
    readinessLevel,
    riskLevel,
    confidenceLevel,
    confidenceScore,
    weights,
    pricingReadiness: detailedBreakdown.pricingReadiness,
    packageCompleteness: detailedBreakdown.packageCompleteness,
    stackFitSummary: detailedBreakdown.stackFit,
    securityBaselineSummary: detailedBreakdown.securityBaseline,
    explainability: {
      summary,
      reasons,
      contributingFactors,
      positiveSignals,
      negativeSignals,
      items: explanationItems
    },
    missingInformation,
    launchSummary: "",
    launchBlockers: [],
    launchAccelerators: [],
    topActionItems: buildTopActionItems(detailedBreakdown),
    recommendedNextSteps: [],
    nextThreeActions: []
  };

  baseResult.recommendedNextSteps = buildRecommendedNextSteps(baseResult, detailedBreakdown);
  baseResult.nextThreeActions = baseResult.recommendedNextSteps.slice(0, 3);
  baseResult.launchBlockers = buildLaunchBlockers(baseResult.missingInformation, detailedBreakdown);
  baseResult.launchAccelerators = buildLaunchAccelerators(detailedBreakdown);
  baseResult.launchSummary = baseResult.launchBlockers.length > 0
    ? `Launch readiness is constrained by ${baseResult.launchBlockers.length} blocker(s) that should be resolved before customer-facing rollout.`
    : `Launch readiness is supported by a coherent offer design, stack shortlist, and baseline posture with ${baseResult.launchAccelerators.length} notable accelerator(s).`;

  baseResult.explainability.items = uniqueExplanationItems([
    ...baseResult.explainability.items,
    ...baseResult.launchBlockers.map((item) => ({
      category: "launch",
      impact: "negative" as const,
      message: item,
      recommendedAction: "Resolve this blocker before launch or clearly reduce the promise of the offer."
    })),
    ...baseResult.launchAccelerators.map((item) => ({
      category: "launch",
      impact: "positive" as const,
      message: item,
      recommendedAction: "Use this strength in operator review, packaging, and go-to-market positioning."
    }))
  ]);

  return baseResult;
}

export function evaluateRecommendationPreview(
  context: RecommendationContext,
  weights: RecommendationWeights = defaultRecommendationWeights
): RecommendationPreviewResponse {
  const detailedBreakdown = {
    pricingReadiness: recommendationRegistry.pricingReadiness.run(context)[0],
    packageCompleteness: recommendationRegistry.packageCompleteness.run(context)[0],
    stackFit: recommendationRegistry.stackFit.run(context)[0],
    securityBaseline: recommendationRegistry.securityBaseline.run(context)[0]
  };

  return {
    context,
    result: aggregateRecommendation(context, detailedBreakdown, weights),
    detailedBreakdown
  };
}
