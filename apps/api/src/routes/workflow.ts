import type { FastifyInstance } from "fastify";
import {
  upsertBusinessModel,
  upsertFounderProfile,
  upsertPricingInput,
  upsertServicePackage
} from "../modules/launch-os-store";
import {
  businessModelSchema,
  founderProfileSchema,
  pricingInputSchema,
  servicePackageSchema
} from "../schemas/launch-os";

export async function registerWorkflowRoutes(app: FastifyInstance) {
  app.post("/founder", async (request) => {
    const payload = founderProfileSchema.parse(request.body);
    return { data: upsertFounderProfile(payload) };
  });

  app.post("/business-model", async (request) => {
    const payload = businessModelSchema.parse(request.body);
    return { data: upsertBusinessModel(payload) };
  });

  app.post("/service-package", async (request) => {
    const payload = servicePackageSchema.parse(request.body);
    return { data: upsertServicePackage(payload) };
  });

  app.post("/pricing", async (request) => {
    const payload = pricingInputSchema.parse(request.body);
    return { data: upsertPricingInput(payload) };
  });
}
