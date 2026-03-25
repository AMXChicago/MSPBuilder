"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import {
  ORGANIZATION_ID,
  STORAGE_KEYS,
  postJson,
  readStoredDraft,
  writeStoredDraft
} from "../../lib/launch-os";

interface PricingDraft {
  id?: string;
  servicePackageId?: string;
  pricingUnit: "user" | "device" | "hybrid";
  monthlyBasePrice: number;
  onboardingFee: number;
  minimumQuantity: number;
  includedQuantity: number;
  overageUnitPrice: number;
  billingFrequency: "monthly" | "quarterly" | "annual";
  contractTermMonths: number;
  passthroughCost: number;
  markupPercentage: number;
  targetMarginPercent: number;
  floorMarginPercent: number;
}

const defaultDraft: PricingDraft = {
  pricingUnit: "user",
  monthlyBasePrice: 125,
  onboardingFee: 1500,
  minimumQuantity: 10,
  includedQuantity: 10,
  overageUnitPrice: 12,
  billingFrequency: "monthly",
  contractTermMonths: 12,
  passthroughCost: 55,
  markupPercentage: 35,
  targetMarginPercent: 55,
  floorMarginPercent: 35
};

export default function PricingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<PricingDraft>(defaultDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedPricing = readStoredDraft(STORAGE_KEYS.pricing, defaultDraft);
    const storedPackage = readStoredDraft<{ id?: string }>(STORAGE_KEYS.servicePackage, {});
    setDraft({ ...storedPricing, servicePackageId: storedPricing.servicePackageId ?? storedPackage.id });
  }, []);

  function update<K extends keyof PricingDraft>(key: K, value: PricingDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!draft.servicePackageId) {
      setError("Create a service package before saving pricing.");
      setIsSaving(false);
      return;
    }

    const effectiveMarginPercent = draft.monthlyBasePrice > 0
      ? Number((((draft.monthlyBasePrice - draft.passthroughCost) / draft.monthlyBasePrice) * 100).toFixed(2))
      : 0;

    const payload = {
      id: draft.id,
      organizationId: ORGANIZATION_ID,
      servicePackageId: draft.servicePackageId,
      pricingUnit: draft.pricingUnit,
      currencyCode: "USD",
      monthlyBasePrice: draft.monthlyBasePrice,
      onboardingFee: draft.onboardingFee,
      minimumQuantity: draft.minimumQuantity,
      includedQuantity: draft.includedQuantity,
      overageUnitPrice: draft.overageUnitPrice,
      billingFrequency: draft.billingFrequency,
      contractTermMonths: draft.contractTermMonths,
      passthroughCost: draft.passthroughCost,
      markupPercentage: draft.markupPercentage,
      effectiveMarginPercent,
      targetMarginPercent: draft.targetMarginPercent,
      floorMarginPercent: draft.floorMarginPercent
    };

    try {
      const response = await postJson<{ data: { id: string; servicePackageId: string } }>("/pricing", payload);
      writeStoredDraft(STORAGE_KEYS.pricing, { ...draft, id: response.data.id, servicePackageId: response.data.servicePackageId });
      router.push("/recommendation");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save pricing.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WorkflowShell
      currentStep="Pricing"
      title="Pricing"
      description="Enter pricing inputs so the recommendation engine can assess commercial readiness."
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Pricing unit
          <select value={draft.pricingUnit} onChange={(event) => update("pricingUnit", event.target.value as PricingDraft["pricingUnit"])}>
            <option value="user">User</option>
            <option value="device">Device</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label>
          Monthly base price
          <input type="number" min={0} value={draft.monthlyBasePrice} onChange={(event) => update("monthlyBasePrice", Number(event.target.value))} required />
        </label>
        <label>
          Onboarding fee
          <input type="number" min={0} value={draft.onboardingFee} onChange={(event) => update("onboardingFee", Number(event.target.value))} required />
        </label>
        <label>
          Minimum quantity
          <input type="number" min={0} value={draft.minimumQuantity} onChange={(event) => update("minimumQuantity", Number(event.target.value))} required />
        </label>
        <label>
          Included quantity
          <input type="number" min={0} value={draft.includedQuantity} onChange={(event) => update("includedQuantity", Number(event.target.value))} required />
        </label>
        <label>
          Overage unit price
          <input type="number" min={0} value={draft.overageUnitPrice} onChange={(event) => update("overageUnitPrice", Number(event.target.value))} required />
        </label>
        <label>
          Billing frequency
          <select value={draft.billingFrequency} onChange={(event) => update("billingFrequency", event.target.value as PricingDraft["billingFrequency"])}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annual">Annual</option>
          </select>
        </label>
        <label>
          Contract term (months)
          <input type="number" min={1} value={draft.contractTermMonths} onChange={(event) => update("contractTermMonths", Number(event.target.value))} required />
        </label>
        <label>
          Passthrough cost
          <input type="number" min={0} value={draft.passthroughCost} onChange={(event) => update("passthroughCost", Number(event.target.value))} required />
        </label>
        <label>
          Markup percentage
          <input type="number" min={0} max={100} value={draft.markupPercentage} onChange={(event) => update("markupPercentage", Number(event.target.value))} required />
        </label>
        <label>
          Target margin percent
          <input type="number" min={0} max={100} value={draft.targetMarginPercent} onChange={(event) => update("targetMarginPercent", Number(event.target.value))} required />
        </label>
        <label>
          Floor margin percent
          <input type="number" min={0} max={100} value={draft.floorMarginPercent} onChange={(event) => update("floorMarginPercent", Number(event.target.value))} required />
        </label>

        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save and continue"}</button>
      </form>
    </WorkflowShell>
  );
}
