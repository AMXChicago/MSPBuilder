import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health";
import { registerRecommendationRoutes } from "./routes/recommendation";
import { registerWorkflowRoutes } from "./routes/workflow";
import { tenantContextResolver as defaultTenantContextResolver, type TenantContextResolver } from "./services/tenant-context";
import { workflowService as defaultWorkflowService } from "./services/workflow-service";

export interface AppDependencies {
  workflowService?: typeof defaultWorkflowService;
  tenantContextResolver?: TenantContextResolver;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: true
  });

  const workflowService = dependencies.workflowService ?? defaultWorkflowService;
  const tenantContextResolver = dependencies.tenantContextResolver ?? defaultTenantContextResolver;

  app.register(cors, {
    origin: true
  });
  app.register(sensible);

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = typeof (error as { statusCode?: number }).statusCode === "number" ? (error as { statusCode: number }).statusCode : 500;
    const code = typeof (error as { code?: string }).code === "string"
      ? (error as { code: string }).code
      : statusCode >= 500
        ? "internal_error"
        : "request_error";

    reply.status(statusCode).send({
      ok: false,
      error: {
        message: error.message,
        code
      }
    });
  });

  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerWorkflowRoutes, { workflowService, tenantContextResolver });
  app.register(registerRecommendationRoutes, { prefix: "/recommendation", workflowService, tenantContextResolver });

  return app;
}
