import type { FastifyRequest } from "fastify";
import type { TenantContext } from "@launch-os/domain";
import { ensureDevelopmentTenant, prisma } from "@launch-os/database";

interface TenantCarrier {
  organizationId?: string;
  userId?: string;
}

function readString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export async function resolveTenantContext(request: FastifyRequest, carrier?: TenantCarrier): Promise<TenantContext> {
  const organizationId =
    readString(request.headers["x-organization-id"]) ??
    readString((request.query as TenantCarrier | undefined)?.organizationId) ??
    readString(carrier?.organizationId);

  const userId =
    readString(request.headers["x-user-id"]) ??
    readString((request.query as TenantCarrier | undefined)?.userId) ??
    readString(carrier?.userId);

  if (organizationId) {
    return {
      organizationId,
      ...(userId ? { userId } : {})
    };
  }

  const bootstrap = await ensureDevelopmentTenant(prisma);
  return {
    organizationId: bootstrap.organizationId,
    ...(userId ?? bootstrap.userId ? { userId: userId ?? bootstrap.userId } : {})
  };
}
