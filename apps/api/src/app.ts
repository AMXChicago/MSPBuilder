import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import type { DatabasePrismaClient } from "@launch-os/database";
import { registerAuthRoutes } from "./routes/auth";
import { registerHealthRoutes } from "./routes/health";
import { registerRecommendationRoutes } from "./routes/recommendation";
import { registerWorkflowRoutes } from "./routes/workflow";
import { tenantContextResolver as defaultTenantContextResolver, type TenantContextResolver } from "./services/tenant-context";
import { workflowService as defaultWorkflowService } from "./services/workflow-service";

export interface AppDependencies {
  workflowService?: typeof defaultWorkflowService;
  tenantContextResolver?: TenantContextResolver;
  allowDevelopmentFallback?: boolean;
  prisma?: DatabasePrismaClient;
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = Fastify({
    logger: true
  });

  const workflowService = dependencies.workflowService ?? defaultWorkflowService;
  const tenantContextResolver = dependencies.tenantContextResolver ?? defaultTenantContextResolver;
  const allowDevelopmentFallback = dependencies.allowDevelopmentFallback ?? (process.env.NODE_ENV !== "production" && process.env.AUTH_ALLOW_DEV_FALLBACK === "true");

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
    const message = error instanceof Error ? error.message : "Unexpected error";

    reply.status(statusCode).send({
      ok: false,
      error: {
        message,
        code
      }
    });
  });

  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerAuthRoutes, {
    prefix: "/auth",
    allowDevelopmentFallback,
    ...(dependencies.prisma ? { prisma: dependencies.prisma } : {})
  });
  app.register(registerWorkflowRoutes, { workflowService, tenantContextResolver });
  app.register(registerRecommendationRoutes, { prefix: "/recommendation", workflowService, tenantContextResolver });

  return app;
}
