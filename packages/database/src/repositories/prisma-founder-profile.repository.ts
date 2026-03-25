import type { FounderProfileRepository, FounderProfile, TenantContext } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import { fromPrismaFounderProfile } from "../converters";

export class PrismaFounderProfileRepository implements FounderProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.founderProfile.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      }
    });

    return record ? fromPrismaFounderProfile(record) : null;
  }

  async getByOrganizationId(context: TenantContext) {
    const record = await this.prisma.founderProfile.findFirst({
      where: {
        organizationId: context.organizationId
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return record ? fromPrismaFounderProfile(record) : null;
  }

  async save(context: TenantContext, model: FounderProfile) {
    const existing = await this.prisma.founderProfile.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Founder profile does not belong to the active organization.");
    }

    const record = existing
      ? await this.prisma.founderProfile.update({
          where: { id: model.id },
          data: {
            organizationId: context.organizationId,
            userId: model.userId,
            fullName: model.fullName,
            roleTitle: model.roleTitle,
            priorExperienceYears: model.priorExperienceYears,
            targetGeo: model.targetGeo,
            serviceMotion: model.serviceMotion,
            maturityLevel: model.maturityLevel,
            salesConfidence: model.salesConfidence,
            technicalDepth: model.technicalDepth,
            preferredEngagementModel: model.preferredEngagementModel
          }
        })
      : await this.prisma.founderProfile.create({
          data: {
            id: model.id,
            organizationId: context.organizationId,
            userId: model.userId,
            fullName: model.fullName,
            roleTitle: model.roleTitle,
            priorExperienceYears: model.priorExperienceYears,
            targetGeo: model.targetGeo,
            serviceMotion: model.serviceMotion,
            maturityLevel: model.maturityLevel,
            salesConfidence: model.salesConfidence,
            technicalDepth: model.technicalDepth,
            preferredEngagementModel: model.preferredEngagementModel
          }
        });

    return fromPrismaFounderProfile(record);
  }
}
