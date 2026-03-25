import type { AuditedEntity, BillingFrequency, CurrencyCode, MarginBehavior, PricingUnit, TenantScoped } from "../common/types";

export interface PricingInput extends AuditedEntity, TenantScoped {
  servicePackageId: string;
  pricingUnit: PricingUnit;
  currencyCode: CurrencyCode;
  monthlyBasePrice: number;
  onboardingFee: number;
  minimumQuantity: number;
  includedQuantity: number;
  overageUnitPrice: number;
  billingFrequency: BillingFrequency;
  contractTermMonths: number;
  marginBehavior: MarginBehavior;
  targetMarginPercent: number;
  floorMarginPercent: number;
}

export interface VendorCostProfile extends AuditedEntity, TenantScoped {
  vendorId: string;
  serviceDefinitionId?: string;
  costBasis: PricingUnit;
  unitCost: number;
  notes?: string;
}

export interface PricingAssumption extends TenantScoped {
  code: string;
  description: string;
  defaultMarginBehavior: MarginBehavior;
  defaultBillingFrequency: BillingFrequency;
  recommendedContractTermMonths: number;
}
