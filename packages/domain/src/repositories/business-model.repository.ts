import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { BusinessModel } from "../business-model/types";

export interface BusinessModelRepository extends Repository<BusinessModel> {
  getByOrganizationId(context: TenantContext): Promise<BusinessModel | null>;
}
