import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaClient } from "@prisma/client";
import { PrismaFounderProfileRepository, PrismaRecommendationResultRepository } from "../index";

function createFounderRecord(id: string, organizationId: string, userId: string, updatedAt: Date) {
  return {
    id,
    organizationId,
    userId,
    fullName: `Founder ${id}`,
    roleTitle: "Owner",
    priorExperienceYears: 5,
    targetGeo: "United States",
    serviceMotion: "managed-services",
    maturityLevel: "growing",
    salesConfidence: 7,
    technicalDepth: 8,
    preferredEngagementModel: "owner-operator",
    createdAt: updatedAt,
    updatedAt
  };
}

test("PrismaFounderProfileRepository scopes reads and writes by organization", async () => {
  const founderProfiles = [
    createFounderRecord("founder-a", "org-a", "user-a", new Date("2026-03-01T00:00:00.000Z")),
    createFounderRecord("founder-b", "org-b", "user-b", new Date("2026-03-02T00:00:00.000Z"))
  ];

  const fakePrisma = {
    founderProfile: {
      async findFirst({ where, orderBy }: { where: Record<string, string>; orderBy?: { updatedAt: "desc" } }) {
        const matches = founderProfiles.filter((record) => {
          if (where.id && record.id !== where.id) {
            return false;
          }
          if (where.organizationId) {
            return record.organizationId === where.organizationId;
          }
          return true;
        });

        if (orderBy?.updatedAt === "desc") {
          return matches.sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())[0] ?? null;
        }

        return matches[0] ?? null;
      },
      async update({ where, data }: { where: { id: string }; data: Partial<typeof founderProfiles[number]> }) {
        const index = founderProfiles.findIndex((record) => record.id === where.id);
        founderProfiles[index] = { ...founderProfiles[index], ...data, updatedAt: new Date("2026-03-03T00:00:00.000Z") };
        return founderProfiles[index];
      },
      async create({ data }: { data: typeof founderProfiles[number] }) {
        founderProfiles.push(data);
        return data;
      }
    }
  } as unknown as PrismaClient;

  const repository = new PrismaFounderProfileRepository(fakePrisma);
  const context = { organizationId: "org-a", userId: "user-a" };

  const latest = await repository.getByOrganizationId(context);
  assert.equal(latest?.organizationId, "org-a");
  assert.equal(latest?.id, "founder-a");

  const crossTenant = await repository.getById(context, "founder-b");
  assert.equal(crossTenant, null);

  const saved = await repository.save(context, {
    id: "founder-a",
    organizationId: "org-a",
    userId: "user-a",
    fullName: "Founder Updated",
    roleTitle: "CEO",
    priorExperienceYears: 8,
    targetGeo: "United States",
    serviceMotion: "managed-services",
    maturityLevel: "established",
    salesConfidence: 9,
    technicalDepth: 9,
    preferredEngagementModel: "owner-operator",
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-03T00:00:00.000Z"
  });

  assert.equal(saved.organizationId, "org-a");
  assert.equal(saved.fullName, "Founder Updated");
});

test("PrismaRecommendationResultRepository retrieves results per tenant and scenario", async () => {
  const recommendationResults = [
    {
      id: "result-a",
      organizationId: "org-a",
      scenarioId: "scenario-a",
      overallScore: 82,
      readinessLevel: "high",
      riskLevel: "low",
      confidenceLevel: "high",
      confidenceScore: 0.84,
      summary: "Strong fit",
      resultSnapshot: { overallScore: 82 },
      detailedBreakdown: { pricing: {} },
      createdAt: new Date("2026-03-02T00:00:00.000Z"),
      updatedAt: new Date("2026-03-02T00:00:00.000Z")
    },
    {
      id: "result-b",
      organizationId: "org-b",
      scenarioId: "scenario-b",
      overallScore: 48,
      readinessLevel: "medium",
      riskLevel: "high",
      confidenceLevel: "medium",
      confidenceScore: 0.52,
      summary: "Needs work",
      resultSnapshot: { overallScore: 48 },
      detailedBreakdown: { pricing: {} },
      createdAt: new Date("2026-03-03T00:00:00.000Z"),
      updatedAt: new Date("2026-03-03T00:00:00.000Z")
    }
  ];

  const fakePrisma = {
    recommendationResultRecord: {
      async findFirst({ where, orderBy }: { where: Record<string, string>; orderBy?: { createdAt: "desc" } }) {
        const matches = recommendationResults.filter((record) => {
          if (where.id && record.id !== where.id) return false;
          if (where.scenarioId && record.scenarioId !== where.scenarioId) return false;
          if (where.organizationId) {
            return record.organizationId === where.organizationId;
          }
          return true;
        });

        if (orderBy?.createdAt === "desc") {
          return matches.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0] ?? null;
        }

        return matches[0] ?? null;
      },
      async update({ where, data }: { where: { id: string }; data: Partial<typeof recommendationResults[number]> }) {
        const index = recommendationResults.findIndex((record) => record.id === where.id);
        recommendationResults[index] = { ...recommendationResults[index], ...data };
        return recommendationResults[index];
      },
      async create({ data }: { data: typeof recommendationResults[number] }) {
        recommendationResults.push(data);
        return data;
      }
    }
  } as unknown as PrismaClient;

  const repository = new PrismaRecommendationResultRepository(fakePrisma);
  const context = { organizationId: "org-a" };

  const latest = await repository.getLatestByOrganizationId(context);
  assert.equal(latest?.id, "result-a");

  const scoped = await repository.getByScenarioId(context, "scenario-b");
  assert.equal(scoped, null);
});
