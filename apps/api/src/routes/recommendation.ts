import type { FastifyInstance } from "fastify";
import { buildRecommendationPreview } from "../modules/recommendation-preview";
import { recommendationPreviewQuerySchema } from "../schemas/launch-os";

export async function registerRecommendationRoutes(app: FastifyInstance) {
  app.get("/preview", async (request) => {
    const query = recommendationPreviewQuerySchema.parse(request.query);
    return { data: buildRecommendationPreview(query.organizationId) };
  });
}
