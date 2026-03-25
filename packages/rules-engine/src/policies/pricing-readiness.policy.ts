import type { PricingReadinessOutput, RecommendationContext, RecommendationPolicy, ExplanationItem } from "../core/types";
import { calculateEffectiveMarginPercent, clampConfidence, clampScore, inferServiceCapabilities } from "../core/scoring";

export const pricingReadinessPolicy: RecommendationPolicy<PricingReadinessOutput> = {
  code: "pricing.readiness.v1",
  family: "pricing-readiness",
  evaluate(context: RecommendationContext) {
    const missingFields: string[] = [];
    const riskFlags: string[] = [];
    const improvementNotes: string[] = [];
    const contributingFactors: string[] = [
      `Business type: ${context.businessModel.businessType}`,
      `Pricing unit: ${context.pricingModel.pricingUnit}`,
      `Billing frequency: ${context.pricingModel.billingFrequency}`,
      `Founder maturity: ${context.constraints.founderMaturity}`
    ];
    const positiveSignals: string[] = [];
    const negativeSignals: string[] = [];
    const explanationItems: ExplanationItem[] = [];
    const capabilities = inferServiceCapabilities(context.servicePackage.items);
    const effectiveMarginPercent = calculateEffectiveMarginPercent(context);

    if (context.pricingModel.monthlyBasePrice <= 0) missingFields.push("monthlyBasePrice");
    if (context.pricingModel.minimumQuantity <= 0) missingFields.push("minimumQuantity");
    if (context.pricingModel.contractTermMonths <= 0) missingFields.push("contractTermMonths");
    if (context.pricingModel.overageUnitPrice < 0) missingFields.push("overageUnitPrice");

    for (const field of missingFields) {
      explanationItems.push({
        category: "pricing",
        impact: "warning",
        message: `Pricing field ${field} is missing or invalid.`,
        recommendedAction: `Complete ${field} before relying on the recommendation output.`
      });
    }

    if (context.pricingModel.minimumQuantity >= context.pricingModel.includedQuantity) {
      positiveSignals.push("Minimum quantity is aligned with or above the included quantity threshold.");
      explanationItems.push({
        category: "pricing",
        impact: "positive",
        message: "Commercial floor is aligned with the included service commitment.",
        recommendedAction: "Keep minimum quantity aligned to the included service load."
      });
    } else {
      improvementNotes.push("Minimum quantity is lower than included quantity; align the commercial floor with included coverage.");
      negativeSignals.push("Commercial floor is weaker than the included service threshold.");
      explanationItems.push({
        category: "pricing",
        impact: "negative",
        message: "Included quantity exceeds the commercial minimum, which weakens the floor of the offer.",
        recommendedAction: "Raise minimum quantity or reduce included quantity to protect service economics."
      });
    }

    if (context.pricingModel.billingFrequency === "annual" && context.pricingModel.contractTermMonths < 12) {
      riskFlags.push("Annual billing is configured with a contract term shorter than 12 months.");
      negativeSignals.push("Billing cadence and contract term are misaligned.");
      explanationItems.push({
        category: "pricing",
        impact: "warning",
        message: "Annual billing is misaligned with the configured contract term.",
        recommendedAction: "Use a 12+ month term for annual billing or reduce the billing frequency."
      });
    }

    if (context.pricingModel.billingFrequency === "quarterly" && context.pricingModel.contractTermMonths < 3) {
      riskFlags.push("Quarterly billing is configured with a contract term shorter than one billing cycle.");
      negativeSignals.push("Quarterly billing is unsupported by the current contract term.");
    }

    if (effectiveMarginPercent !== null && effectiveMarginPercent >= context.pricingModel.targetMarginPercent) {
      positiveSignals.push("Estimated effective margin meets or exceeds the target margin.");
      explanationItems.push({
        category: "pricing",
        impact: "positive",
        message: `Estimated effective margin of ${effectiveMarginPercent}% meets the target margin.`,
        recommendedAction: "Validate this margin against real vendor costs as implementation continues."
      });
    } else if (effectiveMarginPercent !== null && effectiveMarginPercent < context.pricingModel.floorMarginPercent) {
      riskFlags.push("Effective margin falls below the configured floor margin.");
      negativeSignals.push("Margin is below the floor threshold and risks unsustainable delivery.");
      explanationItems.push({
        category: "pricing",
        impact: "negative",
        message: `Estimated effective margin of ${effectiveMarginPercent}% is below the floor margin.`,
        recommendedAction: "Increase price, reduce passthrough cost, or narrow included scope before launch."
      });
    } else if (effectiveMarginPercent !== null && effectiveMarginPercent < context.pricingModel.targetMarginPercent) {
      improvementNotes.push("Effective margin is below the target margin and may reduce service sustainability.");
      negativeSignals.push("Margin is below target and limits pricing resilience.");
      explanationItems.push({
        category: "pricing",
        impact: "warning",
        message: `Estimated effective margin of ${effectiveMarginPercent}% is below the target margin.`,
        recommendedAction: "Refine price points or package scope until the offer can sustain delivery."
      });
    }

    if (context.pricingModel.pricingUnit === "hybrid") {
      positiveSignals.push("Hybrid pricing can better reflect blended support and security delivery.");
    }

    if (context.pricingModel.pricingUnit === "user" && capabilities.endpoint && !capabilities.helpdesk) {
      riskFlags.push("Per-user pricing may not align cleanly with a package dominated by endpoint-only coverage.");
      negativeSignals.push("Pricing unit does not cleanly match the service package emphasis.");
      explanationItems.push({
        category: "pricing",
        impact: "warning",
        message: "Per-user pricing does not fully match an endpoint-dominant package design.",
        recommendedAction: "Consider device or hybrid pricing for endpoint-heavy services."
      });
    }

    if (context.pricingModel.pricingUnit === "device" && capabilities.helpdesk && context.businessModel.businessType === "msp") {
      improvementNotes.push("Consider whether per-device pricing fully captures helpdesk-heavy MSP delivery work.");
    }

    if ((capabilities.helpdesk || capabilities.security) && capabilities.endpoint && context.pricingModel.pricingUnit !== "hybrid") {
      improvementNotes.push("A hybrid pricing unit may better reflect packages that combine people-based support with device-based security coverage.");
    }

    if (context.constraints.complianceSensitivity === "high" && context.pricingModel.contractTermMonths >= 12) {
      positiveSignals.push("Contract term is more aligned with high-compliance service delivery and onboarding recovery.");
    } else if (context.constraints.complianceSensitivity === "high") {
      riskFlags.push("High-compliance offers typically need a longer contract term to support operational controls and onboarding cost recovery.");
      negativeSignals.push("Compliance-sensitive offer has a shorter than ideal commitment period.");
    }

    if (context.constraints.founderMaturity === "beginner" && context.pricingModel.markupPercentage < 20) {
      improvementNotes.push("Beginner operators may benefit from a clearer markup buffer until delivery costs stabilize.");
      negativeSignals.push("Markup buffer is thin for an early-stage operator.");
    }

    const score = clampScore(100 - missingFields.length * 18 - riskFlags.length * 12 - improvementNotes.length * 4 + positiveSignals.length * 3);
    const isReady = missingFields.length === 0 && riskFlags.length < 2 && score >= 60;

    return [
      {
        code: "pricing.readiness.primary",
        family: "pricing-readiness",
        score,
        confidence: clampConfidence(0.62 + (missingFields.length === 0 ? 0.12 : 0) - riskFlags.length * 0.06),
        summary: isReady
          ? "Pricing inputs are structured enough to support initial MSP/MSSP recommendation workflows."
          : "Pricing inputs need correction before the commercial model is ready for dependable recommendations.",
        reasons: [
          `Pricing unit is set to ${context.pricingModel.pricingUnit}.`,
          `Billing frequency is ${context.pricingModel.billingFrequency} with a ${context.pricingModel.contractTermMonths}-month term.`,
          effectiveMarginPercent === null
            ? "Effective margin could not be computed because monthly revenue is not yet viable."
            : `Estimated effective margin is ${effectiveMarginPercent}%.`
        ],
        contributingFactors,
        positiveSignals,
        negativeSignals,
        explanationItems,
        data: {
          isReady,
          missingFields,
          riskFlags,
          improvementNotes,
          effectiveMarginPercent
        }
      }
    ];
  }
};
