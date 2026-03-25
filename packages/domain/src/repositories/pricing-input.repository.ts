import type { Repository } from "../common/repository";
import type { PricingInput } from "../pricing/types";

export interface PricingInputRepository extends Repository<PricingInput> {
  getByServicePackageId(servicePackageId: string): Promise<PricingInput | null>;
}
