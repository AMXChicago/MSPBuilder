"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import { getWorkflowState, saveJson, splitCommaSeparatedList } from "../../lib/launch-os";

interface BusinessModelDraft {
  id?: string;
  name: string;
  businessType: "msp" | "mssp" | "hybrid" | "co-managed";
  targetVerticalsText: string;
  targetCompanySizesText: string;
  deliveryModel: "remote" | "onsite" | "hybrid";
  complianceSensitivity: "low" | "medium" | "high";
  budgetPositioning: "budget" | "standard" | "premium";
  founderMaturity: "beginner" | "intermediate" | "advanced";
  revenueStrategy: "recurring" | "hybrid" | "project-first";
  targetGrossMarginPercent: number;
}

const defaultDraft: BusinessModelDraft = {
  name: "",
  businessType: "msp",
  targetVerticalsText: "professional services",
  targetCompanySizesText: "20-99 employees",
  deliveryModel: "remote",
  complianceSensitivity: "low",
  budgetPositioning: "standard",
  founderMaturity: "beginner",
  revenueStrategy: "recurring",
  targetGrossMarginPercent: 55
};

export default function BusinessModelPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BusinessModelDraft>(defaultDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const state = await getWorkflowState();
        if (state.businessModel) {
          setDraft({
            id: state.businessModel.id,
            name: state.businessModel.name,
            businessType: state.businessModel.businessType,
            targetVerticalsText: state.businessModel.targetVerticals.join(", "),
            targetCompanySizesText: state.businessModel.targetCompanySizes.join(", "),
            deliveryModel: state.businessModel.deliveryModel,
            complianceSensitivity: state.businessModel.complianceSensitivity,
            budgetPositioning: state.businessModel.budgetPositioning,
            founderMaturity: state.businessModel.founderMaturity,
            revenueStrategy: state.businessModel.revenueStrategy,
            targetGrossMarginPercent: state.businessModel.targetGrossMarginPercent
          });
          setHasSavedState(true);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load business model.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  function update<K extends keyof BusinessModelDraft>(key: K, value: BusinessModelDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveJson<{ id: string }>("/business-model", {
        id: draft.id,
        name: draft.name,
        businessType: draft.businessType,
        targetVerticals: splitCommaSeparatedList(draft.targetVerticalsText),
        targetCompanySizes: splitCommaSeparatedList(draft.targetCompanySizesText),
        deliveryModel: draft.deliveryModel,
        complianceSensitivity: draft.complianceSensitivity,
        budgetPositioning: draft.budgetPositioning,
        founderMaturity: draft.founderMaturity,
        revenueStrategy: draft.revenueStrategy,
        targetGrossMarginPercent: draft.targetGrossMarginPercent,
        currencyCode: "USD",
        status: "draft"
      }, draft.id ? "PUT" : "POST");
      setDraft((current) => ({ ...current, id: saved.id }));
      setHasSavedState(true);
      router.push("/service-package");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save business model.");
    } finally {
      setIsSaving(false);
    }
  }

  const savedStateLabel = hasSavedState
    ? "Saved business model loaded. Updates will overwrite the current tenant-scoped record."
    : undefined;

  return (
    <WorkflowShell
      currentStep="Business Model"
      title="Business Model"
      description="Define the MSP/MSSP posture that recommendation policies should optimize for."
      {...(savedStateLabel ? { savedStateLabel } : {})}
    >
      {isLoading ? <p>Loading business model...</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>Model name<input value={draft.name} onChange={(event) => update("name", event.target.value)} required /></label>
        <label>Business type<select value={draft.businessType} onChange={(event) => update("businessType", event.target.value as BusinessModelDraft["businessType"])}><option value="msp">MSP</option><option value="mssp">MSSP</option><option value="hybrid">Hybrid</option><option value="co-managed">Co-Managed</option></select></label>
        <label>Target verticals (comma separated)<input value={draft.targetVerticalsText} onChange={(event) => update("targetVerticalsText", event.target.value)} required /></label>
        <label>Target company sizes (comma separated)<input value={draft.targetCompanySizesText} onChange={(event) => update("targetCompanySizesText", event.target.value)} required /></label>
        <label>Delivery model<select value={draft.deliveryModel} onChange={(event) => update("deliveryModel", event.target.value as BusinessModelDraft["deliveryModel"])}><option value="remote">Remote</option><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option></select></label>
        <label>Compliance sensitivity<select value={draft.complianceSensitivity} onChange={(event) => update("complianceSensitivity", event.target.value as BusinessModelDraft["complianceSensitivity"])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label>Budget positioning<select value={draft.budgetPositioning} onChange={(event) => update("budgetPositioning", event.target.value as BusinessModelDraft["budgetPositioning"])}><option value="budget">Budget</option><option value="standard">Standard</option><option value="premium">Premium</option></select></label>
        <label>Founder maturity<select value={draft.founderMaturity} onChange={(event) => update("founderMaturity", event.target.value as BusinessModelDraft["founderMaturity"])}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
        <label>Revenue strategy<select value={draft.revenueStrategy} onChange={(event) => update("revenueStrategy", event.target.value as BusinessModelDraft["revenueStrategy"])}><option value="recurring">Recurring</option><option value="hybrid">Hybrid</option><option value="project-first">Project-first</option></select></label>
        <label>Target gross margin percent<input type="number" min={0} max={100} value={draft.targetGrossMarginPercent} onChange={(event) => update("targetGrossMarginPercent", Number(event.target.value))} required /></label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSaving || isLoading}>{isSaving ? "Saving..." : draft.id ? "Save changes and continue" : "Save and continue"}</button>
      </form>
    </WorkflowShell>
  );
}
