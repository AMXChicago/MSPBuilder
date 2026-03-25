"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import { getWorkflowState, saveJson, splitLineSeparatedList } from "../../lib/launch-os";

interface ServiceDefinitionOption {
  id: string;
  name: string;
  category: string;
}

interface ServicePackageDraft {
  id?: string;
  name: string;
  marketPosition: "good" | "better" | "best" | "enterprise";
  description: string;
  targetPersona: string;
  includesSecurityBaseline: boolean;
  defaultSlaTier: "best-effort" | "standard" | "priority" | "24x7";
  defaultSupportHours: "business-hours" | "extended-hours" | "24x7";
  defaultExclusionsText: string;
  selectedServiceDefinitionIds: string[];
}

const defaultDraft: ServicePackageDraft = {
  name: "Core Care",
  marketPosition: "good",
  description: "Core MSP package for small and mid-sized clients.",
  targetPersona: "Small businesses that need outsourced IT operations",
  includesSecurityBaseline: true,
  defaultSlaTier: "standard",
  defaultSupportHours: "business-hours",
  defaultExclusionsText: "After-hours onsite support\nProject labor outside recurring scope",
  selectedServiceDefinitionIds: []
};

export default function ServicePackagePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ServicePackageDraft>(defaultDraft);
  const [serviceDefinitions, setServiceDefinitions] = useState<ServiceDefinitionOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const state = await getWorkflowState();
        setServiceDefinitions(state.referenceData.serviceDefinitions);
        if (state.servicePackage) {
          setDraft({
            id: state.servicePackage.id,
            name: state.servicePackage.name,
            marketPosition: state.servicePackage.marketPosition,
            description: state.servicePackage.description,
            targetPersona: state.servicePackage.targetPersona,
            includesSecurityBaseline: state.servicePackage.includesSecurityBaseline,
            defaultSlaTier: state.servicePackage.defaultSlaTier,
            defaultSupportHours: state.servicePackage.defaultSupportHours,
            defaultExclusionsText: state.servicePackage.defaultExclusions.join("\n"),
            selectedServiceDefinitionIds: state.servicePackage.items.map((item) => item.serviceDefinitionId)
          });
          setHasSavedState(true);
        } else if (state.referenceData.serviceDefinitions.length > 0) {
          setDraft((current) => ({
            ...current,
            selectedServiceDefinitionIds: state.referenceData.serviceDefinitions.slice(0, 3).map((definition) => definition.id)
          }));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load service package state.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  const selectedItems = useMemo(() => {
    return draft.selectedServiceDefinitionIds.map((serviceDefinitionId, index) => {
      const serviceDefinition = serviceDefinitions.find((definition) => definition.id === serviceDefinitionId);
      const isSecurity = serviceDefinition?.category === "security";
      return {
        serviceDefinitionId,
        isRequired: true,
        includedQuantity: 1,
        slaTier: draft.defaultSlaTier,
        supportHours: isSecurity && draft.defaultSupportHours === "business-hours" ? "extended-hours" : draft.defaultSupportHours,
        exclusions: [],
        priorityLevel: isSecurity ? "critical" as const : "high" as const,
        sortOrder: index
      };
    });
  }, [draft.defaultSlaTier, draft.defaultSupportHours, draft.selectedServiceDefinitionIds, serviceDefinitions]);

  function update<K extends keyof ServicePackageDraft>(key: K, value: ServicePackageDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleServiceDefinition(serviceDefinitionId: string) {
    setDraft((current) => ({
      ...current,
      selectedServiceDefinitionIds: current.selectedServiceDefinitionIds.includes(serviceDefinitionId)
        ? current.selectedServiceDefinitionIds.filter((id) => id !== serviceDefinitionId)
        : [...current.selectedServiceDefinitionIds, serviceDefinitionId]
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    if (selectedItems.length === 0) {
      setError("Select at least one service for the package.");
      setIsSaving(false);
      return;
    }

    try {
      const saved = await saveJson<{ id: string }>("/service-package", {
        id: draft.id,
        name: draft.name,
        marketPosition: draft.marketPosition,
        description: draft.description,
        targetPersona: draft.targetPersona,
        includesSecurityBaseline: draft.includesSecurityBaseline,
        defaultSlaTier: draft.defaultSlaTier,
        defaultSupportHours: draft.defaultSupportHours,
        defaultExclusions: splitLineSeparatedList(draft.defaultExclusionsText),
        status: "draft",
        items: selectedItems
      }, draft.id ? "PUT" : "POST");
      setDraft((current) => ({ ...current, id: saved.id }));
      setHasSavedState(true);
      router.push("/pricing");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save service package.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WorkflowShell
      currentStep="Service Package"
      title="Service Package"
      description="Build a minimal package definition that the recommendation engine can evaluate."
      savedStateLabel={hasSavedState ? "Saved service package loaded. Updates will overwrite the current tenant-scoped record." : undefined}
    >
      {isLoading ? <p>Loading service package...</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>Package name<input value={draft.name} onChange={(event) => update("name", event.target.value)} required /></label>
        <label>Market position<select value={draft.marketPosition} onChange={(event) => update("marketPosition", event.target.value as ServicePackageDraft["marketPosition"])}><option value="good">Good</option><option value="better">Better</option><option value="best">Best</option><option value="enterprise">Enterprise</option></select></label>
        <label>Description<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} rows={3} required /></label>
        <label>Target persona<input value={draft.targetPersona} onChange={(event) => update("targetPersona", event.target.value)} required /></label>
        <label>Default SLA tier<select value={draft.defaultSlaTier} onChange={(event) => update("defaultSlaTier", event.target.value as ServicePackageDraft["defaultSlaTier"])}><option value="best-effort">Best effort</option><option value="standard">Standard</option><option value="priority">Priority</option><option value="24x7">24x7</option></select></label>
        <label>Default support hours<select value={draft.defaultSupportHours} onChange={(event) => update("defaultSupportHours", event.target.value as ServicePackageDraft["defaultSupportHours"])}><option value="business-hours">Business hours</option><option value="extended-hours">Extended hours</option><option value="24x7">24x7</option></select></label>
        <label>Default exclusions (one per line)<textarea value={draft.defaultExclusionsText} onChange={(event) => update("defaultExclusionsText", event.target.value)} rows={4} /></label>
        <label><input type="checkbox" checked={draft.includesSecurityBaseline} onChange={(event) => update("includesSecurityBaseline", event.target.checked)} /> Include security baseline by default</label>
        <fieldset>
          <legend>Included services</legend>
          {serviceDefinitions.map((definition) => (
            <label key={definition.id}>
              <input type="checkbox" checked={draft.selectedServiceDefinitionIds.includes(definition.id)} onChange={() => toggleServiceDefinition(definition.id)} /> {definition.name} ({definition.category})
            </label>
          ))}
        </fieldset>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSaving || isLoading}>{isSaving ? "Saving..." : draft.id ? "Save changes and continue" : "Save and continue"}</button>
      </form>
    </WorkflowShell>
  );
}
