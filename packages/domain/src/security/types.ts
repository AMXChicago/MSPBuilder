import type { AuditedEntity, BaselineCategory, LifecycleStatus, TenantScoped } from "../common/types";

export interface SecurityBaseline extends AuditedEntity, TenantScoped {
  name: string;
  category: BaselineCategory;
  controlCode: string;
  requirement: string;
  status: LifecycleStatus;
}
