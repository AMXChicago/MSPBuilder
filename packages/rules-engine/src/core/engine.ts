import type { RecommendationContext, RecommendationPolicy, RecommendationResult } from "./types";

export class RulesEngine<TData> {
  constructor(private readonly policies: RecommendationPolicy<TData>[]) {}

  run(context: RecommendationContext): RecommendationResult<TData>[] {
    return this.policies
      .flatMap((policy) => policy.evaluate(context))
      .sort((left, right) => right.score - left.score);
  }
}
