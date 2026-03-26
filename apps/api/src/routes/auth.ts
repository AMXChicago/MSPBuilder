import { issueDevelopmentSession, prisma as defaultPrisma, type DatabasePrismaClient } from "@launch-os/database";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { ok } from "../lib/api-response";

export interface AuthRouteOptions extends FastifyPluginOptions {
  allowDevelopmentFallback?: boolean;
  prisma?: DatabasePrismaClient;
}

function isDevAuthEnabled(allowDevelopmentFallback?: boolean) {
  return process.env.NODE_ENV !== "production" && allowDevelopmentFallback === true;
}

export async function registerAuthRoutes(app: FastifyInstance, options: AuthRouteOptions) {
  const prisma = options.prisma ?? defaultPrisma;

  app.get("/dev-session", async (_request, reply) => {
    if (!isDevAuthEnabled(options.allowDevelopmentFallback)) {
      return reply.status(404).send({
        ok: false,
        error: {
          message: "Not found",
          code: "not_found"
        }
      });
    }

    const bootstrap = await issueDevelopmentSession(prisma);

    return ok({
      token: bootstrap.token,
      expiresAt: bootstrap.expiresAt.toISOString(),
      tenant: {
        organizationId: bootstrap.context.organizationId,
        userId: bootstrap.context.userId,
        membershipRole: bootstrap.context.membershipRole,
        authenticationSource: bootstrap.context.authenticationSource,
        authenticatedUser: bootstrap.context.authenticatedUser
      }
    });
  });
}

