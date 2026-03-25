export type EntityId = string;
export type ISODateString = string;
export type CurrencyCode = "USD";

export interface AuditedEntity {
  id: EntityId;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface TenantScoped {
  organizationId: EntityId;
}

export interface SoftDeletable {
  archivedAt?: ISODateString;
}

export type LifecycleStatus = "draft" | "active" | "archived";
export type MaturityLevel = "new" | "growing" | "established";
export type ServiceMotion = "managed-services" | "project-led" | "security-led" | "hybrid";
export type TemplateKind = "contract" | "proposal" | "sop" | "checklist" | "marketing";
export type BaselineCategory = "identity" | "endpoint" | "email" | "network" | "backup" | "monitoring";
