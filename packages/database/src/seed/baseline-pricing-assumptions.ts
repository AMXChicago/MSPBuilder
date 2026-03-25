export interface BaselinePricingAssumptionSeed {
  code: string;
  pricingUnit: "per-user" | "per-device" | "per-location" | "per-tenant" | "flat-rate";
  defaultBillingFrequency: "monthly" | "quarterly" | "annual";
  defaultMarginBehavior: "passthrough" | "markup" | "blended";
  minimumQuantity: number;
  contractTermMonths: number;
}

export const baselinePricingAssumptions: BaselinePricingAssumptionSeed[] = [
  {
    code: "core-msp-per-user",
    pricingUnit: "per-user",
    defaultBillingFrequency: "monthly",
    defaultMarginBehavior: "markup",
    minimumQuantity: 10,
    contractTermMonths: 12
  },
  {
    code: "security-device-coverage",
    pricingUnit: "per-device",
    defaultBillingFrequency: "monthly",
    defaultMarginBehavior: "blended",
    minimumQuantity: 25,
    contractTermMonths: 12
  }
];
