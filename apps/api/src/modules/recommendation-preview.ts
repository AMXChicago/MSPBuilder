import { commonServiceDefinitions, vendorMetadataSeeds } from "@launch-os/database";
import { recommendationRegistry } from "@launch-os/rules-engine";
import {
  getLatestBusinessModel,
  getLatestFounderProfile,
  getLatestPricingInput,
  getLatestServicePackage,
  saveScenario
} from "./launch-os-store";

export function buildRecommendationPreview(organizationId: string) {
  const founderProfile = getLatestFounderProfile(organizationId);
  const businessModelRecord = getLatestBusinessModel(organizationId);
  const servicePackageRecord = getLatestServicePackage(organizationId);
  const pricingModelRecord = getLatestPricingInput(organizationId);
  const timestamp = new Date().toISOString();

  const businessModel = {
    name: businessModelRecord?.name ?? "Draft Business Model",
    businessType: businessModelRecord?.businessType ?? "msp",
    targetVerticals: businessModelRecord?.targetVerticals ?? [],
    targetCompanySizes: businessModelRecord?.targetCompanySizes ?? [],
    deliveryModel: businessModelRecord?.deliveryModel ?? "remote",
    complianceSensitivity: businessModelRecord?.complianceSensitivity ?? "low",
    budgetPositioning: businessModelRecord?.budgetPositioning ?? "standard",
    founderMaturity: businessModelRecord?.founderMaturity ?? "beginner",
    revenueStrategy: businessModelRecord?.revenueStrategy ?? "recurring",
    targetGrossMarginPercent: businessModelRecord?.targetGrossMarginPercent ?? 0,
    currencyCode: businessModelRecord?.currencyCode ?? "USD"
  };

  const servicePackage = {
    name: servicePackageRecord?.name ?? "Draft Package",
    marketPosition: servicePackageRecord?.marketPosition ?? "good",
    description: servicePackageRecord?.description ?? "",
    targetPersona: servicePackageRecord?.targetPersona ?? "",
    includesSecurityBaseline: servicePackageRecord?.includesSecurityBaseline ?? false,
    defaultSlaTier: servicePackageRecord?.defaultSlaTier ?? "standard",
    defaultSupportHours: servicePackageRecord?.defaultSupportHours ?? "business-hours",
    defaultExclusions: servicePackageRecord?.defaultExclusions ?? [],
    items: (servicePackageRecord?.items ?? []).map((item) => ({
      serviceDefinitionId: item.serviceDefinitionId,
      isRequired: item.isRequired ?? true,
      includedQuantity: item.includedQuantity,
      slaTier: item.slaTier ?? servicePackageRecord?.defaultSlaTier ?? "standard",
      supportHours: item.supportHours ?? servicePackageRecord?.defaultSupportHours ?? "business-hours",
      exclusions: item.exclusions ?? [],
      priorityLevel: item.priorityLevel ?? "standard",
      notes: item.notes,
      sortOrder: item.sortOrder
    }))
  };

  const pricingModel = {
    pricingUnit: pricingModelRecord?.pricingUnit ?? "user",
    currencyCode: pricingModelRecord?.currencyCode ?? "USD",
    monthlyBasePrice: pricingModelRecord?.monthlyBasePrice ?? 0,
    onboardingFee: pricingModelRecord?.onboardingFee ?? 0,
    minimumQuantity: pricingModelRecord?.minimumQuantity ?? 0,
    includedQuantity: pricingModelRecord?.includedQuantity ?? 0,
    overageUnitPrice: pricingModelRecord?.overageUnitPrice ?? 0,
    billingFrequency: pricingModelRecord?.billingFrequency ?? "monthly",
    contractTermMonths: pricingModelRecord?.contractTermMonths ?? 0,
    passthroughCost: pricingModelRecord?.passthroughCost ?? 0,
    markupPercentage: pricingModelRecord?.markupPercentage ?? 0,
    effectiveMarginPercent: pricingModelRecord?.effectiveMarginPercent,
    targetMarginPercent: pricingModelRecord?.targetMarginPercent ?? 0,
    floorMarginPercent: pricingModelRecord?.floorMarginPercent ?? 0
  };

  const constraints = {
    budgetPositioning: businessModel.budgetPositioning,
    founderMaturity: businessModel.founderMaturity,
    complianceSensitivity: businessModel.complianceSensitivity,
    deliveryModel: businessModel.deliveryModel
  };

  const context = {
    scenarioId: undefined,
    contextVersion: "1.0.0",
    rulesVersion: "1.0.0",
    founderProfile: founderProfile
      ? {
          fullName: founderProfile.fullName,
          roleTitle: founderProfile.roleTitle,
          priorExperienceYears: founderProfile.priorExperienceYears,
          targetGeo: founderProfile.targetGeo,
          serviceMotion: founderProfile.serviceMotion,
          maturityLevel: founderProfile.maturityLevel,
          salesConfidence: founderProfile.salesConfidence,
          technicalDepth: founderProfile.technicalDepth,
          preferredEngagementModel: founderProfile.preferredEngagementModel
        }
      : undefined,
    businessModel,
    servicePackage,
    pricingModel,
    constraints,
    vendors: vendorMetadataSeeds.map((vendor, index) => ({
      id: `vendor-${index + 1}`,
      organizationId,
      name: vendor.name,
      category: vendor.category,
      msspFriendly: vendor.msspFriendly,
      supportsMultiTenant: vendor.supportsMultiTenant,
      createdAt: timestamp,
      updatedAt: timestamp
    })),
    vendorCostProfiles: [],
    availableBaselines: [
      { category: "identity", code: "baseline.identity.mfa", label: "MFA for admin and end-user access" },
      { category: "endpoint", code: "baseline.endpoint.edr", label: "Managed endpoint detection and response" },
      { category: "backup", code: "baseline.backup.monitoring", label: "Backup monitoring and restore validation" }
    ],
    generatedAt: timestamp
  };

  const scenario = saveScenario({
    organizationId,
    contextVersion: context.contextVersion,
    rulesVersion: context.rulesVersion,
    status: "evaluated",
    ...(founderProfile
      ? {
          founderProfileId: founderProfile.id,
          founderProfileSnapshot: context.founderProfile
        }
      : {}),
    ...(businessModelRecord ? { businessModelId: businessModelRecord.id } : {}),
    ...(servicePackageRecord ? { servicePackageId: servicePackageRecord.id } : {}),
    ...(pricingModelRecord ? { pricingModelId: pricingModelRecord.id } : {}),
    businessModelSnapshot: businessModel,
    servicePackageSnapshot: servicePackage,
    pricingModelSnapshot: pricingModel,
    constraintSnapshot: constraints,
    vendorSnapshot: {
      serviceDefinitionsReference: commonServiceDefinitions,
      vendorMetadataSeeds
    }
  });

  const hydratedContext = {
    ...context,
    scenarioId: scenario.id
  };

  const outputs = [
    ...recommendationRegistry.pricingReadiness.run(hydratedContext),
    ...recommendationRegistry.packageCompleteness.run(hydratedContext),
    ...recommendationRegistry.stackFit.run(hydratedContext),
    ...recommendationRegistry.securityBaseline.run(hydratedContext)
  ];

  return {
    scenario,
    context: hydratedContext,
    outputs
  };
}
