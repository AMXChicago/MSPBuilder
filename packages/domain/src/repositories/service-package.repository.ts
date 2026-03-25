import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { ServicePackage, ServicePackageItem } from "../service-catalog/types";

export interface ServicePackageAggregate extends ServicePackage {
  items: ServicePackageItem[];
}

export interface ServicePackageRepository extends Repository<ServicePackageAggregate> {
  getByOrganizationId(context: TenantContext): Promise<ServicePackageAggregate | null>;
}
