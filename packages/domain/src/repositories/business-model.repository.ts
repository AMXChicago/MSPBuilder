import type { Repository } from "../common/repository";
import type { BusinessModel } from "../business-model/types";

export interface BusinessModelRepository extends Repository<BusinessModel> {
  getByOrganizationId(organizationId: string): Promise<BusinessModel | null>;
}
