import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuthenticatedTenantContext,
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
  TenantContext
} from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import { LaunchOsWorkflowService } from "./workflow-service";

class MemoryRepository<T extends { id: string; organizationId: string }> {
  constructor(private readonly records: T[] = []) {}

  async getById(context: TenantContext, id: string) {
    return this.records.find((record) => record.organizationId === context.organizationId && record.id === id) ?? null;
  }

  async save(context: TenantContext, model: T) {
    const index = this.records.findIndex((record) => record.id === model.id);
    if (index >= 0) {
      this.records[index] = { ...model, organizationId: context.organizationId };
      return this.records[index];
    }
    this.records.push({ ...model, organizationId: context.organizationId });
    return this.records[this.records.length - 1];
  }

  async getLatestByOrganizationId(context: TenantContext) {
    const scoped = this.records.filter((record) => record.organizationId === context.organizationId);
    return scoped[scoped.length - 1] ?? null;
  }

  values() {
    return this.records;
  }
}

class MemoryFounderRepository extends MemoryRepository<FounderProfile> implements FounderProfileRepository {
  getByOrganizationId(context: TenantContext) {
    return this.getLatestByOrganizationId(context);
  }
}

class MemoryBusinessRepository extends MemoryRepository<BusinessModel> implements BusinessModelRepository {
  getByOrganizationId(context: TenantContext) {
    return this.getLatestByOrganizationId(context);
  }
}

class MemoryServicePackageRepository extends MemoryRepository<ServicePackageAggregate> implements ServicePackageRepository {
  getByOrganizationId(context: TenantContext) {
    return this.getLatestByOrganizationId(context);
  }
}

class MemoryPricingRepository extends MemoryRepository<PricingModel> implements PricingModelRepository {
  getByOrganizationId(context: TenantContext) {
    return this.getLatestByOrganizationId(context);
  }

  async getByServicePackageId(context: TenantContext, servicePackageId: string) {
    return this.values().find((record) => record.organizationId === context.organizationId && record.servicePackageId === servicePackageId) ?? null;
  }
}

class MemoryScenarioRepository extends MemoryRepository<RecommendationScenario> implements RecommendationScenarioRepository {
  getLatestByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }
}

class MemoryRecommendationResultRepository extends MemoryRepository<PersistedRecommendationResult> implements RecommendationResultRepository {
  getLatestByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }

  async getByScenarioId(context: TenantContext, scenarioId: string) {
    return this.values().find((record) => record.organizationId === context.organizationId && record.scenarioId === scenarioId) ?? null;
  }
}

function createFakePrisma() {
  const serviceDefinitions = [
    {
      id: "service-helpdesk",
      organizationId: "org-a",
      name: "Managed Help Desk",
      category: "HELPDESK",
      description: "Help desk",
      baseUnit: "user",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    },
    {
      id: "service-edr",
      organizationId: "org-a",
      name: "Endpoint Detection and Response",
      category: "SECURITY",
      description: "EDR",
      baseUnit: "device",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    }
  ];

  const vendors = [
    {
      id: "vendor-halo",
      organizationId: "org-a",
      name: "HaloPSA",
      category: "PSA",
      websiteUrl: null,
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    },
    {
      id: "vendor-huntress",
      organizationId: "org-a",
      name: "Huntress",
      category: "MDR",
      websiteUrl: null,
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    }
  ];

  const tx = {
    recommendationOutputLink: {
      async deleteMany() {
        return { count: 0 };
      },
      async createMany() {
        return { count: 4 };
      }
    },
    stackRecommendation: {
      async create() {
        return { id: "stack-rec-1" };
      }
    }
  };

  return {
    serviceDefinition: {
      async findMany() {
        return serviceDefinitions;
      }
    },
    vendor: {
      async findMany() {
        return vendors;
      }
    },
    recommendationOutputLink: tx.recommendationOutputLink,
    stackRecommendation: tx.stackRecommendation,
    async $transaction<T>(callback: (transaction: typeof tx) => Promise<T>) {
      return callback(tx);
    }
  } as unknown as PrismaClient;
}

function createHarness() {
  const founderRepository = new MemoryFounderRepository();
  const businessRepository = new MemoryBusinessRepository();
  const servicePackageRepository = new MemoryServicePackageRepository();
  const pricingRepository = new MemoryPricingRepository();
  const scenarioRepository = new MemoryScenarioRepository();
  const resultRepository = new MemoryRecommendationResultRepository();
  const workflowService = new LaunchOsWorkflowService({
    prisma: createFakePrisma(),
    founderProfiles: founderRepository,
    businessModels: businessRepository,
    servicePackages: servicePackageRepository,
    pricingModels: pricingRepository,
    recommendationScenarios: scenarioRepository,
    recommendationResults: resultRepository
  });

  return {
    workflowService,
    founderRepository,
    businessRepository,
    servicePackageRepository,
    pricingRepository,
    scenarioRepository,
    resultRepository
  };
}

const tenant: AuthenticatedTenantContext = {
  organizationId: "org-a",
  userId: "user-a",
  membershipRole: "owner",
  authenticationSource: "session",
  authenticatedUser: {
    userId: "user-a",
    email: "owner@orga.test",
    fullName: "Org A Owner"
  }
};

test("workflow service returns saved workflow state for an authenticated tenant", async () => {
  const { workflowService } = createHarness();

  await workflowService.saveFounderProfile(tenant, {
    fullName: "Alex Founder",
    roleTitle: "Owner",
    priorExperienceYears: 7,
    targetGeo: "United States",
    serviceMotion: "managed-services",
    maturityLevel: "growing",
    salesConfidence: 8,
    technicalDepth: 8,
    preferredEngagementModel: "owner-operator"
  });

  const state = await workflowService.getWorkflowState(tenant);
  assert.equal(state.founderProfile?.fullName, "Alex Founder");
  assert.equal(state.tenant.userId, "user-a");
  assert.equal(state.referenceData.serviceDefinitions.length, 2);
});

test("workflow service generates recommendation preview from persisted tenant records", async () => {
  const { workflowService, resultRepository, scenarioRepository } = createHarness();

  const businessModel = await workflowService.saveBusinessModel(tenant, {
    name: "Healthcare MSSP",
    businessType: "mssp",
    targetVerticals: ["healthcare"],
    targetCompanySizes: ["50-250 employees"],
    deliveryModel: "remote",
    complianceSensitivity: "high",
    budgetPositioning: "premium",
    founderMaturity: "advanced",
    revenueStrategy: "recurring",
    targetGrossMarginPercent: 60,
    currencyCode: "USD",
    status: "draft"
  });

  const servicePackage = await workflowService.saveServicePackage(tenant, {
    name: "Secure Care",
    marketPosition: "best",
    description: "Security-led managed service package",
    targetPersona: "Healthcare groups",
    includesSecurityBaseline: true,
    defaultSlaTier: "priority",
    defaultSupportHours: "extended-hours",
    defaultExclusions: [],
    status: "draft",
    items: [
      {
        serviceDefinitionId: "service-helpdesk",
        isRequired: true,
        includedQuantity: 1,
        slaTier: "priority",
        supportHours: "extended-hours",
        exclusions: [],
        priorityLevel: "high",
        sortOrder: 0
      },
      {
        serviceDefinitionId: "service-edr",
        isRequired: true,
        includedQuantity: 1,
        slaTier: "priority",
        supportHours: "extended-hours",
        exclusions: [],
        priorityLevel: "critical",
        sortOrder: 1
      }
    ]
  });

  await workflowService.savePricingModel(tenant, {
    servicePackageId: servicePackage.id,
    pricingUnit: "user",
    currencyCode: "USD",
    monthlyBasePrice: 180,
    onboardingFee: 2000,
    minimumQuantity: 20,
    includedQuantity: 20,
    overageUnitPrice: 18,
    billingFrequency: "monthly",
    contractTermMonths: 12,
    passthroughCost: 70,
    markupPercentage: 40,
    effectiveMarginPercent: 61.11,
    targetMarginPercent: 55,
    floorMarginPercent: 35
  });

  const preview = await workflowService.generateRecommendationPreview(tenant);
  assert.equal(preview.context.businessModel.name, businessModel.name);
  assert.ok(preview.result.overallScore > 0);
  assert.equal(resultRepository.values().length, 1);
  assert.equal(scenarioRepository.values().length, 1);
});
