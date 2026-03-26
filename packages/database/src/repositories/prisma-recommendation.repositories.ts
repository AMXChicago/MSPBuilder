import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  PersistedRecommendationResult,
  RecommendationResultRepository,
  RecommendationScenario,
  RecommendationScenarioRepository,
  TenantContext
} from "@launch-os/domain";
import {
  fromPrismaPersistedRecommendationResult,
  fromPrismaRecommendationScenario,
  toPrismaDecimal,
  toPrismaScenarioStatus
} from "../converters";

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

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
      ...(model.founderProfileId ? { founderProfileId: model.founderProfileId } : {}),
      ...(model.businessModelId ? { businessModelId: model.businessModelId } : {}),
      ...(model.servicePackageId ? { servicePackageId: model.servicePackageId } : {}),
      ...(model.pricingModelId ? { pricingModelId: model.pricingModelId } : {}),
      contextVersion: model.contextVersion,
      rulesVersion: model.rulesVersion,
      status: toPrismaScenarioStatus(model.status),
      ...(model.founderProfileSnapshot ? { founderProfileSnapshot: toInputJson(model.founderProfileSnapshot) } : {}),
      businessModelSnapshot: toInputJson(model.businessModelSnapshot),
      servicePackageSnapshot: toInputJson(model.servicePackageSnapshot),
      pricingModelSnapshot: toInputJson(model.pricingModelSnapshot),
      constraintSnapshot: toInputJson(model.constraintSnapshot),
      ...(model.vendorSnapshot ? { vendorSnapshot: toInputJson(model.vendorSnapshot) } : {})
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

    const overallScore = toPrismaDecimal(model.overallScore);
    const confidenceScore = toPrismaDecimal(model.confidenceScore);
    if (!overallScore || !confidenceScore) {
      throw new Error("Recommendation result contains missing numeric values.");
    }

    const data = {
      organizationId: context.organizationId,
      scenarioId: model.scenarioId,
      overallScore,
      readinessLevel: model.readinessLevel,
      riskLevel: model.riskLevel,
      confidenceLevel: model.confidenceLevel,
      confidenceScore,
      summary: model.summary,
      resultSnapshot: toInputJson(model.resultSnapshot),
      detailedBreakdown: toInputJson(model.detailedBreakdown)
    };

    const record = existing
      ? await this.prisma.recommendationResultRecord.update({ where: { id: model.id }, data })
      : await this.prisma.recommendationResultRecord.create({ data: { id: model.id, ...data } });

    return fromPrismaPersistedRecommendationResult(record);
  }
}
