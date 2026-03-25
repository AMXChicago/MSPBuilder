import type { Repository } from "../common/repository";
import type { TenantContext } from "../common/types";
import type { FounderProfile } from "../founder-profile/types";

export interface FounderProfileRepository extends Repository<FounderProfile> {
  getByOrganizationId(context: TenantContext): Promise<FounderProfile | null>;
}
