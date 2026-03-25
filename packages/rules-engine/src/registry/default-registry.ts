import { RulesEngine } from "../core/engine";
import { packageCompletenessPolicy } from "../policies/package-completeness.policy";
import { pricingReadinessPolicy } from "../policies/pricing-readiness.policy";
import { securityBaselineSelectionPolicy } from "../policies/security-baseline-selection.policy";
import { stackFitScoringPolicy } from "../policies/stack-fit-scoring.policy";

export const recommendationRegistry = {
  pricingReadiness: new RulesEngine([pricingReadinessPolicy]),
  packageCompleteness: new RulesEngine([packageCompletenessPolicy]),
  stackFit: new RulesEngine([stackFitScoringPolicy]),
  securityBaseline: new RulesEngine([securityBaselineSelectionPolicy])
};
