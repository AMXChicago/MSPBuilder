import type { RecommendationContext, RecommendationPolicy, StackFitOutput, VendorScoreBreakdown, StackRecommendationChoice, ExplanationItem } from "../core/types";
import {
  calculateEffectiveMarginPercent,
  clampConfidence,
  clampScore,
  detectVerticals,
  getVendorScoringProfile,
  inferPricingPosture,
  inferServiceCapabilities,
  isSecurityLedContext,
  normalizeText
} from "../core/scoring";

function scoreVendor(context: RecommendationContext, vendor: RecommendationContext["vendors"][number]): VendorScoreBreakdown {
  const profile = getVendorScoringProfile(vendor);
  const capabilities = inferServiceCapabilities(context.servicePackage.items);
  const verticals = detectVerticals(context.businessModel.targetVerticals);
  const pricingPosture = inferPricingPosture(context);
  const packageText = [
    context.servicePackage.name,
    context.servicePackage.description,
    context.servicePackage.targetPersona,
    ...context.servicePackage.items.map((item) => item.serviceDefinitionId)
  ]
    .join(" ")
    .toLowerCase();

  let categoryFit = 6;
  let msspFriendliness = vendor.msspFriendly ? 16 : 4;
  let multiTenantSupport = vendor.supportsMultiTenant ? 16 : 2;
  let complianceFit = 8;
  let packageAlignment = 6;
  let budgetAlignment = 8;
  let deliveryFit = 6;
  let pricingFit = 6;
  let founderFit = 6;
  const reasons: string[] = [];
  const tradeoffs: string[] = [];

  if ((context.businessModel.businessType === "msp" || context.businessModel.businessType === "co-managed") && ["psa", "rmm", "identity", "backup"].includes(vendor.category)) {
    categoryFit += 18;
    reasons.push("Category aligns with MSP operational delivery.");
  }

  if (isSecurityLedContext(context) && ["mdr", "identity", "backup", "email-security"].includes(vendor.category)) {
    categoryFit += 20;
    reasons.push("Category aligns with security-led delivery.");
  }

  if (vendor.msspFriendly && context.businessModel.businessType !== "msp") {
    msspFriendliness += 6;
    reasons.push("Vendor is MSSP-friendly for multi-client operations.");
  } else if (!vendor.msspFriendly && context.businessModel.businessType === "mssp") {
    tradeoffs.push("Vendor is less proven for MSSP operating models.");
  }

  if (vendor.supportsMultiTenant) {
    reasons.push("Vendor supports multi-tenant operations.");
  } else {
    tradeoffs.push("Vendor lacks strong multi-tenant posture.");
  }

  if (context.constraints.complianceSensitivity === "high") {
    complianceFit += profile.complianceStrength === "advanced" ? 20 : profile.complianceStrength === "strong" ? 12 : 2;
    reasons.push(`Compliance posture fit is ${profile.complianceStrength}.`);
  } else if (context.constraints.complianceSensitivity === "medium") {
    complianceFit += profile.complianceStrength === "advanced" ? 14 : profile.complianceStrength === "strong" ? 10 : 4;
  } else {
    complianceFit += profile.complianceStrength === "baseline" ? 8 : 10;
  }

  const verticalMatches = [
    verticals.healthcare && profile.verticalStrengths.includes("healthcare"),
    verticals.finance && profile.verticalStrengths.includes("finance"),
    verticals.legal && profile.verticalStrengths.includes("legal"),
    verticals.manufacturing && profile.verticalStrengths.includes("manufacturing"),
    verticals.professionalServices && profile.verticalStrengths.includes("professional-services")
  ].filter(Boolean).length;
  complianceFit += verticalMatches * 4;
  if (verticalMatches > 0) {
    reasons.push("Vendor has relevant target-vertical alignment.");
  }

  const keywordMatches = profile.packageKeywords.filter((keyword) => packageText.includes(normalizeText(keyword))).length;
  packageAlignment += Math.min(18, keywordMatches * 5);
  if (keywordMatches > 0) {
    reasons.push(`Package language matches ${keywordMatches} vendor-fit cue(s).`);
  }
  if (profile.preferredBusinessTypes.includes(context.businessModel.businessType)) {
    packageAlignment += 6;
  }
  if (capabilities.helpdesk && vendor.category === "psa") packageAlignment += 7;
  if (capabilities.endpoint && ["mdr", "rmm"].includes(vendor.category)) packageAlignment += 7;
  if (capabilities.backup && vendor.category === "backup") packageAlignment += 7;
  if (capabilities.identity && ["identity", "email-security"].includes(vendor.category)) packageAlignment += 6;

  if (context.constraints.budgetPositioning === profile.budgetFit) {
    budgetAlignment += 14;
    reasons.push("Budget tier aligns with offer positioning.");
  } else if (context.constraints.budgetPositioning === "budget" && profile.budgetFit === "premium") {
    budgetAlignment -= 3;
    tradeoffs.push("Vendor may strain a budget-positioned offer.");
  } else if (context.constraints.budgetPositioning === "premium" && profile.budgetFit === "budget") {
    budgetAlignment += 3;
    tradeoffs.push("Lower-cost vendor may need stronger service framing in a premium offer.");
  }

  if (profile.preferredDeliveryModels.includes(context.businessModel.deliveryModel)) {
    deliveryFit += 10;
    reasons.push(`Delivery model fit supports ${context.businessModel.deliveryModel} operations.`);
  } else if (context.businessModel.deliveryModel === "onsite") {
    tradeoffs.push("Vendor is more optimized for remote-first delivery than onsite-heavy operations.");
  }

  if (profile.preferredPricingUnits.includes(context.pricingModel.pricingUnit)) {
    pricingFit += 10;
  }
  if (pricingPosture.isBudgetSensitive && profile.budgetFit === "budget") {
    pricingFit += 6;
    reasons.push("Commercial posture aligns with budget-sensitive pricing.");
  }
  if (pricingPosture.supportsPremiumPositioning && profile.budgetFit === "premium") {
    pricingFit += 6;
    reasons.push("Commercial posture supports premium tooling economics.");
  }
  if (pricingPosture.isAggressiveLowMargin && profile.budgetFit === "premium") {
    pricingFit -= 4;
    tradeoffs.push("Premium tooling may be hard to sustain at the current margin posture.");
  }

  if (profile.founderMaturityFit.includes(context.businessModel.founderMaturity)) {
    founderFit += 8;
  }
  if (context.businessModel.founderMaturity === "beginner" && profile.tradeoffs.some((item) => item.toLowerCase().includes("heavy") || item.toLowerCase().includes("discipline"))) {
    founderFit -= 3;
    tradeoffs.push("Operational depth may be demanding for a newer founder.");
  }

  tradeoffs.push(...profile.tradeoffs.slice(0, 2));

  const totalScore = clampScore(
    categoryFit +
      msspFriendliness +
      multiTenantSupport +
      complianceFit +
      packageAlignment +
      budgetAlignment +
      deliveryFit +
      pricingFit +
      founderFit
  );

  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    totalScore,
    categoryFit: clampScore(categoryFit),
    msspFriendliness: clampScore(msspFriendliness),
    multiTenantSupport: clampScore(multiTenantSupport),
    complianceFit: clampScore(complianceFit),
    packageAlignment: clampScore(packageAlignment),
    budgetAlignment: clampScore(budgetAlignment),
    deliveryFit: clampScore(deliveryFit),
    pricingFit: clampScore(pricingFit),
    founderFit: clampScore(founderFit),
    reasons: [...new Set(reasons)].slice(0, 6),
    tradeoffs: [...new Set(tradeoffs)].slice(0, 4)
  };
}

function buildTopChoices(scoreBreakdown: VendorScoreBreakdown[]): StackRecommendationChoice[] {
  return scoreBreakdown.slice(0, 3).map((item) => ({
    vendorId: item.vendorId,
    vendorName: item.vendorName,
    score: item.totalScore,
    summary: `${item.vendorName} is a strong fit for the current offer because it aligns with the operating model, package shape, and commercial posture.`,
    whyFit: item.reasons.slice(0, 3),
    tradeoffs: item.tradeoffs.slice(0, 2),
    recommendedFor: [
      item.categoryFit >= 20 ? "core category alignment" : "adjacent capability coverage",
      item.complianceFit >= 20 ? "compliance-sensitive offers" : "general service delivery",
      item.multiTenantSupport >= 16 ? "multi-tenant operations" : "single-tenant leaning use cases"
    ]
  }));
}

export const stackFitScoringPolicy: RecommendationPolicy<StackFitOutput> = {
  code: "stack.fit.v2",
  family: "stack-fit",
  evaluate(context: RecommendationContext) {
    const capabilities = inferServiceCapabilities(context.servicePackage.items);
    const scoreBreakdown = context.vendors.map((vendor) => scoreVendor(context, vendor)).sort((left, right) => right.totalScore - left.totalScore);
    const topVendors = scoreBreakdown.slice(0, 3);
    const topChoices = buildTopChoices(scoreBreakdown);
    const coverageGaps: string[] = [];
    const explanationItems: ExplanationItem[] = [];

    if (capabilities.helpdesk && !topVendors.some((item) => item.vendorName.toLowerCase().includes("halo") || item.vendorName.toLowerCase().includes("syncro"))) {
      coverageGaps.push("No clearly aligned PSA/helpdesk tool ranks near the top of the stack.");
    }
    if (isSecurityLedContext(context) && !topVendors.some((item) => item.vendorName.toLowerCase().includes("huntress"))) {
      coverageGaps.push("Security-led offer lacks a clearly dominant MDR-oriented vendor fit.");
    }
    if (context.businessModel.deliveryModel === "onsite" && !topVendors.some((item) => item.deliveryFit >= 12)) {
      coverageGaps.push("Onsite-heavy delivery has limited tool fit from the current shortlist.");
    }

    for (const choice of topChoices) {
      explanationItems.push({
        category: "stack",
        impact: "positive",
        message: `${choice.vendorName} ranks highly for this scenario because ${choice.whyFit.slice(0, 2).join(" and ").toLowerCase()}.`,
        recommendedAction: `Validate ${choice.vendorName} during operator review and compare pricing assumptions against real vendor terms.`
      });
    }

    for (const gap of coverageGaps) {
      explanationItems.push({
        category: "stack",
        impact: "warning",
        message: gap,
        recommendedAction: "Refine the package or broaden the vendor catalog before finalizing the launch stack."
      });
    }

    const positiveSignals = topChoices.map((item) => `${item.vendorName} fits the current MSP/MSSP posture and package design.`);
    const negativeSignals = coverageGaps.length > 0
      ? coverageGaps
      : scoreBreakdown
          .filter((item) => item.totalScore < 65)
          .slice(0, 2)
          .map((item) => `${item.vendorName} is a weaker fit because ${item.tradeoffs[0] ?? "the current context does not align strongly."}`);

    return [
      {
        code: "stack.fit.primary",
        family: "stack-fit",
        score: topVendors.length > 0 ? clampScore(topVendors.reduce((sum, item) => sum + item.totalScore, 0) / topVendors.length) : 0,
        confidence: clampConfidence(0.62 + Math.min(0.18, topVendors.length * 0.05) + (context.vendors.length >= 3 ? 0.04 : 0)),
        summary: topVendors.length > 0
          ? "The stack shortlist reflects business posture, delivery model, compliance needs, package design, founder maturity, and pricing posture."
          : "No vendor shortlist could be produced from the current context.",
        reasons: topChoices.flatMap((item) => item.whyFit.slice(0, 2)).slice(0, 6),
        contributingFactors: [
          `Business type: ${context.businessModel.businessType}`,
          `Compliance sensitivity: ${context.constraints.complianceSensitivity}`,
          `Budget positioning: ${context.constraints.budgetPositioning}`,
          `Pricing unit: ${context.pricingModel.pricingUnit}`,
          `Founder maturity: ${context.businessModel.founderMaturity}`
        ],
        positiveSignals,
        negativeSignals,
        explanationItems,
        data: {
          suggestedVendorIds: topChoices.map((item) => item.vendorId),
          fitNotes: topChoices.map((item) => `${item.vendorName} scored ${item.score}/100 because ${item.whyFit.slice(0, 2).join(" and ").toLowerCase()}.`),
          scoreBreakdown,
          topChoices,
          coverageGaps
        }
      }
    ];
  }
};
