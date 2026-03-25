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
  ReadinessLevel
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
  ]).slice(0, 8);

  const confidenceScore = clampConfidence(
    (detailedBreakdown.pricingReadiness.confidence +
      detailedBreakdown.packageCompleteness.confidence +
      detailedBreakdown.stackFit.confidence +
      detailedBreakdown.securityBaseline.confidence) /
      4 -
      negativeSignals.length * 0.02 +
      positiveSignals.length * 0.01
  );

  const readinessLevel = resolveReadinessLevel(weightedScore);
  const riskLevel = resolveRiskLevel(negativeSignals.length, detailedBreakdown.pricingReadiness, detailedBreakdown.packageCompleteness);
  const confidenceLevel = resolveConfidenceLevel(confidenceScore);

  const summary =
    readinessLevel === "high"
      ? riskLevel === "low"
        ? "Strong MSP/MSSP foundation with coherent pricing, package design, and recommendation fit."
        : "Strong core foundation with some operational or commercial risks to resolve."
      : readinessLevel === "medium"
        ? "Promising MSP/MSSP design with meaningful gaps that should be addressed before launch."
        : "Early-stage recommendation profile with significant gaps in pricing, package design, or baseline readiness.";

  return {
    overallScore: weightedScore,
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
      negativeSignals
    }
  };
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
