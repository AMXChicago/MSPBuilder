import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health";
import { registerRecommendationRoutes } from "./routes/recommendation";
import { registerWorkflowRoutes } from "./routes/workflow";
import { workflowService as defaultWorkflowService } from "./services/workflow-service";

export interface AppDependencies {
  workflowService?: typeof defaultWorkflowService;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: true
  });

  const workflowService = dependencies.workflowService ?? defaultWorkflowService;

  app.register(cors, {
    origin: true
  });
  app.register(sensible);

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = typeof (error as { statusCode?: number }).statusCode === "number" ? (error as { statusCode: number }).statusCode : 500;
    const code = statusCode >= 500 ? "internal_error" : "request_error";
    reply.status(statusCode).send({
      ok: false,
      error: {
        message: error.message,
        code
      }
    });
  });

  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerWorkflowRoutes, { workflowService });
  app.register(registerRecommendationRoutes, { prefix: "/recommendation", workflowService });

  return app;
}
