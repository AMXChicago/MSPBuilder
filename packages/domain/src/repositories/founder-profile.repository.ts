import type { Repository } from "../common/repository";
import type { FounderProfile } from "../founder-profile/types";

export interface FounderProfileRepository extends Repository<FounderProfile> {
  getByOrganizationId(organizationId: string): Promise<FounderProfile | null>;
}
