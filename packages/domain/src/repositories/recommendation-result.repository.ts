import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { PersistedRecommendationResult } from "../recommendation-result/types";

export interface RecommendationResultRepository extends Repository<PersistedRecommendationResult> {
  getLatestByOrganizationId(context: TenantContext): Promise<PersistedRecommendationResult | null>;
  getByScenarioId(context: TenantContext, scenarioId: string): Promise<PersistedRecommendationResult | null>;
}
