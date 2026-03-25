import type { Repository } from "../common/repository";
import type { RecommendationScenario } from "../recommendation-context/types";

export interface RecommendationScenarioRepository extends Repository<RecommendationScenario> {
  getLatestByOrganizationId(organizationId: string): Promise<RecommendationScenario | null>;
}
