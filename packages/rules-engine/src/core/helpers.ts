import { RulesEngine } from "./engine";
import type { RecommendationContext, RecommendationPolicy } from "./types";

export function selectPrimaryResult<TData>(engine: RulesEngine<TData>, context: RecommendationContext) {
  const [primary] = engine.run(context);

  if (!primary) {
    throw new Error("Expected a primary recommendation result but none was produced.");
  }

  return primary;
}

export function createSingleResultPolicy<TData>(policy: RecommendationPolicy<TData>) {
  return new RulesEngine([policy]);
}
