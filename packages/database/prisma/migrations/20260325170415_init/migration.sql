-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'ADVISOR');

-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('MSP', 'MSSP', 'HYBRID', 'CO_MANAGED');

-- CreateEnum
CREATE TYPE "DeliveryModel" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ComplianceSensitivity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BudgetPositioning" AS ENUM ('BUDGET', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "FounderMaturity" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('HELPDESK', 'SECURITY', 'NETWORK', 'COMPLIANCE', 'CLOUD', 'VCIO');

-- CreateEnum
CREATE TYPE "PackageTier" AS ENUM ('GOOD', 'BETTER', 'BEST', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SlaTier" AS ENUM ('BEST_EFFORT', 'STANDARD', 'PRIORITY', 'TWENTY_FOUR_SEVEN');

-- CreateEnum
CREATE TYPE "SupportHours" AS ENUM ('BUSINESS_HOURS', 'EXTENDED_HOURS', 'TWENTY_FOUR_SEVEN');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('LOW', 'STANDARD', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PricingUnit" AS ENUM ('USER', 'DEVICE', 'HYBRID');

-- CreateEnum
CREATE TYPE "BillingFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "VendorCategory" AS ENUM ('PSA', 'RMM', 'MDR', 'BACKUP', 'DOCUMENTATION', 'EMAIL_SECURITY', 'IDENTITY');

-- CreateEnum
CREATE TYPE "TemplateKind" AS ENUM ('CONTRACT', 'PROPOSAL', 'SOP', 'CHECKLIST', 'MARKETING');

-- CreateEnum
CREATE TYPE "BaselineCategory" AS ENUM ('IDENTITY', 'ENDPOINT', 'EMAIL', 'NETWORK', 'BACKUP', 'MONITORING');

-- CreateEnum
CREATE TYPE "KpiUnit" AS ENUM ('CURRENCY', 'PERCENT', 'COUNT', 'DAYS');

-- CreateEnum
CREATE TYPE "RecommendationFamily" AS ENUM ('PRICING_READINESS', 'PACKAGE_COMPLETENESS', 'STACK_FIT', 'SECURITY_BASELINE');

-- CreateEnum
CREATE TYPE "ScenarioStatus" AS ENUM ('DRAFT', 'EVALUATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "priorExperienceYears" INTEGER NOT NULL,
    "targetGeo" TEXT NOT NULL,
    "serviceMotion" TEXT NOT NULL,
    "maturityLevel" TEXT NOT NULL,
    "salesConfidence" INTEGER NOT NULL,
    "technicalDepth" INTEGER NOT NULL,
    "preferredEngagementModel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessModel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessType" "BusinessType" NOT NULL,
    "targetVerticals" TEXT[],
    "targetCompanySizes" TEXT[],
    "deliveryModel" "DeliveryModel" NOT NULL,
    "complianceSensitivity" "ComplianceSensitivity" NOT NULL,
    "budgetPositioning" "BudgetPositioning" NOT NULL,
    "founderMaturity" "FounderMaturity" NOT NULL,
    "revenueStrategy" TEXT NOT NULL,
    "targetGrossMarginPercent" DECIMAL(5,2) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceDefinition" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "baseUnit" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "marketPosition" "PackageTier" NOT NULL,
    "description" TEXT NOT NULL,
    "targetPersona" TEXT NOT NULL,
    "includesSecurityBaseline" BOOLEAN NOT NULL DEFAULT false,
    "defaultSlaTier" "SlaTier" NOT NULL,
    "defaultSupportHours" "SupportHours" NOT NULL,
    "defaultExclusions" TEXT[],
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePackageItem" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "servicePackageId" TEXT NOT NULL,
    "serviceDefinitionId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "includedQuantity" DECIMAL(10,2) NOT NULL,
    "slaTier" "SlaTier" NOT NULL,
    "supportHours" "SupportHours" NOT NULL,
    "exclusions" TEXT[],
    "priorityLevel" "PriorityLevel" NOT NULL DEFAULT 'STANDARD',
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePackageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingModel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "servicePackageId" TEXT NOT NULL,
    "pricingUnit" "PricingUnit" NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'USD',
    "monthlyBasePrice" DECIMAL(10,2) NOT NULL,
    "onboardingFee" DECIMAL(10,2) NOT NULL,
    "minimumQuantity" INTEGER NOT NULL,
    "includedQuantity" INTEGER NOT NULL,
    "overageUnitPrice" DECIMAL(10,2) NOT NULL,
    "billingFrequency" "BillingFrequency" NOT NULL,
    "contractTermMonths" INTEGER NOT NULL,
    "passthroughCost" DECIMAL(10,2) NOT NULL,
    "markupPercentage" DECIMAL(5,2) NOT NULL,
    "effectiveMarginPercent" DECIMAL(5,2),
    "targetMarginPercent" DECIMAL(5,2) NOT NULL,
    "floorMarginPercent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "VendorCategory" NOT NULL,
    "websiteUrl" TEXT,
    "msspFriendly" BOOLEAN NOT NULL DEFAULT false,
    "supportsMultiTenant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCostProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "serviceDefinitionId" TEXT,
    "costBasis" "PricingUnit" NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorCostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationScenario" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "founderProfileId" TEXT,
    "businessModelId" TEXT,
    "servicePackageId" TEXT,
    "pricingModelId" TEXT,
    "contextVersion" TEXT NOT NULL,
    "rulesVersion" TEXT NOT NULL,
    "status" "ScenarioStatus" NOT NULL DEFAULT 'DRAFT',
    "founderProfileSnapshot" JSONB,
    "businessModelSnapshot" JSONB NOT NULL,
    "servicePackageSnapshot" JSONB NOT NULL,
    "pricingModelSnapshot" JSONB NOT NULL,
    "constraintSnapshot" JSONB NOT NULL,
    "vendorSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationOutputLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "recommendationFamily" "RecommendationFamily" NOT NULL,
    "outputId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationOutputLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackRecommendation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "rationale" TEXT[],
    "confidenceScore" DECIMAL(4,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StackRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StackRecommendationVendor" (
    "stackRecommendationId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "StackRecommendationVendor_pkey" PRIMARY KEY ("stackRecommendationId","vendorId")
);

-- CreateTable
CREATE TABLE "RecommendationResultRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "readinessLevel" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "confidenceScore" DECIMAL(4,3) NOT NULL,
    "summary" TEXT NOT NULL,
    "resultSnapshot" JSONB NOT NULL,
    "detailedBreakdown" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationResultRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateAsset" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "TemplateKind" NOT NULL,
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklistStep" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "ownerRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklistStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopDocument" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceArea" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityBaseline" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "BaselineCategory" NOT NULL,
    "controlCode" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityBaseline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaunchCampaign" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaunchCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "metricCode" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(14,4) NOT NULL,
    "unit" "KpiUnit" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");

-- CreateIndex
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "FounderProfile_organizationId_updatedAt_idx" ON "FounderProfile"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "BusinessModel_organizationId_updatedAt_idx" ON "BusinessModel"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceDefinition_organizationId_name_key" ON "ServiceDefinition"("organizationId", "name");

-- CreateIndex
CREATE INDEX "ServicePackage_organizationId_updatedAt_idx" ON "ServicePackage"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServicePackageItem_servicePackageId_serviceDefinitionId_key" ON "ServicePackageItem"("servicePackageId", "serviceDefinitionId");

-- CreateIndex
CREATE INDEX "PricingModel_organizationId_updatedAt_idx" ON "PricingModel"("organizationId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_organizationId_name_key" ON "Vendor"("organizationId", "name");

-- CreateIndex
CREATE INDEX "RecommendationScenario_organizationId_createdAt_idx" ON "RecommendationScenario"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "RecommendationOutputLink_organizationId_scenarioId_recommen_idx" ON "RecommendationOutputLink"("organizationId", "scenarioId", "recommendationFamily");

-- CreateIndex
CREATE INDEX "StackRecommendation_organizationId_scenarioId_idx" ON "StackRecommendation"("organizationId", "scenarioId");

-- CreateIndex
CREATE INDEX "RecommendationResultRecord_organizationId_createdAt_idx" ON "RecommendationResultRecord"("organizationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationResultRecord_organizationId_scenarioId_key" ON "RecommendationResultRecord"("organizationId", "scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateAsset_organizationId_slug_version_key" ON "TemplateAsset"("organizationId", "slug", "version");

-- CreateIndex
CREATE INDEX "KpiRecord_organizationId_metricCode_periodStart_periodEnd_idx" ON "KpiRecord"("organizationId", "metricCode", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderProfile" ADD CONSTRAINT "FounderProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderProfile" ADD CONSTRAINT "FounderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessModel" ADD CONSTRAINT "BusinessModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceDefinition" ADD CONSTRAINT "ServiceDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackage" ADD CONSTRAINT "ServicePackage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePackageItem" ADD CONSTRAINT "ServicePackageItem_serviceDefinitionId_fkey" FOREIGN KEY ("serviceDefinitionId") REFERENCES "ServiceDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingModel" ADD CONSTRAINT "PricingModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PricingModel" ADD CONSTRAINT "PricingModel_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCostProfile" ADD CONSTRAINT "VendorCostProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCostProfile" ADD CONSTRAINT "VendorCostProfile_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCostProfile" ADD CONSTRAINT "VendorCostProfile_serviceDefinitionId_fkey" FOREIGN KEY ("serviceDefinitionId") REFERENCES "ServiceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScenario" ADD CONSTRAINT "RecommendationScenario_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScenario" ADD CONSTRAINT "RecommendationScenario_founderProfileId_fkey" FOREIGN KEY ("founderProfileId") REFERENCES "FounderProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScenario" ADD CONSTRAINT "RecommendationScenario_businessModelId_fkey" FOREIGN KEY ("businessModelId") REFERENCES "BusinessModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScenario" ADD CONSTRAINT "RecommendationScenario_servicePackageId_fkey" FOREIGN KEY ("servicePackageId") REFERENCES "ServicePackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScenario" ADD CONSTRAINT "RecommendationScenario_pricingModelId_fkey" FOREIGN KEY ("pricingModelId") REFERENCES "PricingModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationOutputLink" ADD CONSTRAINT "RecommendationOutputLink_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationOutputLink" ADD CONSTRAINT "RecommendationOutputLink_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RecommendationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackRecommendation" ADD CONSTRAINT "StackRecommendation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackRecommendation" ADD CONSTRAINT "StackRecommendation_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RecommendationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackRecommendationVendor" ADD CONSTRAINT "StackRecommendationVendor_stackRecommendationId_fkey" FOREIGN KEY ("stackRecommendationId") REFERENCES "StackRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StackRecommendationVendor" ADD CONSTRAINT "StackRecommendationVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationResultRecord" ADD CONSTRAINT "RecommendationResultRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationResultRecord" ADD CONSTRAINT "RecommendationResultRecord_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "RecommendationScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateAsset" ADD CONSTRAINT "TemplateAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklistStep" ADD CONSTRAINT "OnboardingChecklistStep_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklistStep" ADD CONSTRAINT "OnboardingChecklistStep_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SopDocument" ADD CONSTRAINT "SopDocument_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityBaseline" ADD CONSTRAINT "SecurityBaseline_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaunchCampaign" ADD CONSTRAINT "LaunchCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiRecord" ADD CONSTRAINT "KpiRecord_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
