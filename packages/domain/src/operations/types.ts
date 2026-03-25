import type { AuditedEntity, EntityId, LifecycleStatus, TenantScoped } from "../common/types";

export interface OnboardingChecklist extends AuditedEntity, TenantScoped {
  name: string;
  audience: "internal" | "client";
  status: LifecycleStatus;
  stepIds: EntityId[];
}

export interface SopDocument extends AuditedEntity, TenantScoped {
  title: string;
  serviceArea: string;
  version: string;
  status: LifecycleStatus;
}
