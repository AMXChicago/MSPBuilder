import assert from "node:assert/strict";
import test from "node:test";
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
  TenantContext
} from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { LaunchOsWorkflowService } from "./services/workflow-service";

class MemoryRepository<T extends { id: string; organizationId: string }> {
  protected readonly records: T[] = [];

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
}

class MemoryFounderRepository extends MemoryRepository<FounderProfile> implements FounderProfileRepository {
  getByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }
}

class MemoryBusinessRepository extends MemoryRepository<BusinessModel> implements BusinessModelRepository {
  getByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }
}

class MemoryServicePackageRepository extends MemoryRepository<ServicePackageAggregate> implements ServicePackageRepository {
  getByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }
}

class MemoryPricingRepository extends MemoryRepository<PricingModel> implements PricingModelRepository {
  getByOrganizationId(context: TenantContext) {
    return super.getLatestByOrganizationId(context);
  }

  async getByServicePackageId(context: TenantContext, servicePackageId: string) {
    return this.records.find((record) => record.organizationId === context.organizationId && record.servicePackageId === servicePackageId) ?? null;
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
    return this.records.find((record) => record.organizationId === context.organizationId && record.scenarioId === scenarioId) ?? null;
  }
}

function createFakePrisma() {
  const serviceDefinitions = [
    {
      id: "service-helpdesk",
      organizationId: "org-test",
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
      organizationId: "org-test",
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
      id: "vendor-halopsa",
      organizationId: "org-test",
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
      organizationId: "org-test",
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
    serviceDefinition: { async findMany() { return serviceDefinitions; } },
    vendor: { async findMany() { return vendors; } },
    recommendationOutputLink: tx.recommendationOutputLink,
    stackRecommendation: tx.stackRecommendation,
    async $transaction<T>(callback: (transaction: typeof tx) => Promise<T>) {
      return callback(tx);
    }
  } as unknown as PrismaClient;
}

function createTestApp() {
  const workflowService = new LaunchOsWorkflowService({
    prisma: createFakePrisma(),
    founderProfiles: new MemoryFounderRepository(),
    businessModels: new MemoryBusinessRepository(),
    servicePackages: new MemoryServicePackageRepository(),
    pricingModels: new MemoryPricingRepository(),
    recommendationScenarios: new MemoryScenarioRepository(),
    recommendationResults: new MemoryRecommendationResultRepository()
  });

  return createApp({ workflowService });
}

test("full persisted workflow routes save and reload state before generating recommendation preview", async () => {
  const app = createTestApp();

  const founderResponse = await app.inject({
    method: "POST",
    url: "/founder",
    headers: { "x-organization-id": "org-test", "x-user-id": "user-test" },
    payload: {
      fullName: "Alex Founder",
      roleTitle: "Owner",
      priorExperienceYears: 6,
      targetGeo: "United States",
      serviceMotion: "managed-services",
      maturityLevel: "growing",
      salesConfidence: 7,
      technicalDepth: 8,
      preferredEngagementModel: "owner-operator"
    }
  });
  assert.equal(founderResponse.statusCode, 200);
  const founderId = founderResponse.json().data.id;

  const businessResponse = await app.inject({
    method: "POST",
    url: "/business-model",
    headers: { "x-organization-id": "org-test" },
    payload: {
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
    }
  });
  assert.equal(businessResponse.statusCode, 200);

  const servicePackageResponse = await app.inject({
    method: "POST",
    url: "/service-package",
    headers: { "x-organization-id": "org-test" },
    payload: {
      name: "Secure Care",
      marketPosition: "best",
      description: "Security-led package",
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
    }
  });
  assert.equal(servicePackageResponse.statusCode, 200);
  const servicePackageId = servicePackageResponse.json().data.id;

  const pricingResponse = await app.inject({
    method: "POST",
    url: "/pricing",
    headers: { "x-organization-id": "org-test" },
    payload: {
      servicePackageId,
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
    }
  });
  assert.equal(pricingResponse.statusCode, 200);

  const workflowStateResponse = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers: { "x-organization-id": "org-test", "x-user-id": "user-test" }
  });
  assert.equal(workflowStateResponse.statusCode, 200);
  const workflowState = workflowStateResponse.json();
  assert.equal(workflowState.ok, true);
  assert.equal(workflowState.data.founderProfile.id, founderId);
  assert.equal(workflowState.data.businessModel.name, "Healthcare MSSP");
  assert.equal(workflowState.data.servicePackage.items.length, 2);

  const recommendationResponse = await app.inject({
    method: "GET",
    url: "/recommendation/preview",
    headers: { "x-organization-id": "org-test", "x-user-id": "user-test" }
  });
  assert.equal(recommendationResponse.statusCode, 200);
  const recommendation = recommendationResponse.json();
  assert.equal(recommendation.ok, true);
  assert.equal(recommendation.data.result.missingInformation.hasBlockingGaps, false);
  assert.ok(recommendation.data.result.topActionItems.length > 0);

  const reloadedStateResponse = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers: { "x-organization-id": "org-test", "x-user-id": "user-test" }
  });
  const reloadedState = reloadedStateResponse.json();
  assert.equal(reloadedState.ok, true);
  assert.ok(reloadedState.data.latestRecommendation.summary.length > 0);

  await app.close();
});
