import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { ok } from "../lib/api-response";
import { workflowService as defaultWorkflowService } from "../services/workflow-service";
import {
  getAuthenticatedTenantContext,
  tenantContextResolver as defaultTenantContextResolver,
  type TenantContextResolver
} from "../services/tenant-context";
import {
  businessModelSchema,
  founderProfileSchema,
  pricingInputSchema,
  servicePackageSchema,
  workflowStateQuerySchema
} from "../schemas/launch-os";

interface WorkflowRouteOptions extends FastifyPluginOptions {
  workflowService?: typeof defaultWorkflowService;
  tenantContextResolver?: TenantContextResolver;
}

export async function registerWorkflowRoutes(app: FastifyInstance, options: WorkflowRouteOptions) {
  const workflowService = options.workflowService ?? defaultWorkflowService;
  const tenantContextResolver = options.tenantContextResolver ?? defaultTenantContextResolver;

  app.addHook("preHandler", async (request) => {
    request.authenticatedTenantContext = await tenantContextResolver.requireAuthenticatedTenantContext(request);
  });

  async function saveFounder(request: FastifyRequest) {
    const payload = founderProfileSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveFounderProfile(tenant, payload));
  }

  async function saveBusinessModel(request: FastifyRequest) {
    const payload = businessModelSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveBusinessModel(tenant, payload));
  }

  async function saveServicePackage(request: FastifyRequest) {
    const payload = servicePackageSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveServicePackage(tenant, payload));
  }

  async function savePricing(request: FastifyRequest) {
    const payload = pricingInputSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.savePricingModel(tenant, payload));
  }

  app.get("/workflow/state", async (request) => {
    workflowStateQuerySchema.parse(request.query);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.getWorkflowState(tenant));
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
