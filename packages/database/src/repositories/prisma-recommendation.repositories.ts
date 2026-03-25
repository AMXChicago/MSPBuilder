import type {
  PersistedRecommendationResult,
  RecommendationResultRepository,
  RecommendationScenario,
  RecommendationScenarioRepository,
  TenantContext
} from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import {
  fromPrismaPersistedRecommendationResult,
  fromPrismaRecommendationScenario,
  toPrismaDecimal,
  toPrismaScenarioStatus
} from "../converters";

export class PrismaRecommendationScenarioRepository implements RecommendationScenarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.recommendationScenario.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      }
    });

    return record ? fromPrismaRecommendationScenario(record) : null;
  }

  async getLatestByOrganizationId(context: TenantContext) {
    const record = await this.prisma.recommendationScenario.findFirst({
      where: {
        organizationId: context.organizationId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return record ? fromPrismaRecommendationScenario(record) : null;
  }

  async save(context: TenantContext, model: RecommendationScenario) {
    const existing = await this.prisma.recommendationScenario.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Recommendation scenario does not belong to the active organization.");
    }

    const data = {
      organizationId: context.organizationId,
      founderProfileId: model.founderProfileId,
      businessModelId: model.businessModelId,
      servicePackageId: model.servicePackageId,
      pricingModelId: model.pricingModelId,
      contextVersion: model.contextVersion,
      rulesVersion: model.rulesVersion,
      status: toPrismaScenarioStatus(model.status),
      founderProfileSnapshot: model.founderProfileSnapshot,
      businessModelSnapshot: model.businessModelSnapshot,
      servicePackageSnapshot: model.servicePackageSnapshot,
      pricingModelSnapshot: model.pricingModelSnapshot,
      constraintSnapshot: model.constraintSnapshot,
      vendorSnapshot: model.vendorSnapshot
    };

    const record = existing
      ? await this.prisma.recommendationScenario.update({ where: { id: model.id }, data })
      : await this.prisma.recommendationScenario.create({ data: { id: model.id, ...data } });

    return fromPrismaRecommendationScenario(record);
  }
}

export class PrismaRecommendationResultRepository implements RecommendationResultRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.recommendationResultRecord.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      }
    });

    return record ? fromPrismaPersistedRecommendationResult(record) : null;
  }

  async getByScenarioId(context: TenantContext, scenarioId: string) {
    const record = await this.prisma.recommendationResultRecord.findFirst({
      where: {
        organizationId: context.organizationId,
        scenarioId
      }
    });

    return record ? fromPrismaPersistedRecommendationResult(record) : null;
  }

  async getLatestByOrganizationId(context: TenantContext) {
    const record = await this.prisma.recommendationResultRecord.findFirst({
      where: {
        organizationId: context.organizationId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return record ? fromPrismaPersistedRecommendationResult(record) : null;
  }

  async save(context: TenantContext, model: PersistedRecommendationResult) {
    const existing = await this.prisma.recommendationResultRecord.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Recommendation result does not belong to the active organization.");
    }

    const data = {
      organizationId: context.organizationId,
      scenarioId: model.scenarioId,
      overallScore: toPrismaDecimal(model.overallScore),
      readinessLevel: model.readinessLevel,
      riskLevel: model.riskLevel,
      confidenceLevel: model.confidenceLevel,
      confidenceScore: toPrismaDecimal(model.confidenceScore),
      summary: model.summary,
      resultSnapshot: model.resultSnapshot,
      detailedBreakdown: model.detailedBreakdown
    };

    const record = existing
      ? await this.prisma.recommendationResultRecord.update({ where: { id: model.id }, data })
      : await this.prisma.recommendationResultRecord.create({ data: { id: model.id, ...data } });

    return fromPrismaPersistedRecommendationResult(record);
  }
}
