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

export type BusinessType = "msp" | "mssp" | "hybrid" | "co-managed";
export type DeliveryModel = "remote" | "onsite" | "hybrid" | "co-managed";
export type ComplianceSensitivity = "low" | "moderate" | "high" | "regulated";
export type BudgetPositioning = "budget" | "mainstream" | "premium" | "enterprise";
export type FounderMaturity = "new-operator" | "experienced-builder" | "scale-ready";
export type ServiceRequirement = "required" | "optional";
export type SlaTier = "best-effort" | "business-hours" | "priority" | "24x7";
export type SupportHours = "business-hours" | "extended-hours" | "24x7";
export type PricingUnit = "per-user" | "per-device" | "per-location" | "per-tenant" | "flat-rate";
export type BillingFrequency = "monthly" | "quarterly" | "annual";
export type MarginBehavior = "passthrough" | "markup" | "blended";
export type RecommendationFamily = "pricing-readiness" | "package-completeness" | "stack-fit" | "security-baseline";
export type ScenarioStatus = "draft" | "evaluated";
