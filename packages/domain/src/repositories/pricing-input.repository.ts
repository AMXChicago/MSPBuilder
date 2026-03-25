import type { Repository } from "../common/repository";
import type { PricingModel } from "../pricing/types";

export interface PricingModelRepository extends Repository<PricingModel> {
  getByServicePackageId(servicePackageId: string): Promise<PricingModel | null>;
}

export type PricingInputRepository = PricingModelRepository;
