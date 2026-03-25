import type { TenantContext } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import { commonServiceDefinitions } from "./seed/service-definitions";
import { vendorMetadataSeeds } from "./seed/vendor-metadata";
import { toPrismaLifecycleStatus, toPrismaVendorCategory } from "./converters";

export interface DevelopmentTenantBootstrapResult extends TenantContext {
  organizationName: string;
  userEmail: string;
  userFullName: string;
}

const DEV_ORGANIZATION_SLUG = "launch-os-dev";
const DEV_ORGANIZATION_NAME = "Launch OS Dev";
const DEV_USER_EMAIL = "dev@launch-os.local";
const DEV_USER_NAME = "Launch OS Developer";

export async function ensureDevelopmentTenant(prisma: PrismaClient): Promise<DevelopmentTenantBootstrapResult> {
  const user = await prisma.user.upsert({
    where: {
      email: DEV_USER_EMAIL
    },
    update: {
      fullName: DEV_USER_NAME
    },
    create: {
      email: DEV_USER_EMAIL,
      fullName: DEV_USER_NAME
    }
  });

  const organization = await prisma.organization.upsert({
    where: {
      slug: DEV_ORGANIZATION_SLUG
    },
    update: {
      name: DEV_ORGANIZATION_NAME,
      status: "ACTIVE"
    },
    create: {
      name: DEV_ORGANIZATION_NAME,
      slug: DEV_ORGANIZATION_SLUG,
      status: "ACTIVE"
    }
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: user.id
      }
    },
    update: {
      role: "OWNER"
    },
    create: {
      organizationId: organization.id,
      userId: user.id,
      role: "OWNER"
    }
  });

  for (const definition of commonServiceDefinitions) {
    const existing = await prisma.serviceDefinition.findFirst({
      where: {
        organizationId: organization.id,
        name: definition.name
      }
    });

    if (!existing) {
      await prisma.serviceDefinition.create({
        data: {
          organizationId: organization.id,
          name: definition.name,
          category: definition.category.toUpperCase() as "HELPDESK" | "SECURITY" | "NETWORK" | "COMPLIANCE" | "CLOUD" | "VCIO",
          description: definition.description,
          baseUnit: definition.baseUnit,
          status: toPrismaLifecycleStatus("active")
        }
      });
    }
  }

  for (const vendor of vendorMetadataSeeds) {
    const existing = await prisma.vendor.findFirst({
      where: {
        organizationId: organization.id,
        name: vendor.name
      }
    });

    if (!existing) {
      await prisma.vendor.create({
        data: {
          organizationId: organization.id,
          name: vendor.name,
          category: toPrismaVendorCategory(vendor.category),
          msspFriendly: vendor.msspFriendly,
          supportsMultiTenant: vendor.supportsMultiTenant
        }
      });
    }
  }

  return {
    organizationId: organization.id,
    userId: user.id,
    organizationName: organization.name,
    userEmail: user.email,
    userFullName: user.fullName
  };
}

