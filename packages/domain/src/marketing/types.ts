import type { AuditedEntity, LifecycleStatus, TenantScoped } from "../common/types";

export interface LaunchCampaign extends AuditedEntity, TenantScoped {
  name: string;
  channel: "website" | "email" | "linkedin" | "partner" | "direct-outreach";
  offer: string;
  status: LifecycleStatus;
}
