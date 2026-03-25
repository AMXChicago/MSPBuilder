import type { AuthenticatedTenantContext } from "@launch-os/domain";
import {
  authenticateSessionToken,
  prisma,
  resolveDevelopmentTenantContext as resolveDevTenantContext,
  resolveMembership
} from "@launch-os/database";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";

export class AuthenticationRequiredError extends Error {
  readonly statusCode = 401;
  readonly code = "authentication_required";

  constructor(message = "Authentication is required for workflow access.") {
    super(message);
  }
}

export class OrganizationContextRequiredError extends Error {
  readonly statusCode = 400;
  readonly code = "organization_context_required";

  constructor(message = "An organization context is required for workflow access.") {
    super(message);
  }
}

export class OrganizationAccessDeniedError extends Error {
  readonly statusCode = 403;
  readonly code = "organization_access_denied";

  constructor(message = "The authenticated user does not belong to the requested organization.") {
    super(message);
  }
}

export interface TenantResolutionDependencies {
  prisma: PrismaClient;
  allowDevelopmentFallback?: boolean;
}

function readHeader(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readBearerToken(request: FastifyRequest) {
  const authorization = readHeader(request.headers.authorization);

  if (!authorization) {
    return undefined;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }

  return token;
}

function shouldUseDevelopmentFallback(request: FastifyRequest, allowDevelopmentFallback: boolean) {
  return allowDevelopmentFallback && readHeader(request.headers["x-dev-auth"]) === "true";
}

export class TenantContextResolver {
  constructor(private readonly deps: TenantResolutionDependencies) {}

  async requireAuthenticatedTenantContext(request: FastifyRequest): Promise<AuthenticatedTenantContext> {
    const token = readBearerToken(request);
    const organizationId = readHeader(request.headers["x-organization-id"]);

    if (token) {
      if (!organizationId) {
        throw new OrganizationContextRequiredError();
      }

      const session = await authenticateSessionToken(this.deps.prisma, token);
      if (!session) {
        throw new AuthenticationRequiredError("The provided session token is invalid, expired, or revoked.");
      }

      const membership = await resolveMembership(this.deps.prisma, {
        userId: session.user.userId,
        organizationId
      });

      if (!membership) {
        throw new OrganizationAccessDeniedError();
      }

      return {
        organizationId: membership.organizationId,
        userId: membership.user.userId,
        membershipRole: membership.role,
        authenticationSource: "session",
        authenticatedUser: membership.user
      };
    }

    if (shouldUseDevelopmentFallback(request, this.deps.allowDevelopmentFallback ?? false)) {
      return resolveDevTenantContext(this.deps.prisma);
    }

    throw new AuthenticationRequiredError();
  }
}

export const tenantContextResolver = new TenantContextResolver({
  prisma,
  allowDevelopmentFallback: process.env.NODE_ENV !== "production" && process.env.AUTH_ALLOW_DEV_FALLBACK === "true"
});

declare module "fastify" {
  interface FastifyRequest {
    authenticatedTenantContext?: AuthenticatedTenantContext;
  }
}

export async function requireTenantContext(request: FastifyRequest, _reply: FastifyReply) {
  request.authenticatedTenantContext = await tenantContextResolver.requireAuthenticatedTenantContext(request);
}

export function getAuthenticatedTenantContext(request: FastifyRequest): AuthenticatedTenantContext {
  if (!request.authenticatedTenantContext) {
    throw new AuthenticationRequiredError();
  }

  return request.authenticatedTenantContext;
}
