import { commonServiceDefinitions, vendorMetadataSeeds } from "@launch-os/database";
import { recommendationRegistry } from "@launch-os/rules-engine";
import type { RecommendationScenarioInputSnapshot } from "@launch-os/domain";
import {
  getLatestBusinessModel,
  getLatestFounderProfile,
  getLatestPricingInput,
  getLatestServicePackage,
  saveScenario
} from "./launch-os-store";

export function buildRecommendationPreview(organizationId: string) {
  const founderProfile = getLatestFounderProfile(organizationId);
  const businessModel = getLatestBusinessModel(organizationId);
  const servicePackage = getLatestServicePackage(organizationId);
  const pricingInput = getLatestPricingInput(organizationId);
  const timestamp = new Date().toISOString();

  const context = {
    organizationId,
    founderProfile,
    businessModel,
    servicePackage,
    servicePackageItems: servicePackage?.items ?? [],
    pricingInput,
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

  const inputSnapshot: RecommendationScenarioInputSnapshot = {
    ...(founderProfile ? { founderProfileId: founderProfile.id, founderProfile } : {}),
    ...(businessModel ? { businessModelId: businessModel.id, businessModel } : {}),
    ...(servicePackage ? { servicePackageId: servicePackage.id, servicePackage } : {}),
    ...(pricingInput ? { pricingInputId: pricingInput.id, pricingInput } : {})
  };

  const scenario = saveScenario({
    organizationId,
    scenarioVersion: "0.1.0",
    status: "evaluated",
    inputSnapshot,
    ...(founderProfile ? { founderProfileId: founderProfile.id } : {}),
    ...(businessModel ? { businessModelId: businessModel.id } : {}),
    ...(servicePackage ? { servicePackageId: servicePackage.id } : {}),
    ...(pricingInput ? { pricingInputId: pricingInput.id } : {})
  });

  const outputs = [
    ...recommendationRegistry.pricingReadiness.run(context),
    ...recommendationRegistry.packageCompleteness.run(context),
    ...recommendationRegistry.stackFit.run(context),
    ...recommendationRegistry.securityBaseline.run(context)
  ];

  return {
    scenario,
    context: {
      ...context,
      serviceDefinitionsReference: commonServiceDefinitions
    },
    outputs
  };
}
