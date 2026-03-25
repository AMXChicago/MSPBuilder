"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import { getWorkflowState, saveJson } from "../../lib/launch-os";

interface FounderDraft {
  id?: string;
  fullName: string;
  roleTitle: string;
  priorExperienceYears: number;
  targetGeo: string;
  serviceMotion: "managed-services" | "project-led" | "security-led" | "hybrid";
  maturityLevel: "new" | "growing" | "established";
  salesConfidence: number;
  technicalDepth: number;
  preferredEngagementModel: "fractional-founder" | "owner-operator" | "team-led";
}

const defaultDraft: FounderDraft = {
  fullName: "",
  roleTitle: "",
  priorExperienceYears: 0,
  targetGeo: "United States",
  serviceMotion: "managed-services",
  maturityLevel: "new",
  salesConfidence: 5,
  technicalDepth: 5,
  preferredEngagementModel: "owner-operator"
};

export default function FounderPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<FounderDraft>(defaultDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedState, setHasSavedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const state = await getWorkflowState();
        if (state.founderProfile) {
          setDraft(state.founderProfile);
          setHasSavedState(true);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load founder profile.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  function update<K extends keyof FounderDraft>(key: K, value: FounderDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const saved = await saveJson<FounderDraft & { id: string }>("/founder", draft, draft.id ? "PUT" : "POST");
      setDraft(saved);
      setHasSavedState(true);
      router.push("/business-model");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save founder profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <WorkflowShell
      currentStep="Founder"
      title="Founder Profile"
      description="Capture the operator context that will shape recommendations."
      savedStateLabel={hasSavedState ? "Saved founder profile loaded. Updates will overwrite the current tenant-scoped record." : undefined}
    >
      {isLoading ? <p>Loading founder profile...</p> : null}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>Full name<input value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} required /></label>
        <label>Role title<input value={draft.roleTitle} onChange={(event) => update("roleTitle", event.target.value)} required /></label>
        <label>Prior experience years<input type="number" min={0} value={draft.priorExperienceYears} onChange={(event) => update("priorExperienceYears", Number(event.target.value))} required /></label>
        <label>Target geography<input value={draft.targetGeo} onChange={(event) => update("targetGeo", event.target.value)} required /></label>
        <label>Service motion<select value={draft.serviceMotion} onChange={(event) => update("serviceMotion", event.target.value as FounderDraft["serviceMotion"])}><option value="managed-services">Managed services</option><option value="project-led">Project-led</option><option value="security-led">Security-led</option><option value="hybrid">Hybrid</option></select></label>
        <label>Maturity level<select value={draft.maturityLevel} onChange={(event) => update("maturityLevel", event.target.value as FounderDraft["maturityLevel"])}><option value="new">New</option><option value="growing">Growing</option><option value="established">Established</option></select></label>
        <label>Sales confidence (1-10)<input type="number" min={1} max={10} value={draft.salesConfidence} onChange={(event) => update("salesConfidence", Number(event.target.value))} required /></label>
        <label>Technical depth (1-10)<input type="number" min={1} max={10} value={draft.technicalDepth} onChange={(event) => update("technicalDepth", Number(event.target.value))} required /></label>
        <label>Engagement model<select value={draft.preferredEngagementModel} onChange={(event) => update("preferredEngagementModel", event.target.value as FounderDraft["preferredEngagementModel"])}><option value="fractional-founder">Fractional founder</option><option value="owner-operator">Owner-operator</option><option value="team-led">Team-led</option></select></label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSaving || isLoading}>{isSaving ? "Saving..." : draft.id ? "Save changes and continue" : "Save and continue"}</button>
      </form>
    </WorkflowShell>
  );
}
