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
import { createApp } from "./app";
import { TenantContextResolver } from "./services/tenant-context";
import { LaunchOsWorkflowService } from "./services/workflow-service";

class MemoryRepository<T extends { id: string; organizationId: string }> {
  protected readonly records: T[] = [];

  async getById(context: TenantContext, id: string): Promise<T | null> {
    return this.records.find((record) => record.organizationId === context.organizationId && record.id === id) ?? null;
  }

  async save(context: TenantContext, model: T): Promise<T> {
    const index = this.records.findIndex((record) => record.id === model.id);
    const record = { ...model, organizationId: context.organizationId };

    if (index >= 0) {
      this.records[index] = record;
      return record;
    }

    this.records.push(record);
    return record;
  }

  async getLatestByOrganizationId(context: TenantContext): Promise<T | null> {
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

  async getByServicePackageId(context: TenantContext, servicePackageId: string): Promise<PricingModel | null> {
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

  async getByScenarioId(context: TenantContext, scenarioId: string): Promise<PersistedRecommendationResult | null> {
    return this.records.find((record) => record.organizationId === context.organizationId && record.scenarioId === scenarioId) ?? null;
  }
}

function createFakePrisma() {
  const users: Array<{ id: string; email: string; fullName: string }> = [
    { id: "user-a", email: "owner@orga.test", fullName: "Org A Owner" }
  ];
  const organizations: Array<{ id: string; slug: string; name: string; status: "ACTIVE" }> = [
    { id: "org-a", slug: "org-a", name: "Org A", status: "ACTIVE" }
  ];
  const memberships: Array<{ id: string; organizationId: string; userId: string; role: "OWNER" | "ADMIN" | "OPERATOR" | "ADVISOR" }> = [
    { id: "membership-a", organizationId: "org-a", userId: "user-a", role: "OWNER" }
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
  const serviceDefinitions: Array<{
    id: string;
    organizationId: string;
    name: string;
    category: string;
    description: string;
    baseUnit: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }> = [
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
    }
  ];
  const vendors: Array<{
    id: string;
    organizationId: string;
    name: string;
    category: string;
    websiteUrl: string | null;
    msspFriendly: boolean;
    supportsMultiTenant: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = [
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

  const fakePrisma = {
    user: {
      async upsert({ where, update, create }: { where: { email: string }; update: { fullName: string }; create: { email: string; fullName: string } }) {
        const existing = users.find((user) => user.email === where.email);
        if (existing) {
          existing.fullName = update.fullName;
          return existing;
        }

        const created = {
          id: `user-${users.length + 1}`,
          email: create.email,
          fullName: create.fullName
        };
        users.push(created);
        return created;
      }
    },
    organization: {
      async upsert({ where, update, create }: { where: { slug: string }; update: { name: string; status: "ACTIVE" }; create: { name: string; slug: string; status: "ACTIVE" } }) {
        const existing = organizations.find((organization) => organization.slug === where.slug);
        if (existing) {
          existing.name = update.name;
          existing.status = update.status;
          return existing;
        }

        const created = {
          id: `org-${organizations.length + 1}`,
          slug: create.slug,
          name: create.name,
          status: create.status
        };
        organizations.push(created);
        return created;
      }
    },
    organizationMember: {
      async upsert({ where, update, create }: { where: { organizationId_userId: { organizationId: string; userId: string } }; update: { role: "OWNER" | "ADMIN" | "OPERATOR" | "ADVISOR" }; create: { organizationId: string; userId: string; role: "OWNER" | "ADMIN" | "OPERATOR" | "ADVISOR" } }) {
        const existing = memberships.find((membership) => membership.organizationId === where.organizationId_userId.organizationId && membership.userId === where.organizationId_userId.userId);
        if (existing) {
          existing.role = update.role;
          return existing;
        }

        const created = {
          id: `membership-${memberships.length + 1}`,
          organizationId: create.organizationId,
          userId: create.userId,
          role: create.role
        };
        memberships.push(created);
        return created;
      },
      async findUnique({ where }: { where: { organizationId_userId: { organizationId: string; userId: string } } }) {
        const membership = memberships.find((candidate) => candidate.organizationId === where.organizationId_userId.organizationId && candidate.userId === where.organizationId_userId.userId);
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
        const session = sessions.find((candidate) => (!where.tokenHash || candidate.tokenHash === where.tokenHash) && (!where.id || candidate.id === where.id));
        if (!session) {
          return null;
        }

        return {
          ...session,
          user: users.find((candidate) => candidate.id === session.userId)!
        };
      },
      async update({ where, data }: { where: { id: string }; data: { lastUsedAt?: Date } }) {
        const existing = sessions.find((candidate) => candidate.id === where.id);
        if (!existing) {
          throw new Error(`Unknown session ${where.id}`);
        }

        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date()
        };
        const index = sessions.findIndex((candidate) => candidate.id === where.id);
        sessions[index] = updated;

        return {
          ...updated,
          user: users.find((candidate) => candidate.id === updated.userId)!
        };
      }
    },
    serviceDefinition: {
      async findFirst({ where }: { where: { organizationId: string; name: string } }) {
        return serviceDefinitions.find((candidate) => candidate.organizationId === where.organizationId && candidate.name === where.name) ?? null;
      },
      async findMany({ where }: { where: { organizationId: string } }) {
        return serviceDefinitions.filter((candidate) => candidate.organizationId === where.organizationId);
      },
      async create({ data }: { data: { organizationId: string; name: string; category: string; description: string; baseUnit: string; status: string } }) {
        const created = {
          id: `service-${serviceDefinitions.length + 1}`,
          organizationId: data.organizationId,
          name: data.name,
          category: data.category,
          description: data.description,
          baseUnit: data.baseUnit,
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        serviceDefinitions.push(created);
        return created;
      }
    },
    vendor: {
      async findFirst({ where }: { where: { organizationId: string; name: string } }) {
        return vendors.find((candidate) => candidate.organizationId === where.organizationId && candidate.name === where.name) ?? null;
      },
      async findMany({ where }: { where: { organizationId: string } }) {
        return vendors.filter((candidate) => candidate.organizationId === where.organizationId);
      },
      async create({ data }: { data: { organizationId: string; name: string; category: string; msspFriendly: boolean; supportsMultiTenant: boolean } }) {
        const created = {
          id: `vendor-${vendors.length + 1}`,
          organizationId: data.organizationId,
          name: data.name,
          category: data.category,
          websiteUrl: null,
          msspFriendly: data.msspFriendly,
          supportsMultiTenant: data.supportsMultiTenant,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        vendors.push(created);
        return created;
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
    sessions
  };
}

function createWorkflowService(prisma: PrismaClient) {
  return new LaunchOsWorkflowService({
    prisma,
    founderProfiles: new MemoryFounderRepository(),
    businessModels: new MemoryBusinessRepository(),
    servicePackages: new MemoryServicePackageRepository(),
    pricingModels: new MemoryPricingRepository(),
    recommendationScenarios: new MemoryScenarioRepository(),
    recommendationResults: new MemoryRecommendationResultRepository()
  });
}

function createAuthenticatedHeaders(token: string, organizationId = "org-a") {
  return {
    authorization: `Bearer ${token}`,
    "x-organization-id": organizationId
  };
}

async function saveMinimalWorkflow(app: ReturnType<typeof createApp>, headers: Record<string, string>) {
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
}

test("app registers health, workflow, and recommendation routes", async () => {
  const { prisma } = createFakePrisma();
  const workflowService = createWorkflowService(prisma);
  const app = createApp({
    prisma,
    workflowService,
    tenantContextResolver: new TenantContextResolver({ prisma, allowDevelopmentFallback: false }),
    allowDevelopmentFallback: false
  });

  const healthResponse = await app.inject({ method: "GET", url: "/health/" });
  assert.equal(healthResponse.statusCode, 200);

  const workflowResponse = await app.inject({ method: "GET", url: "/workflow/state" });
  assert.equal(workflowResponse.statusCode, 401);

  const recommendationResponse = await app.inject({ method: "GET", url: "/recommendation/preview" });
  assert.equal(recommendationResponse.statusCode, 401);

  await app.close();
});

test("dev auth bootstrap returns a usable session in development mode", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const { prisma, sessions } = createFakePrisma();
  const workflowService = createWorkflowService(prisma);
  const app = createApp({
    prisma,
    workflowService,
    tenantContextResolver: new TenantContextResolver({ prisma, allowDevelopmentFallback: true }),
    allowDevelopmentFallback: true
  });

  const devSessionResponse = await app.inject({ method: "GET", url: "/auth/dev-session" });
  const devSessionBody = devSessionResponse.json() as {
    ok: true;
    data: {
      token: string;
      tenant: AuthenticatedTenantContext;
    };
  };

  assert.equal(devSessionResponse.statusCode, 200);
  assert.equal(devSessionBody.ok, true);
  assert.equal(devSessionBody.data.tenant.organizationId, "org-a");
  assert.ok(typeof devSessionBody.data.token === "string");
  assert.equal(sessions.length, 1);

  const workflowResponse = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers: createAuthenticatedHeaders(devSessionBody.data.token)
  });
  assert.equal(workflowResponse.statusCode, 200);
  assert.equal(workflowResponse.json().data.tenant.organizationId, "org-a");

  await app.close();
  process.env.NODE_ENV = previousNodeEnv;
});

test("workflow state fetch works with valid dev auth context", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const { prisma } = createFakePrisma();
  const workflowService = createWorkflowService(prisma);
  const app = createApp({
    prisma,
    workflowService,
    tenantContextResolver: new TenantContextResolver({ prisma, allowDevelopmentFallback: true }),
    allowDevelopmentFallback: true
  });

  const devSessionResponse = await app.inject({ method: "GET", url: "/auth/dev-session" });
  const token = (devSessionResponse.json() as { data: { token: string } }).data.token;
  await saveMinimalWorkflow(app, createAuthenticatedHeaders(token));

  const stateResponse = await app.inject({
    method: "GET",
    url: "/workflow/state",
    headers: createAuthenticatedHeaders(token)
  });
  assert.equal(stateResponse.statusCode, 200);
  assert.equal(stateResponse.json().data.founderProfile.fullName, "Alex Founder");

  await app.close();
  process.env.NODE_ENV = previousNodeEnv;
});

test("production mode rejects missing auth and disables dev bootstrap", async () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const { prisma } = createFakePrisma();
  const workflowService = createWorkflowService(prisma);
  const app = createApp({
    prisma,
    workflowService,
    tenantContextResolver: new TenantContextResolver({ prisma, allowDevelopmentFallback: false }),
    allowDevelopmentFallback: false
  });

  const workflowResponse = await app.inject({ method: "GET", url: "/workflow/state" });
  assert.equal(workflowResponse.statusCode, 401);
  assert.equal(workflowResponse.json().error.code, "authentication_required");

  const devSessionResponse = await app.inject({ method: "GET", url: "/auth/dev-session" });
  assert.equal(devSessionResponse.statusCode, 404);

  await app.close();
  process.env.NODE_ENV = previousNodeEnv;
});
