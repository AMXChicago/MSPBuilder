"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import { API_BASE_URL, getJson } from "../../lib/launch-os";

interface PolicyBreakdown {
  summary: string;
  reasons: string[];
  positiveSignals: string[];
  negativeSignals: string[];
}

interface RecommendationPreviewData {
  context: {
    businessModel: { name: string; businessType: string; targetVerticals: string[] };
    servicePackage: { name: string; items: Array<{ serviceDefinitionId: string }> };
    pricingModel: { pricingUnit: string; monthlyBasePrice: number };
  };
  result: {
    overallScore: number;
    readinessLevel: "low" | "medium" | "high";
    riskLevel: "low" | "medium" | "high";
    confidenceLevel: "low" | "medium" | "high";
    confidenceScore: number;
    explainability: {
      summary: string;
      reasons: string[];
      positiveSignals: string[];
      negativeSignals: string[];
    };
    missingInformation: {
      missingSections: string[];
      warnings: string[];
      hasBlockingGaps: boolean;
    };
    topActionItems: string[];
    recommendedNextSteps: string[];
    stackFitSummary: {
      data: {
        scoreBreakdown: Array<{ vendorId: string; vendorName: string }>;
        fitNotes: string[];
      };
    };
    securityBaselineSummary: {
      data: {
        suggestedBaselineCodes: string[];
        rationale: string[];
      };
    };
  };
  detailedBreakdown: {
    pricingReadiness: PolicyBreakdown;
    packageCompleteness: PolicyBreakdown;
    stackFit: PolicyBreakdown;
    securityBaseline: PolicyBreakdown;
  };
}

export default function RecommendationPage() {
  const [data, setData] = useState<RecommendationPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getJson<RecommendationPreviewData>("/recommendation/preview");
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load recommendation preview.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPreview();
  }, []);

  return (
    <WorkflowShell
      currentStep="Recommendation"
      title="Recommendation Preview"
      description={`Preview rebuilt from persisted workflow data via ${API_BASE_URL}/recommendation/preview.`}
      savedStateLabel="Recommendation preview is generated from the latest saved founder, business model, package, and pricing records."
    >
      {isLoading ? <p>Loading recommendation...</p> : null}
      {error ? <div><p role="alert">{error}</p><button type="button" onClick={() => void loadPreview()}>Retry</button></div> : null}
      {!isLoading && !error && data ? (
        <div style={{ display: "grid", gap: 16 }}>
          <section>
            <h2>Result</h2>
            <p><strong>Overall score:</strong> {data.result.overallScore}</p>
            <p><strong>Readiness level:</strong> {data.result.readinessLevel}</p>
            <p><strong>Risk level:</strong> {data.result.riskLevel}</p>
            <p><strong>Confidence:</strong> {data.result.confidenceLevel} ({data.result.confidenceScore})</p>
            <p><strong>Summary:</strong> {data.result.explainability.summary}</p>
          </section>

          {data.result.missingInformation.missingSections.length > 0 ? (
            <section>
              <h2>Missing Information</h2>
              <p>The preview is limited until these gaps are addressed.</p>
              <ul>{data.result.missingInformation.missingSections.map((item) => <li key={item}>{item}</li>)}</ul>
              <ul>{data.result.missingInformation.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            </section>
          ) : null}

          <section>
            <h2>Reasons</h2>
            <ul>{data.result.explainability.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </section>

          <section>
            <h2>Top Action Items</h2>
            <ul>{data.result.topActionItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section>
            <h2>Recommended Next Steps</h2>
            <ul>{data.result.recommendedNextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
          </section>

          <section>
            <h2>Key Recommendations</h2>
            <p><strong>Suggested vendors:</strong> {data.result.stackFitSummary.data.scoreBreakdown.map((vendor) => vendor.vendorName).join(", ") || "None yet"}</p>
            <ul>{data.result.stackFitSummary.data.fitNotes.map((note) => <li key={note}>{note}</li>)}</ul>
            <p><strong>Suggested baselines:</strong> {data.result.securityBaselineSummary.data.suggestedBaselineCodes.join(", ") || "None yet"}</p>
            <ul>{data.result.securityBaselineSummary.data.rationale.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>

          <section>
            <h2>Grouped Reasons</h2>
            <PolicySection title="Pricing" breakdown={data.detailedBreakdown.pricingReadiness} />
            <PolicySection title="Package" breakdown={data.detailedBreakdown.packageCompleteness} />
            <PolicySection title="Stack" breakdown={data.detailedBreakdown.stackFit} />
            <PolicySection title="Security" breakdown={data.detailedBreakdown.securityBaseline} />
          </section>

          <section>
            <h2>Context Snapshot</h2>
            <p><strong>Business model:</strong> {data.context.businessModel.name} ({data.context.businessModel.businessType})</p>
            <p><strong>Target verticals:</strong> {data.context.businessModel.targetVerticals.join(", ") || "Not set"}</p>
            <p><strong>Service package:</strong> {data.context.servicePackage.name}</p>
            <p><strong>Services:</strong> {data.context.servicePackage.items.map((item) => item.serviceDefinitionId).join(", ") || "None"}</p>
            <p><strong>Pricing:</strong> {data.context.pricingModel.pricingUnit} / ${data.context.pricingModel.monthlyBasePrice}</p>
          </section>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/pricing">Back to pricing</Link>
            <button type="button" onClick={() => void loadPreview()}>Refresh preview</button>
          </div>
        </div>
      ) : null}
    </WorkflowShell>
  );
}

function PolicySection({ title, breakdown }: { title: string; breakdown: PolicyBreakdown }) {
  return (
    <article>
      <h3>{title}</h3>
      <p>{breakdown.summary}</p>
      <p><strong>Reasons</strong></p>
      <ul>{breakdown.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      <p><strong>Positive signals</strong></p>
      <ul>{breakdown.positiveSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
      <p><strong>Negative signals</strong></p>
      <ul>{breakdown.negativeSignals.map((signal) => <li key={signal}>{signal}</li>)}</ul>
    </article>
  );
}
