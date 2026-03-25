import { RulesEngine } from "../core/engine";
import { pricingGuardrailsPolicy } from "../policies/pricing-guardrails.policy";
import { stackRecommendationPolicy } from "../policies/stack-recommendation.policy";

export const recommendationRegistry = {
  stack: new RulesEngine([stackRecommendationPolicy]),
  pricing: new RulesEngine([pricingGuardrailsPolicy])
};
