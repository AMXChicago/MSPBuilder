import type { AuditedEntity, EntityId, TenantScoped } from "../common/types";

export interface Vendor extends AuditedEntity, TenantScoped {
  name: string;
  category: "psa" | "rmm" | "mdr" | "backup" | "documentation" | "email-security" | "identity";
  websiteUrl?: string;
  msspFriendly: boolean;
  supportsMultiTenant: boolean;
}

export interface StackRecommendation extends AuditedEntity, TenantScoped {
  scenarioId?: EntityId;
  businessModelId?: EntityId;
  packageId?: EntityId;
  vendorIds: EntityId[];
  rationale: string[];
  confidenceScore: number;
}
