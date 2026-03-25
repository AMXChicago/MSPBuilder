import type { PricingModel, PricingModelRepository, TenantContext } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import {
  fromPrismaPricingModel,
  toPrismaBillingFrequency,
  toPrismaDecimal,
  toPrismaPricingUnit
} from "../converters";

export class PrismaPricingModelRepository implements PricingModelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.pricingModel.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      }
    });

    return record ? fromPrismaPricingModel(record) : null;
  }

  async getByOrganizationId(context: TenantContext) {
    const record = await this.prisma.pricingModel.findFirst({
      where: {
        organizationId: context.organizationId
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return record ? fromPrismaPricingModel(record) : null;
  }

  async getByServicePackageId(context: TenantContext, servicePackageId: string) {
    const record = await this.prisma.pricingModel.findFirst({
      where: {
        organizationId: context.organizationId,
        servicePackageId
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return record ? fromPrismaPricingModel(record) : null;
  }

  async save(context: TenantContext, model: PricingModel) {
    const existing = await this.prisma.pricingModel.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Pricing model does not belong to the active organization.");
    }

    const data = {
      organizationId: context.organizationId,
      servicePackageId: model.servicePackageId,
      pricingUnit: toPrismaPricingUnit(model.pricingUnit),
      currencyCode: model.currencyCode,
      monthlyBasePrice: toPrismaDecimal(model.monthlyBasePrice),
      onboardingFee: toPrismaDecimal(model.onboardingFee),
      minimumQuantity: model.minimumQuantity,
      includedQuantity: model.includedQuantity,
      overageUnitPrice: toPrismaDecimal(model.overageUnitPrice),
      billingFrequency: toPrismaBillingFrequency(model.billingFrequency),
      contractTermMonths: model.contractTermMonths,
      passthroughCost: toPrismaDecimal(model.passthroughCost),
      markupPercentage: toPrismaDecimal(model.markupPercentage),
      effectiveMarginPercent: toPrismaDecimal(model.effectiveMarginPercent),
      targetMarginPercent: toPrismaDecimal(model.targetMarginPercent),
      floorMarginPercent: toPrismaDecimal(model.floorMarginPercent)
    };

    const record = existing
      ? await this.prisma.pricingModel.update({ where: { id: model.id }, data })
      : await this.prisma.pricingModel.create({ data: { id: model.id, ...data } });

    return fromPrismaPricingModel(record);
  }
}
