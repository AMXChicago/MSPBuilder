import type { FastifyInstance } from "fastify";
import { workflowService } from "../services/workflow-service";
import { resolveTenantContext } from "../services/tenant-context";
import { recommendationPreviewQuerySchema } from "../schemas/launch-os";

export async function registerRecommendationRoutes(app: FastifyInstance) {
  app.get("/preview", async (request) => {
    const query = recommendationPreviewQuerySchema.parse(request.query);
    const tenant = await resolveTenantContext(request, query);
    return { data: await workflowService.generateRecommendationPreview(tenant) };
  });
}
