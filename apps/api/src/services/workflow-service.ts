import { randomUUID } from "node:crypto";
import {
  prisma,
  PrismaBusinessModelRepository,
  PrismaFounderProfileRepository,
  PrismaPricingModelRepository,
  PrismaRecommendationResultRepository,
  PrismaRecommendationScenarioRepository,
  PrismaServicePackageRepository,
  fromPrismaServiceDefinition,
  fromPrismaVendor,
  type DatabasePrismaClient
} from "@launch-os/database";
import type {
  BusinessModel,
  BusinessModelRepository,
  FounderProfile,
  FounderProfileRepository,
  PersistedRecommendationResult,
  PricingModel,
  PricingModelRepository,
  RecommendationResultRepository,
  RecommendationScenario,
  RecommendationScenarioRepository,
  ServicePackageAggregate,
  ServicePackageRepository,
  AuthenticatedTenantContext
} from "@launch-os/domain";
import { evaluateRecommendationPreview } from "@launch-os/rules-engine";

const AVAILABLE_BASELINES = [
  { category: "identity", code: "baseline.identity.mfa", label: "MFA for admin and end-user access" },
  { category: "endpoint", code: "baseline.endpoint.edr", label: "Managed endpoint detection and response" },
  { category: "backup", code: "baseline.backup.monitoring", label: "Backup monitoring and restore validation" },
  { category: "email", code: "baseline.email.protection", label: "Email security hardening and protection" },
  { category: "network", code: "baseline.network.segmentation", label: "Network segmentation and secure edge control" }
] as const;

export interface WorkflowStateResponse {
  tenant: AuthenticatedTenantContext;
  founderProfile: FounderProfile | null;
  businessModel: BusinessModel | null;
  servicePackage: ServicePackageAggregate | null;
  pricingModel: PricingModel | null;
  latestScenario: RecommendationScenario | null;
  latestRecommendation: PersistedRecommendationResult | null;
  referenceData: {
    serviceDefinitions: Array<ReturnType<typeof fromPrismaServiceDefinition>>;
    vendors: Array<ReturnType<typeof fromPrismaVendor>>;
  };
}

export interface WorkflowServiceDependencies {
  prisma: DatabasePrismaClient;
  founderProfiles: FounderProfileRepository;
  businessModels: BusinessModelRepository;
  servicePackages: ServicePackageRepository;
  pricingModels: PricingModelRepository;
  recommendationScenarios: RecommendationScenarioRepository;
  recommendationResults: RecommendationResultRepository;
}

export interface SaveFounderProfileInput {
  id?: string;
  fullName: string;
  roleTitle: string;
  priorExperienceYears: number;
  targetGeo: string;
  serviceMotion: FounderProfile["serviceMotion"];
  maturityLevel: FounderProfile["maturityLevel"];
  salesConfidence: number;
  technicalDepth: number;
  preferredEngagementModel: FounderProfile["preferredEngagementModel"];
  userId?: string;
}

export interface SaveBusinessModelInput {
  id?: string;
  name: string;
  businessType: BusinessModel["businessType"];
  targetVerticals: string[];
  targetCompanySizes: string[];
  deliveryModel: BusinessModel["deliveryModel"];
  complianceSensitivity: BusinessModel["complianceSensitivity"];
  budgetPositioning: BusinessModel["budgetPositioning"];
  founderMaturity: BusinessModel["founderMaturity"];
  revenueStrategy: BusinessModel["revenueStrategy"];
  targetGrossMarginPercent: number;
  currencyCode: BusinessModel["currencyCode"];
  status: BusinessModel["status"];
}

export interface SaveServicePackageInput {
  id?: string;
  name: string;
  marketPosition: ServicePackageAggregate["marketPosition"];
  description: string;
  targetPersona: string;
  includesSecurityBaseline: boolean;
  defaultSlaTier: ServicePackageAggregate["defaultSlaTier"];
  defaultSupportHours: ServicePackageAggregate["defaultSupportHours"];
  defaultExclusions: string[];
  status: ServicePackageAggregate["status"];
  items: Array<{
    id?: string;
    serviceDefinitionId: string;
    isRequired: boolean;
    includedQuantity: number;
    slaTier: ServicePackageAggregate["items"][number]["slaTier"];
    supportHours: ServicePackageAggregate["items"][number]["supportHours"];
    exclusions: string[];
    priorityLevel: ServicePackageAggregate["items"][number]["priorityLevel"];
    notes?: string;
    sortOrder: number;
  }>;
}

export interface SavePricingModelInput {
  id?: string;
  servicePackageId: string;
  pricingUnit: PricingModel["pricingUnit"];
  currencyCode: PricingModel["currencyCode"];
  monthlyBasePrice: number;
  onboardingFee: number;
  minimumQuantity: number;
  includedQuantity: number;
  overageUnitPrice: number;
  billingFrequency: PricingModel["billingFrequency"];
  contractTermMonths: number;
  passthroughCost: number;
  markupPercentage: number;
  effectiveMarginPercent?: number;
  targetMarginPercent: number;
  floorMarginPercent: number;
}

export class LaunchOsWorkflowService {
  constructor(private readonly deps: WorkflowServiceDependencies) {}

  async saveFounderProfile(context: AuthenticatedTenantContext, input: SaveFounderProfileInput) {
    const userId = input.userId ?? context.userId;

    if (!userId) {
      throw new Error("Tenant context must include a userId when saving founder profiles.");
    }

    return this.deps.founderProfiles.save(context, {
      id: input.id ?? randomUUID(),
      organizationId: context.organizationId,
      userId,
      fullName: input.fullName,
      roleTitle: input.roleTitle,
      priorExperienceYears: input.priorExperienceYears,
      targetGeo: input.targetGeo,
      serviceMotion: input.serviceMotion,
      maturityLevel: input.maturityLevel,
      salesConfidence: input.salesConfidence,
      technicalDepth: input.technicalDepth,
      preferredEngagementModel: input.preferredEngagementModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async saveBusinessModel(context: AuthenticatedTenantContext, input: SaveBusinessModelInput) {
    return this.deps.businessModels.save(context, {
      id: input.id ?? randomUUID(),
      organizationId: context.organizationId,
      name: input.name,
      businessType: input.businessType,
      targetVerticals: input.targetVerticals,
      targetCompanySizes: input.targetCompanySizes,
      deliveryModel: input.deliveryModel,
      complianceSensitivity: input.complianceSensitivity,
      budgetPositioning: input.budgetPositioning,
      founderMaturity: input.founderMaturity,
      revenueStrategy: input.revenueStrategy,
      targetGrossMarginPercent: input.targetGrossMarginPercent,
      currencyCode: input.currencyCode,
      status: input.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async saveServicePackage(context: AuthenticatedTenantContext, input: SaveServicePackageInput) {
    const packageId = input.id ?? randomUUID();
    return this.deps.servicePackages.save(context, {
      id: packageId,
      organizationId: context.organizationId,
      name: input.name,
      marketPosition: input.marketPosition,
      description: input.description,
      targetPersona: input.targetPersona,
      includesSecurityBaseline: input.includesSecurityBaseline,
      defaultSlaTier: input.defaultSlaTier,
      defaultSupportHours: input.defaultSupportHours,
      defaultExclusions: input.defaultExclusions,
      status: input.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: input.items.map((item) => ({
        id: item.id ?? randomUUID(),
        organizationId: context.organizationId,
        servicePackageId: packageId,
        serviceDefinitionId: item.serviceDefinitionId,
        isRequired: item.isRequired,
        includedQuantity: item.includedQuantity,
        slaTier: item.slaTier,
        supportHours: item.supportHours,
        exclusions: item.exclusions,
        priorityLevel: item.priorityLevel,
        ...(item.notes !== undefined ? { notes: item.notes } : {}),
        sortOrder: item.sortOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    });
  }

  async savePricingModel(context: AuthenticatedTenantContext, input: SavePricingModelInput) {
    return this.deps.pricingModels.save(context, {
      id: input.id ?? randomUUID(),
      organizationId: context.organizationId,
      servicePackageId: input.servicePackageId,
      pricingUnit: input.pricingUnit,
      currencyCode: input.currencyCode,
      monthlyBasePrice: input.monthlyBasePrice,
      onboardingFee: input.onboardingFee,
      minimumQuantity: input.minimumQuantity,
      includedQuantity: input.includedQuantity,
      overageUnitPrice: input.overageUnitPrice,
      billingFrequency: input.billingFrequency,
      contractTermMonths: input.contractTermMonths,
      passthroughCost: input.passthroughCost,
      markupPercentage: input.markupPercentage,
      ...(input.effectiveMarginPercent !== undefined ? { effectiveMarginPercent: input.effectiveMarginPercent } : {}),
      targetMarginPercent: input.targetMarginPercent,
      floorMarginPercent: input.floorMarginPercent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async getWorkflowState(context: AuthenticatedTenantContext): Promise<WorkflowStateResponse> {
    const [founderProfile, businessModel, servicePackage, pricingModel, latestScenario, latestRecommendation, serviceDefinitionRecords, vendorRecords] = await Promise.all([
      this.deps.founderProfiles.getByOrganizationId(context),
      this.deps.businessModels.getByOrganizationId(context),
      this.deps.servicePackages.getByOrganizationId(context),
      this.deps.pricingModels.getByOrganizationId(context),
      this.deps.recommendationScenarios.getLatestByOrganizationId(context),
      this.deps.recommendationResults.getLatestByOrganizationId(context),
      this.deps.prisma.serviceDefinition.findMany({
        where: {
          organizationId: context.organizationId
        },
        orderBy: {
          name: "asc"
        }
      }),
      this.deps.prisma.vendor.findMany({
        where: {
          organizationId: context.organizationId
        },
        orderBy: {
          name: "asc"
        }
      })
    ]);

    return {
      tenant: context,
      founderProfile,
      businessModel,
      servicePackage,
      pricingModel,
      latestScenario,
      latestRecommendation,
      referenceData: {
        serviceDefinitions: serviceDefinitionRecords.map(fromPrismaServiceDefinition),
        vendors: vendorRecords.map(fromPrismaVendor)
      }
    };
  }

  async generateRecommendationPreview(context: AuthenticatedTenantContext) {
    const state = await this.getWorkflowState(context);
    const timestamp = new Date().toISOString();
    const serviceDefinitionById = new Map(state.referenceData.serviceDefinitions.map((definition) => [definition.id, definition]));

    const businessModel = state.businessModel
      ? {
          name: state.businessModel.name,
          businessType: state.businessModel.businessType,
          targetVerticals: state.businessModel.targetVerticals,
          targetCompanySizes: state.businessModel.targetCompanySizes,
          deliveryModel: state.businessModel.deliveryModel,
          complianceSensitivity: state.businessModel.complianceSensitivity,
          budgetPositioning: state.businessModel.budgetPositioning,
          founderMaturity: state.businessModel.founderMaturity,
          revenueStrategy: state.businessModel.revenueStrategy,
          targetGrossMarginPercent: state.businessModel.targetGrossMarginPercent,
          currencyCode: state.businessModel.currencyCode
        }
      : {
          name: "Draft Business Model",
          businessType: "msp" as const,
          targetVerticals: [],
          targetCompanySizes: [],
          deliveryModel: "remote" as const,
          complianceSensitivity: "low" as const,
          budgetPositioning: "standard" as const,
          founderMaturity: "beginner" as const,
          revenueStrategy: "recurring" as const,
          targetGrossMarginPercent: 0,
          currencyCode: "USD" as const
        };

    const servicePackage = state.servicePackage
      ? {
          name: state.servicePackage.name,
          marketPosition: state.servicePackage.marketPosition,
          description: state.servicePackage.description,
          targetPersona: state.servicePackage.targetPersona,
          includesSecurityBaseline: state.servicePackage.includesSecurityBaseline,
          defaultSlaTier: state.servicePackage.defaultSlaTier,
          defaultSupportHours: state.servicePackage.defaultSupportHours,
          defaultExclusions: state.servicePackage.defaultExclusions,
          items: state.servicePackage.items.map((item) => ({
            serviceDefinitionId: serviceDefinitionById.get(item.serviceDefinitionId)?.name ?? item.serviceDefinitionId,
            isRequired: item.isRequired,
            includedQuantity: item.includedQuantity,
            slaTier: item.slaTier,
            supportHours: item.supportHours,
            exclusions: item.exclusions,
            priorityLevel: item.priorityLevel,
            ...(item.notes !== undefined ? { notes: item.notes } : {}),
            sortOrder: item.sortOrder
          }))
        }
      : {
          name: "Draft Package",
          marketPosition: "good" as const,
          description: "",
          targetPersona: "",
          includesSecurityBaseline: false,
          defaultSlaTier: "standard" as const,
          defaultSupportHours: "business-hours" as const,
          defaultExclusions: [],
          items: []
        };

    const pricingModel = state.pricingModel
      ? {
          pricingUnit: state.pricingModel.pricingUnit,
          currencyCode: state.pricingModel.currencyCode,
          monthlyBasePrice: state.pricingModel.monthlyBasePrice,
          onboardingFee: state.pricingModel.onboardingFee,
          minimumQuantity: state.pricingModel.minimumQuantity,
          includedQuantity: state.pricingModel.includedQuantity,
          overageUnitPrice: state.pricingModel.overageUnitPrice,
          billingFrequency: state.pricingModel.billingFrequency,
          contractTermMonths: state.pricingModel.contractTermMonths,
          passthroughCost: state.pricingModel.passthroughCost,
          markupPercentage: state.pricingModel.markupPercentage,
          ...(state.pricingModel.effectiveMarginPercent !== undefined ? { effectiveMarginPercent: state.pricingModel.effectiveMarginPercent } : {}),
          targetMarginPercent: state.pricingModel.targetMarginPercent,
          floorMarginPercent: state.pricingModel.floorMarginPercent
        }
      : {
          pricingUnit: "user" as const,
          currencyCode: "USD" as const,
          monthlyBasePrice: 0,
          onboardingFee: 0,
          minimumQuantity: 0,
          includedQuantity: 0,
          overageUnitPrice: 0,
          billingFrequency: "monthly" as const,
          contractTermMonths: 0,
          passthroughCost: 0,
          markupPercentage: 0,
          targetMarginPercent: 0,
          floorMarginPercent: 0
        };

    const constraints = {
      budgetPositioning: businessModel.budgetPositioning,
      founderMaturity: businessModel.founderMaturity,
      complianceSensitivity: businessModel.complianceSensitivity,
      deliveryModel: businessModel.deliveryModel
    };

    const scenario = await this.deps.recommendationScenarios.save(context, {
      id: randomUUID(),
      organizationId: context.organizationId,
      ...(state.founderProfile?.id ? { founderProfileId: state.founderProfile.id } : {}),
      ...(state.businessModel?.id ? { businessModelId: state.businessModel.id } : {}),
      ...(state.servicePackage?.id ? { servicePackageId: state.servicePackage.id } : {}),
      ...(state.pricingModel?.id ? { pricingModelId: state.pricingModel.id } : {}),
      contextVersion: "1.0.0",
      rulesVersion: "1.0.0",
      status: "evaluated",
      ...(state.founderProfile
        ? {
            founderProfileSnapshot: {
              fullName: state.founderProfile.fullName,
              roleTitle: state.founderProfile.roleTitle,
              priorExperienceYears: state.founderProfile.priorExperienceYears,
              targetGeo: state.founderProfile.targetGeo,
              serviceMotion: state.founderProfile.serviceMotion,
              maturityLevel: state.founderProfile.maturityLevel,
              salesConfidence: state.founderProfile.salesConfidence,
              technicalDepth: state.founderProfile.technicalDepth,
              preferredEngagementModel: state.founderProfile.preferredEngagementModel
            }
          }
        : {}),
      businessModelSnapshot: businessModel,
      servicePackageSnapshot: servicePackage,
      pricingModelSnapshot: pricingModel,
      constraintSnapshot: constraints,
      vendorSnapshot: {
        vendorIds: state.referenceData.vendors.map((vendor) => vendor.id),
        serviceDefinitionIds: state.referenceData.serviceDefinitions.map((definition) => definition.id)
      },
      createdAt: timestamp,
      updatedAt: timestamp
    });

    const preview = evaluateRecommendationPreview({
      scenarioId: scenario.id,
      contextVersion: scenario.contextVersion,
      rulesVersion: scenario.rulesVersion,
      ...(scenario.founderProfileSnapshot ? { founderProfile: scenario.founderProfileSnapshot } : {}),
      businessModel,
      servicePackage,
      pricingModel,
      constraints,
      vendors: state.referenceData.vendors,
      vendorCostProfiles: [],
      availableBaselines: [...AVAILABLE_BASELINES],
      generatedAt: timestamp
    });

    const persistedResult = await this.deps.recommendationResults.save(context, {
      id: randomUUID(),
      organizationId: context.organizationId,
      scenarioId: scenario.id,
      overallScore: preview.result.overallScore,
      readinessLevel: preview.result.readinessLevel,
      riskLevel: preview.result.riskLevel,
      confidenceLevel: preview.result.confidenceLevel,
      confidenceScore: preview.result.confidenceScore,
      summary: preview.result.explainability.summary,
      resultSnapshot: preview.result as unknown as Record<string, unknown>,
      detailedBreakdown: preview.detailedBreakdown as unknown as Record<string, unknown>,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await this.deps.prisma.$transaction(async (tx) => {
      await tx.recommendationOutputLink.deleteMany({
        where: {
          organizationId: context.organizationId,
          scenarioId: scenario.id
        }
      });

      const stackRecommendation = await tx.stackRecommendation.create({
        data: {
          organizationId: context.organizationId,
          scenarioId: scenario.id,
          rationale: preview.result.stackFitSummary.reasons,
          confidenceScore: preview.result.stackFitSummary.confidence,
          vendors: {
            create: preview.result.stackFitSummary.data.suggestedVendorIds.map((vendorId) => ({ vendorId }))
          }
        }
      });

      await tx.recommendationOutputLink.createMany({
        data: [
          {
            organizationId: context.organizationId,
            scenarioId: scenario.id,
            recommendationFamily: "PRICING_READINESS",
            outputId: persistedResult.id
          },
          {
            organizationId: context.organizationId,
            scenarioId: scenario.id,
            recommendationFamily: "PACKAGE_COMPLETENESS",
            outputId: persistedResult.id
          },
          {
            organizationId: context.organizationId,
            scenarioId: scenario.id,
            recommendationFamily: "STACK_FIT",
            outputId: stackRecommendation.id
          },
          {
            organizationId: context.organizationId,
            scenarioId: scenario.id,
            recommendationFamily: "SECURITY_BASELINE",
            outputId: persistedResult.id
          }
        ]
      });
    });

    return preview;
  }
}

export const workflowService = new LaunchOsWorkflowService({
  prisma,
  founderProfiles: new PrismaFounderProfileRepository(prisma),
  businessModels: new PrismaBusinessModelRepository(prisma),
  servicePackages: new PrismaServicePackageRepository(prisma),
  pricingModels: new PrismaPricingModelRepository(prisma),
  recommendationScenarios: new PrismaRecommendationScenarioRepository(prisma),
  recommendationResults: new PrismaRecommendationResultRepository(prisma)
});




