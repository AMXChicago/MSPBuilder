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

export interface TenantContext {
  organizationId: EntityId;
  userId?: EntityId;
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
export type DeliveryModel = "remote" | "onsite" | "hybrid";
export type ComplianceSensitivity = "low" | "medium" | "high";
export type BudgetPositioning = "budget" | "standard" | "premium";
export type FounderMaturity = "beginner" | "intermediate" | "advanced";
export type SlaTier = "best-effort" | "standard" | "priority" | "24x7";
export type SupportHours = "business-hours" | "extended-hours" | "24x7";
export type PriorityLevel = "low" | "standard" | "high" | "critical";
export type PricingUnit = "user" | "device" | "hybrid";
export type BillingFrequency = "monthly" | "quarterly" | "annual";
export type RecommendationFamily = "pricing-readiness" | "package-completeness" | "stack-fit" | "security-baseline";
export type ScenarioStatus = "draft" | "evaluated";
export type ReadinessLevel = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type ConfidenceLevel = "low" | "medium" | "high";
