import { createHash, randomBytes } from "node:crypto";
import type { AuthenticatedTenantContext, AuthenticatedUserContext, MembershipRole } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import { ensureDevelopmentTenant } from "./dev-bootstrap";

const DEFAULT_SESSION_TTL_HOURS = 24 * 14;

function toMembershipRole(role: "OWNER" | "ADMIN" | "OPERATOR" | "ADVISOR"): MembershipRole {
  return role.toLowerCase() as MembershipRole;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export interface IssuedUserSession {
  sessionId: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface DevelopmentSessionBootstrap {
  token: string;
  expiresAt: Date;
  context: AuthenticatedTenantContext;
}

export async function issueUserSession(
  prisma: PrismaClient,
  input: {
    userId: string;
    ttlHours?: number;
  }
): Promise<IssuedUserSession> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + (input.ttlHours ?? DEFAULT_SESSION_TTL_HOURS) * 60 * 60 * 1000);

  const session = await prisma.userSession.create({
    data: {
      userId: input.userId,
      tokenHash: hashSessionToken(token),
      expiresAt
    }
  });

  return {
    sessionId: session.id,
    token,
    userId: input.userId,
    expiresAt
  };
}

export interface AuthenticatedSessionRecord {
  sessionId: string;
  user: AuthenticatedUserContext;
  expiresAt: Date;
}

export async function authenticateSessionToken(prisma: PrismaClient, token: string): Promise<AuthenticatedSessionRecord | null> {
  const session = await prisma.userSession.findUnique({
    where: {
      tokenHash: hashSessionToken(token)
    },
    include: {
      user: true
    }
  });

  if (!session) {
    return null;
  }

  if (session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  await prisma.userSession.update({
    where: {
      id: session.id
    },
    data: {
      lastUsedAt: new Date()
    }
  });

  return {
    sessionId: session.id,
    expiresAt: session.expiresAt,
    user: {
      userId: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName
    }
  };
}

export async function resolveMembership(prisma: PrismaClient, input: { userId: string; organizationId: string }) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId
      }
    },
    include: {
      organization: true,
      user: true
    }
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    role: toMembershipRole(membership.role),
    organizationName: membership.organization.name,
    user: {
      userId: membership.user.id,
      email: membership.user.email,
      fullName: membership.user.fullName
    }
  };
}

export async function resolveAuthenticatedTenantContext(
  prisma: PrismaClient,
  input: {
    token: string;
    organizationId: string;
  }
): Promise<AuthenticatedTenantContext | null> {
  const session = await authenticateSessionToken(prisma, input.token);

  if (!session) {
    return null;
  }

  const membership = await resolveMembership(prisma, {
    userId: session.user.userId,
    organizationId: input.organizationId
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    userId: membership.user.userId,
    membershipRole: membership.role,
    authenticationSource: "session",
    authenticatedUser: membership.user
  };
}

export async function resolveDevelopmentTenantContext(prisma: PrismaClient): Promise<AuthenticatedTenantContext> {
  const bootstrap = await ensureDevelopmentTenant(prisma);

  return {
    organizationId: bootstrap.organizationId,
    userId: bootstrap.userId,
    membershipRole: "owner",
    authenticationSource: "development-bootstrap",
    authenticatedUser: {
      userId: bootstrap.userId,
      email: bootstrap.userEmail,
      fullName: bootstrap.userFullName
    }
  };
}

export async function issueDevelopmentSession(prisma: PrismaClient): Promise<DevelopmentSessionBootstrap> {
  const context = await resolveDevelopmentTenantContext(prisma);
  const session = await issueUserSession(prisma, {
    userId: context.userId,
    ttlHours: 24
  });

  return {
    token: session.token,
    expiresAt: session.expiresAt,
    context
  };
}
