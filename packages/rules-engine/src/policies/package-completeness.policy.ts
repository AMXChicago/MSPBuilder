import type { PackageCompletenessOutput, RecommendationContext, RecommendationPolicy } from "../core/types";
import { clampConfidence, clampScore, detectVerticals, hasDangerousExclusion, inferServiceCapabilities, isSecurityLedContext } from "../core/scoring";

export const packageCompletenessPolicy: RecommendationPolicy<PackageCompletenessOutput> = {
  code: "package.completeness.v1",
  family: "package-completeness",
  evaluate(context: RecommendationContext) {
    const missingCapabilities: string[] = [];
    const packageRisks: string[] = [];
    const packageNotes: string[] = [];
    const capabilities = inferServiceCapabilities(context.servicePackage.items);
    const verticals = detectVerticals(context.businessModel.targetVerticals);
    const needsBackup = context.constraints.complianceSensitivity === "high" || verticals.healthcare || verticals.finance || context.servicePackage.includesSecurityBaseline;

    if ((context.businessModel.businessType === "msp" || context.businessModel.businessType === "co-managed") && !capabilities.helpdesk) {
      missingCapabilities.push("helpdesk-coverage");
    }

    if (isSecurityLedContext(context) && !capabilities.security) {
      missingCapabilities.push("security-coverage");
    }

    if (needsBackup && !capabilities.backup) {
      missingCapabilities.push("backup-continuity-coverage");
    }

    if (context.servicePackage.defaultSlaTier === "24x7" && context.servicePackage.defaultSupportHours !== "24x7") {
      packageRisks.push("Package claims a 24x7 SLA but default support hours are not 24x7.");
    }

    if (context.servicePackage.items.some((item) => item.slaTier === "24x7" && item.supportHours !== "24x7")) {
      packageRisks.push("One or more package items promise a 24x7 SLA without matching support-hour coverage.");
    }

    if (hasDangerousExclusion(context.servicePackage.items, "backup") || context.servicePackage.defaultExclusions.some((value) => value.toLowerCase().includes("backup"))) {
      packageRisks.push("Backup is excluded from the package, which can create continuity exposure.");
    }

    if (hasDangerousExclusion(context.servicePackage.items, "security") && isSecurityLedContext(context)) {
      packageRisks.push("Security work is excluded even though the business posture is security-sensitive.");
    }

    if (context.servicePackage.items.some((item) => item.priorityLevel === "critical") && context.servicePackage.defaultSupportHours === "business-hours") {
      packageRisks.push("Critical-priority coverage is defined while support hours remain limited to business hours.");
    }

    if (context.constraints.deliveryModel === "onsite") {
      packageNotes.push("Onsite delivery models may need explicit field-service or dispatch workflows in later iterations.");
    }

    if (context.businessModel.businessType === "co-managed") {
      packageNotes.push("Co-managed offers should clearly distinguish provider-owned vs client-owned responsibilities.");
    }

    const score = clampScore(100 - missingCapabilities.length * 18 - packageRisks.length * 12 + context.servicePackage.items.length * 2);
    const isComplete = missingCapabilities.length === 0 && packageRisks.length < 2 && score >= 65;

    return [
      {
        code: "package.completeness.primary",
        family: "package-completeness",
        score,
        confidence: clampConfidence(0.64 + (context.servicePackage.items.length >= 3 ? 0.1 : 0) - packageRisks.length * 0.05),
        summary: isComplete
          ? "The service package is operationally coherent enough for initial recommendation scoring."
          : "The service package still has operational gaps that weaken recommendation quality.",
        reasons: [
          `Package includes ${context.servicePackage.items.length} composed service items.`,
          `Default SLA is ${context.servicePackage.defaultSlaTier} with ${context.servicePackage.defaultSupportHours} support hours.`,
          needsBackup ? "Continuity expectations require backup coverage in this scenario." : "Backup coverage is optional in this scenario but still valuable."
        ],
        data: {
          isComplete,
          missingCapabilities,
          packageRisks,
          packageNotes
        }
      }
    ];
  }
};
