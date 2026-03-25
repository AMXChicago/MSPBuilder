import type { BusinessModel, BusinessModelRepository, TenantContext } from "@launch-os/domain";
import type { PrismaClient } from "@prisma/client";
import {
  fromPrismaBusinessModel,
  toPrismaBudgetPositioning,
  toPrismaBusinessType,
  toPrismaComplianceSensitivity,
  toPrismaDecimal,
  toPrismaDeliveryModel,
  toPrismaFounderMaturity,
  toPrismaLifecycleStatus
} from "../converters";

export class PrismaBusinessModelRepository implements BusinessModelRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(context: TenantContext, id: string) {
    const record = await this.prisma.businessModel.findFirst({
      where: {
        id,
        organizationId: context.organizationId
      }
    });

    return record ? fromPrismaBusinessModel(record) : null;
  }

  async getByOrganizationId(context: TenantContext) {
    const record = await this.prisma.businessModel.findFirst({
      where: {
        organizationId: context.organizationId
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return record ? fromPrismaBusinessModel(record) : null;
  }

  async save(context: TenantContext, model: BusinessModel) {
    const existing = await this.prisma.businessModel.findFirst({
      where: {
        id: model.id
      }
    });

    if (existing && existing.organizationId !== context.organizationId) {
      throw new Error("Business model does not belong to the active organization.");
    }

    const data = {
      organizationId: context.organizationId,
      name: model.name,
      businessType: toPrismaBusinessType(model.businessType),
      targetVerticals: model.targetVerticals,
      targetCompanySizes: model.targetCompanySizes,
      deliveryModel: toPrismaDeliveryModel(model.deliveryModel),
      complianceSensitivity: toPrismaComplianceSensitivity(model.complianceSensitivity),
      budgetPositioning: toPrismaBudgetPositioning(model.budgetPositioning),
      founderMaturity: toPrismaFounderMaturity(model.founderMaturity),
      revenueStrategy: model.revenueStrategy,
      targetGrossMarginPercent: toPrismaDecimal(model.targetGrossMarginPercent),
      currencyCode: model.currencyCode,
      status: toPrismaLifecycleStatus(model.status)
    };

    const record = existing
      ? await this.prisma.businessModel.update({ where: { id: model.id }, data })
      : await this.prisma.businessModel.create({ data: { id: model.id, ...data } });

    return fromPrismaBusinessModel(record);
  }
}
