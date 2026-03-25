import type { AuditedEntity, EntityId, LifecycleStatus, TenantScoped } from "../common/types";

export interface ServiceDefinition extends AuditedEntity, TenantScoped {
  name: string;
  category: "helpdesk" | "security" | "network" | "compliance" | "cloud" | "vcio";
  description: string;
  baseUnit: "user" | "device" | "site" | "tenant" | "hour";
  status: LifecycleStatus;
}

export interface ServicePackage extends AuditedEntity, TenantScoped {
  name: string;
  marketPosition: "good" | "better" | "best" | "enterprise";
  description: string;
  serviceIds: EntityId[];
  targetPersona: string;
  includesSecurityBaseline: boolean;
  status: LifecycleStatus;
}
