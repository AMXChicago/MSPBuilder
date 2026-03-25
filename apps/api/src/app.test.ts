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
import { issueUserSession } from "@launch-os/database";
import type { PrismaClient } from "@prisma/client";
import { createApp } from "./app";
import { TenantContextResolver } from "./services/tenant-context";
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
  const users = [
    { id: "user-a", email: "owner@orga.test", fullName: "Org A Owner" },
    { id: "user-b", email: "owner@orgb.test", fullName: "Org B Owner" }
  ];

  const organizations = [
    { id: "org-a", name: "Org A" },
    { id: "org-b", name: "Org B" }
  ];

  const memberships = [
    { organizationId: "org-a", userId: "user-a", role: "OWNER" as const },
    { organizationId: "org-b", userId: "user-b", role: "OWNER" as const }
  ];

  const sessions: Array<{
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  const serviceDefinitions = [
    {
      id: "service-helpdesk-a",
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
      id: "service-edr-a",
      organizationId: "org-a",
      name: "Endpoint Detection and Response",
      category: "SECURITY",
      description: "EDR",
      baseUnit: "device",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    },
    {
      id: "service-helpdesk-b",
      organizationId: "org-b",
      name: "Managed Help Desk",
      category: "HELPDESK",
      description: "Help desk",
      baseUnit: "user",
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    }
  ];

  const vendors = [
    {
      id: "vendor-halo-a",
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
      id: "vendor-huntress-a",
      organizationId: "org-a",
      name: "Huntress",
      category: "MDR",
      websiteUrl: null,
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: new Date("2026-03-01T00:00:00.000Z"),
      updatedAt: new Date("2026-03-01T00:00:00.000Z")
    },
    {
      id: "vendor-syncro-b",
      organizationId: "org-b",
      name: "Syncro",
      category: "PSA",
      websiteUrl: null,
      msspFriendly: false,
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
        return { id: `stack-rec-${Math.random()}` };
      }
    }
  };

  const fakePrisma = {
    userSession: {
      async create({ data }: { data: { userId: string; tokenHash: string; expiresAt: Date } }) {
        const record = {
          id: `session-${sessions.length + 1}`,
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
          revokedAt: null,
          lastUsedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        sessions.push(record);
        return record;
      },
      async findUnique({ where }: { where: { tokenHash?: string; id?: string } }) {
        const session = sessions.find((candidate) =>
          (where.tokenHash ? candidate.tokenHash === where.tokenHash : true) &&
          (where.id ? candidate.id === where.id : true)
        );

        if (!session) {
          return null;
        }

        const user = users.find((candidate) => candidate.id === session.userId);
        if (!user) {
          return null;
        }

        return {
          ...session,
          user
        };
      },
      async update({ where, data }: { where: { id: string }; data: { lastUsedAt?: Date } }) {
        const index = sessions.findIndex((candidate) => candidate.id === where.id);
        sessions[index] = {
          ...sessions[index],
          ...data,
          updatedAt: new Date()
        };
        const user = users.find((candidate) => candidate.id === sessions[index].userId);
        return {
          ...sessions[index],
          user: user!
        };
      }
    },
    organizationMember: {
      async findUnique({ where }: { where: { organizationId_userId: { organizationId: string; userId: string } } }) {
        const membership = memberships.find(
          (candidate) =>
            candidate.organizationId === where.organizationId_userId.organizationId &&
            candidate.userId === where.organizationId_userId.userId
        );

        if (!membership) {
          return null;
        }

        return {
          ...membership,
          organization: organizations.find((candidate) => candidate.id === membership.organizationId)!,
          user: users.find((candidate) => candidate.id === membership.userId)!
        };
      }
    },
    serviceDefinition: {
      async findMany({ where }: { where: { organizationId: string } }) {
        return serviceDefinitions.filter((record) => record.organizationId === where.organizationId);
      }
    },
    vendor: {
      async findMany({ where }: { where: { organizationId: string } }) {
        return vendors.filter((record) => record.organizationId === where.organizationId);
      }
    },
    recommendationOutputLink: tx.recommendationOutputLink,
    stackRecommendation: tx.stackRecommendation,
    async $transaction<T>(callback: (transaction: typeof tx) => Promise<T>) {
      return callback(tx);
    }
  } as unknown as PrismaClient;

  return {
    prisma: fakePrisma,
    users,
    organizations,
    memberships,
    sessions
  };
}

async function createHarness() {
  const { prisma } = createFakePrisma();
  const workflowService = new LaunchOsWorkflowService({
    prisma,
    founderProfiles: new MemoryFounderRepository(),
    businessModels: new MemoryBusinessRepository(),
    servicePackages: new MemoryServicePackageRepository(),
    pricingModels: new MemoryPricingRepository(),
    recommendationScenarios: new MemoryScenarioRepository(),
    recommendationResults: new MemoryRecommendationResultRepository()
  });
  const tenantContextResolver = new TenantContextResolver({
    prisma,
    allowDevelopmentFallback: false
  });

  const orgASession = await issueUserSession(prisma, { userId: "user-a", ttlHours: 24 });
  const orgBSession = await issueUserSession(prisma, { userId: "user-b", ttlHours: 24 });

  return {
    app: createApp({ workflowService, tenantContextResolver }),
    headersFor(organizationId: string, token: string) {
      return {
        authorization: `Bearer ${token}`,
        "x-organization-id": organizationId
      };
    },
    orgAToken: orgASession.token,
    orgBToken: orgBSession.token
  };
}

async function saveMinimalWorkflow(app: Awaited<ReturnType<typeof createHarness>>["app"], headers: Record<string, string>) {
  const founderResponse = await app.inject({
    method: "POST",
    url: "/founder",
    headers,
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

  const businessResponse = await app.inject({
    method: "POST",
    url: "/business-model",
    headers,
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
    headers,
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
          serviceDefinitionId: headers["x-organization-id"] === "org-a" ? "service-helpdesk-a" : "service-helpdesk-b",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "priority",
          supportHours: "extended-hours",
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 0
        }
      ]
    }
  });
  assert.equal(servicePackageResponse.statusCode, 200);
  const servicePackageId = servicePackageResponse.json().data.id;

  const pricingResponse = await app.inject({
    method: "POST",
    url: "/pricing",
    headers,
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
}

test("workflow routes reject unauthenticated access", async () => {
  const { app } = await createHarness();

  const response = await app.inject({
    method: "GET",
    url: "/workflow/state"
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, "authentication_required");
  await app.close();
});

test("workflow routes allow authenticated tenant-scoped save and retrieval", async () => {
  const { app, headersFor, orgAToken } = await createHarness();
  const headers = headersFor("org-a", orgAToken);

  await saveMinimalWorkflow(app, headers);

  const stateResponse = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers
  });

  assert.equal(stateResponse.statusCode, 200);
  const state = stateResponse.json();
  assert.equal(state.ok, true);
  assert.equal(state.data.tenant.organizationId, "org-a");
  assert.equal(state.data.tenant.userId, "user-a");
  assert.equal(state.data.founderProfile.fullName, "Alex Founder");
  await app.close();
});

test("workflow routes reject organization access when membership is missing", async () => {
  const { app, headersFor, orgAToken } = await createHarness();

  const response = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers: headersFor("org-b", orgAToken)
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.json().error.code, "organization_access_denied");
  await app.close();
});

test("workflow state stays isolated per tenant", async () => {
  const { app, headersFor, orgAToken, orgBToken } = await createHarness();
  const orgAHeaders = headersFor("org-a", orgAToken);
  const orgBHeaders = headersFor("org-b", orgBToken);

  const founderAResponse = await app.inject({
    method: "POST",
    url: "/founder",
    headers: orgAHeaders,
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
  assert.equal(founderAResponse.statusCode, 200);

  const founderBResponse = await app.inject({
    method: "POST",
    url: "/founder",
    headers: orgBHeaders,
    payload: {
      fullName: "Blair Founder",
      roleTitle: "Owner",
      priorExperienceYears: 4,
      targetGeo: "Canada",
      serviceMotion: "security-led",
      maturityLevel: "new",
      salesConfidence: 5,
      technicalDepth: 9,
      preferredEngagementModel: "owner-operator"
    }
  });
  assert.equal(founderBResponse.statusCode, 200);

  const stateA = await app.inject({ method: "GET", url: "/workflow/state", headers: orgAHeaders });
  const stateB = await app.inject({ method: "GET", url: "/workflow/state", headers: orgBHeaders });

  assert.equal(stateA.json().data.founderProfile.fullName, "Alex Founder");
  assert.equal(stateB.json().data.founderProfile.fullName, "Blair Founder");
  await app.close();
});

test("recommendation preview enforces membership and works for a valid authenticated tenant", async () => {
  const { app, headersFor, orgAToken, orgBToken } = await createHarness();
  const orgAHeaders = headersFor("org-a", orgAToken);

  await saveMinimalWorkflow(app, orgAHeaders);

  const previewResponse = await app.inject({
    method: "GET",
    url: "/recommendation/preview",
    headers: orgAHeaders
  });
  assert.equal(previewResponse.statusCode, 200);
  assert.equal(previewResponse.json().ok, true);
  assert.equal(previewResponse.json().data.context.businessModel.name, "Healthcare MSSP");

  const forbiddenPreview = await app.inject({
    method: "GET",
    url: "/recommendation/preview",
    headers: headersFor("org-a", orgBToken)
  });
  assert.equal(forbiddenPreview.statusCode, 403);
  assert.equal(forbiddenPreview.json().error.code, "organization_access_denied");

  await app.close();
});
