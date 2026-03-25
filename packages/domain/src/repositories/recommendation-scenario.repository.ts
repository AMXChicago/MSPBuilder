import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { RecommendationScenario } from "../recommendation-context/types";

export interface RecommendationScenarioRepository extends Repository<RecommendationScenario> {
  getLatestByOrganizationId(context: TenantContext): Promise<RecommendationScenario | null>;
}
