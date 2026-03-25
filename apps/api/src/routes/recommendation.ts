import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ok } from "../lib/api-response";
import { workflowService as defaultWorkflowService } from "../services/workflow-service";
import {
  getAuthenticatedTenantContext,
  tenantContextResolver as defaultTenantContextResolver,
  type TenantContextResolver
} from "../services/tenant-context";
import { recommendationPreviewQuerySchema } from "../schemas/launch-os";

interface RecommendationRouteOptions extends FastifyPluginOptions {
  workflowService?: typeof defaultWorkflowService;
  tenantContextResolver?: TenantContextResolver;
}

export async function registerRecommendationRoutes(app: FastifyInstance, options: RecommendationRouteOptions) {
  const workflowService = options.workflowService ?? defaultWorkflowService;
  const tenantContextResolver = options.tenantContextResolver ?? defaultTenantContextResolver;

  app.addHook("preHandler", async (request) => {
    request.authenticatedTenantContext = await tenantContextResolver.requireAuthenticatedTenantContext(request);
  });

  app.get("/preview", async (request) => {
    recommendationPreviewQuerySchema.parse(request.query);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.generateRecommendationPreview(tenant));
  });
}
