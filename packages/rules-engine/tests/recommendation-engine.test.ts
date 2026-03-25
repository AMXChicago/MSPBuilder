import test from "node:test";
import assert from "node:assert/strict";
import type { RecommendationContext } from "../src/core/types";
import { recommendationRegistry } from "../src/registry/default-registry";

function createVendors() {
  const timestamp = "2026-03-24T00:00:00.000Z";
  return [
    {
      id: "vendor-halopsa",
      organizationId: "org-1",
      name: "HaloPSA",
      category: "psa",
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "vendor-huntress",
      organizationId: "org-1",
      name: "Huntress",
      category: "mdr",
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "vendor-m365",
      organizationId: "org-1",
      name: "Microsoft 365",
      category: "identity",
      msspFriendly: true,
      supportsMultiTenant: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ] as const;
}

function createBaselines() {
  return [
    { category: "identity", code: "baseline.identity.mfa", label: "MFA" },
    { category: "endpoint", code: "baseline.endpoint.edr", label: "EDR" },
    { category: "backup", code: "baseline.backup.monitoring", label: "Backup" },
    { category: "email", code: "baseline.email.protection", label: "Email Security" }
  ] as const;
}

function createContext(overrides: Partial<RecommendationContext>): RecommendationContext {
  return {
    contextVersion: "1.0.0",
    rulesVersion: "1.0.0",
    businessModel: {
      name: "Default Model",
      businessType: "msp",
      targetVerticals: ["General SMB"],
      targetCompanySizes: ["10-50 employees"],
      deliveryModel: "remote",
      complianceSensitivity: "low",
      budgetPositioning: "standard",
      founderMaturity: "intermediate",
      revenueStrategy: "recurring",
      targetGrossMarginPercent: 60,
      currencyCode: "USD"
    },
    servicePackage: {
      name: "Default Package",
      marketPosition: "better",
      description: "Core support package",
      targetPersona: "Operations leader",
      includesSecurityBaseline: false,
      defaultSlaTier: "standard",
      defaultSupportHours: "business-hours",
      defaultExclusions: [],
      items: [
        {
          serviceDefinitionId: "managed-helpdesk",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "standard",
          supportHours: "business-hours",
          exclusions: [],
          priorityLevel: "standard",
          sortOrder: 0
        }
      ]
    },
    pricingModel: {
      pricingUnit: "user",
      currencyCode: "USD",
      monthlyBasePrice: 125,
      onboardingFee: 1500,
      minimumQuantity: 10,
      includedQuantity: 10,
      overageUnitPrice: 12,
      billingFrequency: "monthly",
      contractTermMonths: 12,
      passthroughCost: 45,
      markupPercentage: 45,
      effectiveMarginPercent: 64,
      targetMarginPercent: 60,
      floorMarginPercent: 45
    },
    constraints: {
      budgetPositioning: "standard",
      founderMaturity: "intermediate",
      complianceSensitivity: "low",
      deliveryModel: "remote"
    },
    vendors: [...createVendors()],
    vendorCostProfiles: [],
    availableBaselines: [...createBaselines()],
    generatedAt: "2026-03-24T00:00:00.000Z",
    ...overrides
  };
}

test("solo low-budget MSP surfaces pricing and package guidance", () => {
  const context = createContext({
    businessModel: {
      name: "Solo MSP",
      businessType: "msp",
      targetVerticals: ["General SMB"],
      targetCompanySizes: ["5-25 employees"],
      deliveryModel: "remote",
      complianceSensitivity: "low",
      budgetPositioning: "budget",
      founderMaturity: "beginner",
      revenueStrategy: "recurring",
      targetGrossMarginPercent: 55,
      currencyCode: "USD"
    },
    pricingModel: {
      pricingUnit: "device",
      currencyCode: "USD",
      monthlyBasePrice: 35,
      onboardingFee: 300,
      minimumQuantity: 5,
      includedQuantity: 10,
      overageUnitPrice: 0,
      billingFrequency: "monthly",
      contractTermMonths: 1,
      passthroughCost: 28,
      markupPercentage: 12,
      effectiveMarginPercent: 20,
      targetMarginPercent: 55,
      floorMarginPercent: 35
    }
  });

  const pricing = recommendationRegistry.pricingReadiness.run(context)[0];
  const stack = recommendationRegistry.stackFit.run(context)[0];

  assert.equal(pricing.data.isReady, false);
  assert.ok(pricing.data.improvementNotes.length > 0 || pricing.data.riskFlags.length > 0);
  assert.ok(stack.data.suggestedVendorIds.includes("vendor-m365"));
});

test("healthcare-focused MSSP prioritizes security stack and critical baseline", () => {
  const context = createContext({
    businessModel: {
      name: "Healthcare MSSP",
      businessType: "mssp",
      targetVerticals: ["Healthcare Clinics"],
      targetCompanySizes: ["50-250 employees"],
      deliveryModel: "remote",
      complianceSensitivity: "high",
      budgetPositioning: "premium",
      founderMaturity: "advanced",
      revenueStrategy: "recurring",
      targetGrossMarginPercent: 68,
      currencyCode: "USD"
    },
    servicePackage: {
      name: "Managed Detection",
      marketPosition: "best",
      description: "24x7 endpoint and response coverage",
      targetPersona: "Security lead",
      includesSecurityBaseline: true,
      defaultSlaTier: "24x7",
      defaultSupportHours: "24x7",
      defaultExclusions: [],
      items: [
        {
          serviceDefinitionId: "managed-edr",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "24x7",
          supportHours: "24x7",
          exclusions: [],
          priorityLevel: "critical",
          sortOrder: 0
        },
        {
          serviceDefinitionId: "backup-monitoring",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "priority",
          supportHours: "24x7",
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 1
        }
      ]
    },
    pricingModel: {
      pricingUnit: "device",
      currencyCode: "USD",
      monthlyBasePrice: 180,
      onboardingFee: 4000,
      minimumQuantity: 50,
      includedQuantity: 50,
      overageUnitPrice: 18,
      billingFrequency: "annual",
      contractTermMonths: 24,
      passthroughCost: 62,
      markupPercentage: 58,
      effectiveMarginPercent: 65,
      targetMarginPercent: 62,
      floorMarginPercent: 48
    },
    constraints: {
      budgetPositioning: "premium",
      founderMaturity: "advanced",
      complianceSensitivity: "high",
      deliveryModel: "remote"
    }
  });

  const stack = recommendationRegistry.stackFit.run(context)[0];
  const baseline = recommendationRegistry.securityBaseline.run(context)[0];

  assert.equal(stack.data.suggestedVendorIds[0], "vendor-huntress");
  assert.equal(baseline.data.priorityLevel, "critical");
  assert.ok(baseline.data.suggestedBaselineCodes.includes("baseline.endpoint.edr"));
});

test("co-managed mid-market MSP detects missing helpdesk coherence", () => {
  const context = createContext({
    businessModel: {
      name: "Co-Managed Mid-Market",
      businessType: "co-managed",
      targetVerticals: ["Manufacturing"],
      targetCompanySizes: ["100-500 employees"],
      deliveryModel: "onsite",
      complianceSensitivity: "medium",
      budgetPositioning: "standard",
      founderMaturity: "intermediate",
      revenueStrategy: "hybrid",
      targetGrossMarginPercent: 58,
      currencyCode: "USD"
    },
    servicePackage: {
      name: "Co-Managed Ops",
      marketPosition: "better",
      description: "Shared responsibility operations package",
      targetPersona: "IT manager",
      includesSecurityBaseline: false,
      defaultSlaTier: "priority",
      defaultSupportHours: "business-hours",
      defaultExclusions: ["After-hours response"],
      items: [
        {
          serviceDefinitionId: "network-monitoring",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "priority",
          supportHours: "business-hours",
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 0
        }
      ]
    }
  });

  const packageOutput = recommendationRegistry.packageCompleteness.run(context)[0];

  assert.equal(packageOutput.data.isComplete, false);
  assert.ok(packageOutput.data.missingCapabilities.includes("helpdesk-coverage"));
});

test("premium security-first hybrid operator prefers security and identity stack blend", () => {
  const context = createContext({
    businessModel: {
      name: "Premium Hybrid Security",
      businessType: "hybrid",
      targetVerticals: ["Legal", "Professional Services"],
      targetCompanySizes: ["25-100 employees"],
      deliveryModel: "hybrid",
      complianceSensitivity: "medium",
      budgetPositioning: "premium",
      founderMaturity: "advanced",
      revenueStrategy: "recurring",
      targetGrossMarginPercent: 65,
      currencyCode: "USD"
    },
    servicePackage: {
      name: "Security First Complete",
      marketPosition: "best",
      description: "Helpdesk plus EDR and identity hardening",
      targetPersona: "Managing partner",
      includesSecurityBaseline: true,
      defaultSlaTier: "priority",
      defaultSupportHours: "extended-hours",
      defaultExclusions: [],
      items: [
        {
          serviceDefinitionId: "managed-helpdesk",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "priority",
          supportHours: "extended-hours",
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 0
        },
        {
          serviceDefinitionId: "managed-edr",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "priority",
          supportHours: "extended-hours",
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 1
        },
        {
          serviceDefinitionId: "m365-identity",
          isRequired: true,
          includedQuantity: 1,
          slaTier: "standard",
          supportHours: "business-hours",
          exclusions: [],
          priorityLevel: "standard",
          sortOrder: 2
        }
      ]
    },
    pricingModel: {
      pricingUnit: "hybrid",
      currencyCode: "USD",
      monthlyBasePrice: 220,
      onboardingFee: 3500,
      minimumQuantity: 25,
      includedQuantity: 25,
      overageUnitPrice: 14,
      billingFrequency: "monthly",
      contractTermMonths: 12,
      passthroughCost: 70,
      markupPercentage: 52,
      effectiveMarginPercent: 68,
      targetMarginPercent: 63,
      floorMarginPercent: 48
    },
    constraints: {
      budgetPositioning: "premium",
      founderMaturity: "advanced",
      complianceSensitivity: "medium",
      deliveryModel: "hybrid"
    }
  });

  const pricing = recommendationRegistry.pricingReadiness.run(context)[0];
  const stack = recommendationRegistry.stackFit.run(context)[0];

  assert.equal(pricing.data.isReady, true);
  assert.ok(stack.data.suggestedVendorIds.includes("vendor-huntress"));
  assert.ok(stack.data.suggestedVendorIds.includes("vendor-m365"));
});

