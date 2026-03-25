import type { FastifyInstance, FastifyRequest } from "fastify";
import { workflowService } from "../services/workflow-service";
import { resolveTenantContext } from "../services/tenant-context";
import {
  businessModelSchema,
  founderProfileSchema,
  pricingInputSchema,
  servicePackageSchema,
  workflowStateQuerySchema
} from "../schemas/launch-os";

export async function registerWorkflowRoutes(app: FastifyInstance) {
  async function saveFounder(request: FastifyRequest) {
    const payload = founderProfileSchema.parse(request.body);
    const tenant = await resolveTenantContext(request, payload);
    return { data: await workflowService.saveFounderProfile(tenant, payload) };
  }

  async function saveBusinessModel(request: FastifyRequest) {
    const payload = businessModelSchema.parse(request.body);
    const tenant = await resolveTenantContext(request, payload);
    return { data: await workflowService.saveBusinessModel(tenant, payload) };
  }

  async function saveServicePackage(request: FastifyRequest) {
    const payload = servicePackageSchema.parse(request.body);
    const tenant = await resolveTenantContext(request, payload);
    return { data: await workflowService.saveServicePackage(tenant, payload) };
  }

  async function savePricing(request: FastifyRequest) {
    const payload = pricingInputSchema.parse(request.body);
    const tenant = await resolveTenantContext(request, payload);
    return { data: await workflowService.savePricingModel(tenant, payload) };
  }

  app.get("/workflow/state", async (request) => {
    const query = workflowStateQuerySchema.parse(request.query);
    const tenant = await resolveTenantContext(request, query);
    return { data: await workflowService.getWorkflowState(tenant) };
  });

  app.post("/founder", saveFounder);
  app.put("/founder", saveFounder);
  app.post("/business-model", saveBusinessModel);
  app.put("/business-model", saveBusinessModel);
  app.post("/service-package", saveServicePackage);
  app.put("/service-package", saveServicePackage);
  app.post("/pricing", savePricing);
  app.put("/pricing", savePricing);
}
