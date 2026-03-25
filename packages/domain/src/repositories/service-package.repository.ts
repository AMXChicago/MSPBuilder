import type { Repository } from "../common/repository";
import type { ServicePackage, ServicePackageItem } from "../service-catalog/types";

export interface ServicePackageAggregate extends ServicePackage {
  items: ServicePackageItem[];
}

export interface ServicePackageRepository extends Repository<ServicePackageAggregate> {
  getByOrganizationId(organizationId: string): Promise<ServicePackageAggregate | null>;
}
