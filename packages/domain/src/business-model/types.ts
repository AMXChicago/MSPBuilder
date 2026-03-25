import type { AuditedEntity, CurrencyCode, LifecycleStatus, TenantScoped } from "../common/types";

export interface BusinessModel extends AuditedEntity, TenantScoped {
  name: string;
  targetVerticals: string[];
  targetCompanySizes: string[];
  revenueStrategy: "recurring" | "hybrid" | "project-first";
  primaryDeliveryMode: "remote" | "onsite" | "hybrid";
  targetGrossMarginPercent: number;
  currencyCode: CurrencyCode;
  status: LifecycleStatus;
}
