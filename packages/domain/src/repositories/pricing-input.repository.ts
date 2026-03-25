import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { PricingModel } from "../pricing/types";

export interface PricingModelRepository extends Repository<PricingModel> {
  getByOrganizationId(context: TenantContext): Promise<PricingModel | null>;
  getByServicePackageId(context: TenantContext, servicePackageId: string): Promise<PricingModel | null>;
}

export type PricingInputRepository = PricingModelRepository;
