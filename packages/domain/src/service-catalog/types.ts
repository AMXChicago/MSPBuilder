import type { AuditedEntity, LifecycleStatus, PriorityLevel, SlaTier, SupportHours, TenantScoped } from "../common/types";

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
  targetPersona: string;
  includesSecurityBaseline: boolean;
  defaultSlaTier: SlaTier;
  defaultSupportHours: SupportHours;
  defaultExclusions: string[];
  status: LifecycleStatus;
}

export interface ServicePackageItem extends AuditedEntity, TenantScoped {
  servicePackageId: string;
  serviceDefinitionId: string;
  isRequired: boolean;
  includedQuantity: number;
  slaTier: SlaTier;
  supportHours: SupportHours;
  exclusions: string[];
  priorityLevel: PriorityLevel;
  notes?: string;
  sortOrder: number;
}
