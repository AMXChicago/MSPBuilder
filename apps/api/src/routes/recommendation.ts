import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ok } from "../lib/api-response";
import { workflowService as defaultWorkflowService } from "../services/workflow-service";
import { resolveTenantContext } from "../services/tenant-context";
import { recommendationPreviewQuerySchema } from "../schemas/launch-os";

interface RecommendationRouteOptions extends FastifyPluginOptions {
  workflowService?: typeof defaultWorkflowService;
}

export async function registerRecommendationRoutes(app: FastifyInstance, options: RecommendationRouteOptions) {
  const workflowService = options.workflowService ?? defaultWorkflowService;

  app.get("/preview", async (request) => {
    const query = recommendationPreviewQuerySchema.parse(request.query);
    const tenant = await resolveTenantContext(request, query);
    return ok(await workflowService.generateRecommendationPreview(tenant));
  });
}
