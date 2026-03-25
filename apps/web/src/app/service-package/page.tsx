"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkflowShell } from "../../components/workflow/workflow-shell";
import {
  ORGANIZATION_ID,
  STORAGE_KEYS,
  postJson,
  readStoredDraft,
  splitLineSeparatedList,
  writeStoredDraft
} from "../../lib/launch-os";

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
  includeHelpDesk: boolean;
  includeEndpointSecurity: boolean;
  includeBackup: boolean;
  includeMicrosoft365: boolean;
  includeNetworkSecurity: boolean;
}

interface ServicePackageItemInput {
  serviceDefinitionId: string;
  isRequired: boolean;
  includedQuantity: number;
  slaTier: "best-effort" | "standard" | "priority" | "24x7";
  supportHours: "business-hours" | "extended-hours" | "24x7";
  exclusions: string[];
  priorityLevel: "low" | "standard" | "high" | "critical";
  sortOrder: number;
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
  includeHelpDesk: true,
  includeEndpointSecurity: true,
  includeBackup: true,
  includeMicrosoft365: true,
  includeNetworkSecurity: false
};

function buildPackageItems(draft: ServicePackageDraft): ServicePackageItemInput[] {
  const items: Array<ServicePackageItemInput | null> = [
    draft.includeHelpDesk
      ? {
          serviceDefinitionId: "Managed Help Desk",
          isRequired: true,
          includedQuantity: 1,
          slaTier: draft.defaultSlaTier,
          supportHours: draft.defaultSupportHours,
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 0
        }
      : null,
    draft.includeEndpointSecurity
      ? {
          serviceDefinitionId: "Endpoint Detection and Response",
          isRequired: true,
          includedQuantity: 1,
          slaTier: draft.defaultSlaTier,
          supportHours: draft.defaultSupportHours === "business-hours" ? "extended-hours" : draft.defaultSupportHours,
          exclusions: [],
          priorityLevel: "critical",
          sortOrder: 1
        }
      : null,
    draft.includeBackup
      ? {
          serviceDefinitionId: "Backup Monitoring",
          isRequired: true,
          includedQuantity: 1,
          slaTier: draft.defaultSlaTier,
          supportHours: draft.defaultSupportHours,
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 2
        }
      : null,
    draft.includeMicrosoft365
      ? {
          serviceDefinitionId: "Microsoft 365 Administration",
          isRequired: false,
          includedQuantity: 1,
          slaTier: draft.defaultSlaTier,
          supportHours: draft.defaultSupportHours,
          exclusions: [],
          priorityLevel: "standard",
          sortOrder: 3
        }
      : null,
    draft.includeNetworkSecurity
      ? {
          serviceDefinitionId: "Network Security Monitoring",
          isRequired: false,
          includedQuantity: 1,
          slaTier: draft.defaultSlaTier,
          supportHours: draft.defaultSupportHours === "business-hours" ? "extended-hours" : draft.defaultSupportHours,
          exclusions: [],
          priorityLevel: "high",
          sortOrder: 4
        }
      : null
  ];

  return items.filter((item): item is ServicePackageItemInput => item !== null);
}

export default function ServicePackagePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<ServicePackageDraft>(defaultDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(readStoredDraft(STORAGE_KEYS.servicePackage, defaultDraft));
  }, []);

  const selectedServices = useMemo(() => buildPackageItems(draft), [draft]);

  function update<K extends keyof ServicePackageDraft>(key: K, value: ServicePackageDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    if (selectedServices.length === 0) {
      setError("Select at least one service for the package.");
      setIsSaving(false);
      return;
    }

    const payload = {
      id: draft.id,
      organizationId: ORGANIZATION_ID,
      name: draft.name,
      marketPosition: draft.marketPosition,
      description: draft.description,
      targetPersona: draft.targetPersona,
      includesSecurityBaseline: draft.includesSecurityBaseline,
      defaultSlaTier: draft.defaultSlaTier,
      defaultSupportHours: draft.defaultSupportHours,
      defaultExclusions: splitLineSeparatedList(draft.defaultExclusionsText),
      status: "draft",
      items: selectedServices
    };

    try {
      const response = await postJson<{ data: { id: string } }>("/service-package", payload);
      writeStoredDraft(STORAGE_KEYS.servicePackage, { ...draft, id: response.data.id });
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
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Package name
          <input value={draft.name} onChange={(event) => update("name", event.target.value)} required />
        </label>
        <label>
          Market position
          <select value={draft.marketPosition} onChange={(event) => update("marketPosition", event.target.value as ServicePackageDraft["marketPosition"])}>
            <option value="good">Good</option>
            <option value="better">Better</option>
            <option value="best">Best</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </label>
        <label>
          Description
          <textarea value={draft.description} onChange={(event) => update("description", event.target.value)} rows={3} required />
        </label>
        <label>
          Target persona
          <input value={draft.targetPersona} onChange={(event) => update("targetPersona", event.target.value)} required />
        </label>
        <label>
          Default SLA tier
          <select value={draft.defaultSlaTier} onChange={(event) => update("defaultSlaTier", event.target.value as ServicePackageDraft["defaultSlaTier"])}>
            <option value="best-effort">Best effort</option>
            <option value="standard">Standard</option>
            <option value="priority">Priority</option>
            <option value="24x7">24x7</option>
          </select>
        </label>
        <label>
          Default support hours
          <select value={draft.defaultSupportHours} onChange={(event) => update("defaultSupportHours", event.target.value as ServicePackageDraft["defaultSupportHours"])}>
            <option value="business-hours">Business hours</option>
            <option value="extended-hours">Extended hours</option>
            <option value="24x7">24x7</option>
          </select>
        </label>
        <label>
          Default exclusions (one per line)
          <textarea value={draft.defaultExclusionsText} onChange={(event) => update("defaultExclusionsText", event.target.value)} rows={4} />
        </label>
        <label>
          <input type="checkbox" checked={draft.includesSecurityBaseline} onChange={(event) => update("includesSecurityBaseline", event.target.checked)} />
          Include security baseline by default
        </label>

        <fieldset>
          <legend>Included services</legend>
          <label><input type="checkbox" checked={draft.includeHelpDesk} onChange={(event) => update("includeHelpDesk", event.target.checked)} /> Managed Help Desk</label><br />
          <label><input type="checkbox" checked={draft.includeEndpointSecurity} onChange={(event) => update("includeEndpointSecurity", event.target.checked)} /> Endpoint Detection and Response</label><br />
          <label><input type="checkbox" checked={draft.includeBackup} onChange={(event) => update("includeBackup", event.target.checked)} /> Backup Monitoring</label><br />
          <label><input type="checkbox" checked={draft.includeMicrosoft365} onChange={(event) => update("includeMicrosoft365", event.target.checked)} /> Microsoft 365 Administration</label><br />
          <label><input type="checkbox" checked={draft.includeNetworkSecurity} onChange={(event) => update("includeNetworkSecurity", event.target.checked)} /> Network Security Monitoring</label>
        </fieldset>

        <div>
          <strong>Selected items:</strong>
          <ul>
            {selectedServices.map((item) => (
              <li key={item.serviceDefinitionId}>{item.serviceDefinitionId}</li>
            ))}
          </ul>
        </div>

        {error ? <p role="alert">{error}</p> : null}
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save and continue"}</button>
      </form>
    </WorkflowShell>
  );
}
