import type { AuditedEntity, LifecycleStatus, TemplateKind, TenantScoped } from "../common/types";

export interface TemplateAsset extends AuditedEntity, TenantScoped {
  name: string;
  kind: TemplateKind;
  slug: string;
  version: string;
  status: LifecycleStatus;
  variables: string[];
}
