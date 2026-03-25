import { z } from "zod";

export const founderProfileSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1),
  userId: z.string().min(1),
  fullName: z.string().min(1),
  roleTitle: z.string().min(1),
  priorExperienceYears: z.number().int().min(0),
  targetGeo: z.string().min(1),
  serviceMotion: z.enum(["managed-services", "project-led", "security-led", "hybrid"]),
  maturityLevel: z.enum(["new", "growing", "established"]),
  salesConfidence: z.number().int().min(1).max(10),
  technicalDepth: z.number().int().min(1).max(10),
  preferredEngagementModel: z.enum(["fractional-founder", "owner-operator", "team-led"]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const businessModelSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1),
  name: z.string().min(1),
  businessType: z.enum(["msp", "mssp", "hybrid", "co-managed"]),
  targetVerticals: z.array(z.string().min(1)).min(1),
  targetCompanySizes: z.array(z.string().min(1)).min(1),
  deliveryModel: z.enum(["remote", "onsite", "hybrid", "co-managed"]),
  complianceSensitivity: z.enum(["low", "moderate", "high", "regulated"]),
  budgetPositioning: z.enum(["budget", "mainstream", "premium", "enterprise"]),
  founderMaturity: z.enum(["new-operator", "experienced-builder", "scale-ready"]),
  revenueStrategy: z.enum(["recurring", "hybrid", "project-first"]),
  targetGrossMarginPercent: z.number().min(0).max(100),
  currencyCode: z.literal("USD").default("USD"),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const servicePackageItemSchema = z.object({
  id: z.string().optional(),
  serviceDefinitionId: z.string().min(1),
  requirement: z.enum(["required", "optional"]),
  includedQuantity: z.number().nonnegative(),
  quantityUnit: z.string().min(1),
  limitSummary: z.string().optional(),
  notes: z.string().optional(),
  sortOrder: z.number().int().min(0)
});

export const servicePackageSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1),
  name: z.string().min(1),
  marketPosition: z.enum(["good", "better", "best", "enterprise"]),
  description: z.string().min(1),
  targetPersona: z.string().min(1),
  includesSecurityBaseline: z.boolean(),
  slaTier: z.enum(["best-effort", "business-hours", "priority", "24x7"]),
  supportHours: z.enum(["business-hours", "extended-hours", "24x7"]),
  exclusions: z.array(z.string()),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  items: z.array(servicePackageItemSchema).min(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const pricingInputSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().min(1),
  servicePackageId: z.string().min(1),
  pricingUnit: z.enum(["per-user", "per-device", "per-location", "per-tenant", "flat-rate"]),
  currencyCode: z.literal("USD").default("USD"),
  monthlyBasePrice: z.number().nonnegative(),
  onboardingFee: z.number().nonnegative(),
  minimumQuantity: z.number().int().nonnegative(),
  includedQuantity: z.number().int().nonnegative(),
  overageUnitPrice: z.number().nonnegative(),
  billingFrequency: z.enum(["monthly", "quarterly", "annual"]),
  contractTermMonths: z.number().int().positive(),
  marginBehavior: z.enum(["passthrough", "markup", "blended"]),
  targetMarginPercent: z.number().min(0).max(100),
  floorMarginPercent: z.number().min(0).max(100),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const recommendationPreviewQuerySchema = z.object({
  organizationId: z.string().min(1)
});
