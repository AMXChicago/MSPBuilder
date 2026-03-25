import type { AuditedEntity, BillingFrequency, CurrencyCode, PricingUnit, TenantScoped } from "../common/types";

export interface PricingModel extends AuditedEntity, TenantScoped {
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
  passthroughCost: number;
  markupPercentage: number;
  effectiveMarginPercent?: number;
  targetMarginPercent: number;
  floorMarginPercent: number;
}

export type PricingInput = PricingModel;

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
  defaultPricingUnit: PricingUnit;
  defaultBillingFrequency: BillingFrequency;
  defaultMarkupPercentage: number;
  recommendedContractTermMonths: number;
}
