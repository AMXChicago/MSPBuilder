import type { AuditedEntity, LifecycleStatus, SlaTier, SupportHours, TenantScoped } from "../common/types";

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
  slaTier: SlaTier;
  supportHours: SupportHours;
  exclusions: string[];
  status: LifecycleStatus;
}

export interface ServicePackageItem extends AuditedEntity, TenantScoped {
  servicePackageId: string;
  serviceDefinitionId: string;
  requirement: "required" | "optional";
  includedQuantity: number;
  quantityUnit: string;
  limitSummary?: string;
  notes?: string;
  sortOrder: number;
}
