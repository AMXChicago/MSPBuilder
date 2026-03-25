import type { AuditedEntity, ISODateString, TenantScoped } from "../common/types";

export interface KpiRecord extends AuditedEntity, TenantScoped {
  metricCode: string;
  metricName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  value: number;
  unit: "currency" | "percent" | "count" | "days";
}
