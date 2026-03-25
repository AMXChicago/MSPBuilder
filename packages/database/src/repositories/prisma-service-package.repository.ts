import type { ServicePackageAggregate, ServicePackageRepository, TenantContext } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import {
  fromPrismaServicePackage,
  toPrismaDecimal,
  toPrismaLifecycleStatus,
  toPrismaPackageTier,
  toPrismaPriorityLevel,
  toPrismaSlaTier,
  toPrismaSupportHours
} from "../converters";

export class PrismaServicePackageRepository implements ServicePackageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.servicePackage.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      },
      include: {
        items: true
      }
    });

    return record ? fromPrismaServicePackage(record) : null;
  }

  async getByOrganizationId(context: TenantContext) {
    const record = await this.prisma.servicePackage.findFirst({
      where: {
        organizationId: context.organizationId
      },
      include: {
        items: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return record ? fromPrismaServicePackage(record) : null;
  }

  async save(context: TenantContext, model: ServicePackageAggregate) {
    const existing = await this.prisma.servicePackage.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Service package does not belong to the active organization.");
    }

    const record = await this.prisma.$transaction(async (tx) => {
      const packageData = {
        organizationId: context.organizationId,
        name: model.name,
        marketPosition: toPrismaPackageTier(model.marketPosition),
        description: model.description,
        targetPersona: model.targetPersona,
        includesSecurityBaseline: model.includesSecurityBaseline,
        defaultSlaTier: toPrismaSlaTier(model.defaultSlaTier),
        defaultSupportHours: toPrismaSupportHours(model.defaultSupportHours),
        defaultExclusions: model.defaultExclusions,
        status: toPrismaLifecycleStatus(model.status)
      };

      const savedPackage = existing
        ? await tx.servicePackage.update({ where: { id: model.id }, data: packageData })
        : await tx.servicePackage.create({ data: { id: model.id, ...packageData } });

      await tx.servicePackageItem.deleteMany({
        where: {
          organizationId: context.organizationId,
          servicePackageId: savedPackage.id
        }
      });

      if (model.items.length > 0) {
        await tx.servicePackageItem.createMany({
          data: model.items.map((item) => ({
            id: item.id,
            organizationId: context.organizationId,
            servicePackageId: savedPackage.id,
            serviceDefinitionId: item.serviceDefinitionId,
            isRequired: item.isRequired,
            includedQuantity: toPrismaDecimal(item.includedQuantity),
            slaTier: toPrismaSlaTier(item.slaTier),
            supportHours: toPrismaSupportHours(item.supportHours),
            exclusions: item.exclusions,
            priorityLevel: toPrismaPriorityLevel(item.priorityLevel),
            notes: item.notes,
            sortOrder: item.sortOrder
          }))
        });
      }

      return tx.servicePackage.findUniqueOrThrow({
        where: {
          id: savedPackage.id
        },
        include: {
          items: true
        }
      });
    });

    return fromPrismaServicePackage(record);
  }
}
