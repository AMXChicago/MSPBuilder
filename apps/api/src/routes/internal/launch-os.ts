import type { FastifyInstance } from "fastify";
import {
  upsertBusinessModel,
  upsertFounderProfile,
  upsertPricingInput,
  upsertServicePackage
} from "../../modules/launch-os-store";
import { buildRecommendationPreview } from "../../modules/recommendation-preview";
import {
  businessModelSchema,
  founderProfileSchema,
  pricingInputSchema,
  recommendationPreviewQuerySchema,
  servicePackageSchema
} from "../../schemas/launch-os";

export async function registerLaunchOsRoutes(app: FastifyInstance) {
  app.put("/founder-profile", async (request) => {
    const payload = founderProfileSchema.parse(request.body);
    return { data: upsertFounderProfile(payload) };
  });

  app.put("/business-model", async (request) => {
    const payload = businessModelSchema.parse(request.body);
    return { data: upsertBusinessModel(payload) };
  });

  app.put("/service-package", async (request) => {
    const payload = servicePackageSchema.parse(request.body);
    return { data: upsertServicePackage(payload) };
  });

  app.put("/pricing-input", async (request) => {
    const payload = pricingInputSchema.parse(request.body);
    return { data: upsertPricingInput(payload) };
  });

  app.get("/recommendation-context-preview", async (request) => {
    const query = recommendationPreviewQuerySchema.parse(request.query);
    return { data: buildRecommendationPreview(query.organizationId) };
  });
}
