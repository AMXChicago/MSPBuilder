import type { AuditedEntity, EntityId, MaturityLevel, ServiceMotion, TenantScoped } from "../common/types";

export interface FounderProfile extends AuditedEntity, TenantScoped {
  userId: EntityId;
  fullName: string;
  roleTitle: string;
  priorExperienceYears: number;
  targetGeo: string;
  serviceMotion: ServiceMotion;
  maturityLevel: MaturityLevel;
  salesConfidence: number;
  technicalDepth: number;
  preferredEngagementModel: "fractional-founder" | "owner-operator" | "team-led";
}
