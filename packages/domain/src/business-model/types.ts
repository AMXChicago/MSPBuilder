import type { AuditedEntity, BusinessType, BudgetPositioning, ComplianceSensitivity, CurrencyCode, DeliveryModel, FounderMaturity, LifecycleStatus, TenantScoped } from "../common/types";

export interface BusinessModel extends AuditedEntity, TenantScoped {
  name: string;
  businessType: BusinessType;
  targetVerticals: string[];
  targetCompanySizes: string[];
  deliveryModel: DeliveryModel;
  complianceSensitivity: ComplianceSensitivity;
  budgetPositioning: BudgetPositioning;
  founderMaturity: FounderMaturity;
  revenueStrategy: "recurring" | "hybrid" | "project-first";
  targetGrossMarginPercent: number;
  currencyCode: CurrencyCode;
  status: LifecycleStatus;
}
