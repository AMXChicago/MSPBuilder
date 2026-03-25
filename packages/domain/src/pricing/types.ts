import type { AuditedEntity, CurrencyCode, EntityId, TenantScoped } from "../common/types";

export interface PricingModel extends AuditedEntity, TenantScoped {
  servicePackageId: EntityId;
  pricingStrategy: "per-user" | "per-device" | "flat-rate" | "hybrid";
  currencyCode: CurrencyCode;
  monthlyBasePrice: number;
  onboardingFee: number;
  targetMarginPercent: number;
  floorMarginPercent: number;
}

export interface VendorCostProfile extends AuditedEntity, TenantScoped {
  vendorId: EntityId;
  serviceDefinitionId?: EntityId;
  costBasis: "per-user" | "per-device" | "flat-rate";
  unitCost: number;
  notes?: string;
}
