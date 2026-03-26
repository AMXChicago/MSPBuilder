import type { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import { ok } from "../lib/api-response";
import { workflowService as defaultWorkflowService } from "../services/workflow-service";
import {
  getAuthenticatedTenantContext,
  tenantContextResolver as defaultTenantContextResolver,
  type TenantContextResolver
} from "../services/tenant-context";
import {
  businessModelSchema,
  founderProfileSchema,
  pricingInputSchema,
  servicePackageSchema,
  workflowStateQuerySchema
} from "../schemas/launch-os";

interface WorkflowRouteOptions extends FastifyPluginOptions {
  workflowService?: typeof defaultWorkflowService;
  tenantContextResolver?: TenantContextResolver;
}

export async function registerWorkflowRoutes(app: FastifyInstance, options: WorkflowRouteOptions) {
  const workflowService = options.workflowService ?? defaultWorkflowService;
  const tenantContextResolver = options.tenantContextResolver ?? defaultTenantContextResolver;

  app.addHook("preHandler", async (request) => {
    request.authenticatedTenantContext = await tenantContextResolver.requireAuthenticatedTenantContext(request);
  });

  async function saveFounder(request: FastifyRequest) {
    const payload = founderProfileSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveFounderProfile(tenant, {
      ...(payload.id ? { id: payload.id } : {}),
      fullName: payload.fullName,
      roleTitle: payload.roleTitle,
      priorExperienceYears: payload.priorExperienceYears,
      targetGeo: payload.targetGeo,
      serviceMotion: payload.serviceMotion,
      maturityLevel: payload.maturityLevel,
      salesConfidence: payload.salesConfidence,
      technicalDepth: payload.technicalDepth,
      preferredEngagementModel: payload.preferredEngagementModel
    }));
  }

  async function saveBusinessModel(request: FastifyRequest) {
    const payload = businessModelSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveBusinessModel(tenant, {
      ...(payload.id ? { id: payload.id } : {}),
      name: payload.name,
      businessType: payload.businessType,
      targetVerticals: payload.targetVerticals,
      targetCompanySizes: payload.targetCompanySizes,
      deliveryModel: payload.deliveryModel,
      complianceSensitivity: payload.complianceSensitivity,
      budgetPositioning: payload.budgetPositioning,
      founderMaturity: payload.founderMaturity,
      revenueStrategy: payload.revenueStrategy,
      targetGrossMarginPercent: payload.targetGrossMarginPercent,
      currencyCode: payload.currencyCode,
      status: payload.status
    }));
  }

  async function saveServicePackage(request: FastifyRequest) {
    const payload = servicePackageSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.saveServicePackage(tenant, {
      ...(payload.id ? { id: payload.id } : {}),
      name: payload.name,
      marketPosition: payload.marketPosition,
      description: payload.description,
      targetPersona: payload.targetPersona,
      includesSecurityBaseline: payload.includesSecurityBaseline,
      defaultSlaTier: payload.defaultSlaTier,
      defaultSupportHours: payload.defaultSupportHours,
      defaultExclusions: payload.defaultExclusions,
      status: payload.status,
      items: payload.items.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        serviceDefinitionId: item.serviceDefinitionId,
        isRequired: item.isRequired,
        includedQuantity: item.includedQuantity,
        slaTier: item.slaTier,
        supportHours: item.supportHours,
        exclusions: item.exclusions,
        priorityLevel: item.priorityLevel,
        ...(item.notes ? { notes: item.notes } : {}),
        sortOrder: item.sortOrder
      }))
    }));
  }

  async function savePricing(request: FastifyRequest) {
    const payload = pricingInputSchema.parse(request.body);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.savePricingModel(tenant, {
      ...(payload.id ? { id: payload.id } : {}),
      servicePackageId: payload.servicePackageId,
      pricingUnit: payload.pricingUnit,
      currencyCode: payload.currencyCode,
      monthlyBasePrice: payload.monthlyBasePrice,
      onboardingFee: payload.onboardingFee,
      minimumQuantity: payload.minimumQuantity,
      includedQuantity: payload.includedQuantity,
      overageUnitPrice: payload.overageUnitPrice,
      billingFrequency: payload.billingFrequency,
      contractTermMonths: payload.contractTermMonths,
      passthroughCost: payload.passthroughCost,
      markupPercentage: payload.markupPercentage,
      ...(payload.effectiveMarginPercent !== undefined ? { effectiveMarginPercent: payload.effectiveMarginPercent } : {}),
      targetMarginPercent: payload.targetMarginPercent,
      floorMarginPercent: payload.floorMarginPercent
    }));
  }

  app.get("/workflow/state", async (request) => {
    workflowStateQuerySchema.parse(request.query);
    const tenant = getAuthenticatedTenantContext(request);
    return ok(await workflowService.getWorkflowState(tenant));
  });

  app.post("/founder", saveFounder);
  app.put("/founder", saveFounder);
  app.post("/business-model", saveBusinessModel);
  app.put("/business-model", saveBusinessModel);
  app.post("/service-package", saveServicePackage);
  app.put("/service-package", saveServicePackage);
  app.post("/pricing", savePricing);
  app.put("/pricing", savePricing);
}
