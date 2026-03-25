import type { RecommendationContext, RecommendationPolicy, StackFitOutput, VendorScoreBreakdown } from "../core/types";
import { clampConfidence, clampScore, detectVerticals, getVendorScoringProfile, inferServiceCapabilities, isSecurityLedContext, normalizeText } from "../core/scoring";

function scoreVendor(context: RecommendationContext, vendor: RecommendationContext["vendors"][number]): VendorScoreBreakdown {
  const profile = getVendorScoringProfile(vendor);
  const capabilities = inferServiceCapabilities(context.servicePackage.items);
  const verticals = detectVerticals(context.businessModel.targetVerticals);
  const packageText = [
    context.servicePackage.name,
    context.servicePackage.description,
    ...context.servicePackage.items.map((item) => item.serviceDefinitionId)
  ]
    .join(" ")
    .toLowerCase();

  let categoryFit = 6;
  const reasons: string[] = [];

  if ((context.businessModel.businessType === "msp" || context.businessModel.businessType === "co-managed") && ["psa", "rmm", "identity", "backup"].includes(vendor.category)) {
    categoryFit += 18;
    reasons.push("Vendor category aligns with MSP operational tooling needs.");
  }

  if (isSecurityLedContext(context) && ["mdr", "identity", "backup", "email-security"].includes(vendor.category)) {
    categoryFit += 20;
    reasons.push("Vendor category aligns with security-led service delivery.");
  }

  const msspFriendliness = vendor.msspFriendly ? 18 : 4;
  if (vendor.msspFriendly) reasons.push("Vendor is MSP/MSSP-friendly.");

  const multiTenantSupport = vendor.supportsMultiTenant ? 18 : 2;
  if (vendor.supportsMultiTenant) reasons.push("Vendor supports multi-tenant operations.");

  let complianceFit = 8;
  if (context.constraints.complianceSensitivity === "high") {
    complianceFit += profile.complianceStrength === "advanced" ? 20 : profile.complianceStrength === "strong" ? 12 : 2;
    reasons.push(`Compliance posture fit is ${profile.complianceStrength}.`);
  } else {
    complianceFit += profile.complianceStrength === "baseline" ? 8 : 10;
  }

  if (verticals.healthcare || verticals.finance) {
    complianceFit += profile.complianceStrength === "advanced" ? 6 : 0;
  }

  let packageAlignment = 6;
  const keywordMatches = profile.packageKeywords.filter((keyword) => packageText.includes(normalizeText(keyword))).length;
  packageAlignment += Math.min(18, keywordMatches * 6);
  if (keywordMatches > 0) reasons.push(`Vendor aligns with ${keywordMatches} package-specific capability cue(s).`);
  if (profile.preferredBusinessTypes.includes(context.businessModel.businessType)) {
    packageAlignment += 6;
    reasons.push("Vendor profile fits the selected business type.");
  }
  if (capabilities.helpdesk && vendor.category === "psa") packageAlignment += 6;
  if (capabilities.endpoint && ["mdr", "rmm"].includes(vendor.category)) packageAlignment += 6;
  if (capabilities.backup && vendor.category === "backup") packageAlignment += 6;

  let budgetAlignment = 8;
  if (context.constraints.budgetPositioning === profile.budgetFit) {
    budgetAlignment += 14;
    reasons.push("Vendor budget tier aligns with the offer positioning.");
  } else if (context.constraints.budgetPositioning === "budget" && profile.budgetFit === "premium") {
    budgetAlignment -= 2;
    reasons.push("Vendor may be costly for a budget-positioned offer.");
  } else if (context.constraints.budgetPositioning === "premium" && profile.budgetFit === "budget") {
    budgetAlignment += 4;
    reasons.push("Vendor may support margin efficiency in a premium offer if positioned carefully.");
  }

  const totalScore = clampScore(categoryFit + msspFriendliness + multiTenantSupport + complianceFit + packageAlignment + budgetAlignment);

  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    totalScore,
    categoryFit: clampScore(categoryFit),
    msspFriendliness,
    multiTenantSupport,
    complianceFit: clampScore(complianceFit),
    packageAlignment: clampScore(packageAlignment),
    budgetAlignment: clampScore(budgetAlignment),
    reasons
  };
}

export const stackFitScoringPolicy: RecommendationPolicy<StackFitOutput> = {
  code: "stack.fit.v1",
  family: "stack-fit",
  evaluate(context: RecommendationContext) {
    const scoreBreakdown = context.vendors.map((vendor) => scoreVendor(context, vendor)).sort((left, right) => right.totalScore - left.totalScore);
    const topVendors = scoreBreakdown.slice(0, 3);
    const positiveSignals = topVendors.map((item) => `${item.vendorName} shows strong fit through ${item.reasons.slice(0, 2).join(" and ")}.`);
    const negativeSignals = scoreBreakdown
      .filter((item) => item.totalScore < 55)
      .slice(0, 2)
      .map((item) => `${item.vendorName} has a weaker fit due to ${item.reasons.slice(-1)[0] ?? "limited context alignment"}.`);

    return [
      {
        code: "stack.fit.primary",
        family: "stack-fit",
        score: topVendors.length > 0 ? clampScore(topVendors.reduce((sum, item) => sum + item.totalScore, 0) / topVendors.length) : 0,
        confidence: clampConfidence(0.58 + Math.min(0.22, topVendors.length * 0.06)),
        summary: topVendors.length > 0
          ? "The stack shortlist reflects business posture, compliance needs, package design, and commercial positioning."
          : "No vendor shortlist could be produced from the current context.",
        reasons: topVendors.flatMap((item) => item.reasons.slice(0, 2)).slice(0, 6),
        contributingFactors: [
          `Business type: ${context.businessModel.businessType}`,
          `Compliance sensitivity: ${context.constraints.complianceSensitivity}`,
          `Budget positioning: ${context.constraints.budgetPositioning}`,
          `Package item count: ${context.servicePackage.items.length}`
        ],
        positiveSignals,
        negativeSignals,
        data: {
          suggestedVendorIds: topVendors.map((item) => item.vendorId),
          fitNotes: topVendors.map((item) => `${item.vendorName} scored ${item.totalScore}/100 due to ${item.reasons.slice(0, 2).join(" and ")}.`),
          scoreBreakdown
        }
      }
    ];
  }
};
