"use client";

import { useState, type FormEvent } from "react";
import { Field, FormShell, buttonStyle, inputStyle } from "./form-shell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function FounderProfileForm() {
  const [result, setResult] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      organizationId: formData.get("organizationId"),
      userId: formData.get("userId"),
      fullName: formData.get("fullName"),
      roleTitle: formData.get("roleTitle"),
      priorExperienceYears: Number(formData.get("priorExperienceYears")),
      targetGeo: formData.get("targetGeo"),
      serviceMotion: formData.get("serviceMotion"),
      maturityLevel: formData.get("maturityLevel"),
      salesConfidence: Number(formData.get("salesConfidence")),
      technicalDepth: Number(formData.get("technicalDepth")),
      preferredEngagementModel: formData.get("preferredEngagementModel")
    };

    const response = await fetch(`${API_URL}/internal/founder-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setResult(JSON.stringify(await response.json(), null, 2));
  }

  return (
    <FormShell title="Founder Profile" description="Capture operator-specific inputs that will shape recommendations later.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <Field label="Organization ID"><input name="organizationId" defaultValue="demo-org" style={inputStyle} /></Field>
        <Field label="User ID"><input name="userId" defaultValue="demo-user" style={inputStyle} /></Field>
        <Field label="Full Name"><input name="fullName" defaultValue="Alex Founder" style={inputStyle} /></Field>
        <Field label="Role Title"><input name="roleTitle" defaultValue="Founder / Operator" style={inputStyle} /></Field>
        <Field label="Experience Years"><input name="priorExperienceYears" type="number" defaultValue={8} style={inputStyle} /></Field>
        <Field label="Target Geography"><input name="targetGeo" defaultValue="United States" style={inputStyle} /></Field>
        <Field label="Service Motion"><select name="serviceMotion" defaultValue="managed-services" style={inputStyle}><option value="managed-services">Managed Services</option><option value="project-led">Project Led</option><option value="security-led">Security Led</option><option value="hybrid">Hybrid</option></select></Field>
        <Field label="Maturity Level"><select name="maturityLevel" defaultValue="growing" style={inputStyle}><option value="new">New</option><option value="growing">Growing</option><option value="established">Established</option></select></Field>
        <Field label="Sales Confidence (1-10)"><input name="salesConfidence" type="number" min={1} max={10} defaultValue={6} style={inputStyle} /></Field>
        <Field label="Technical Depth (1-10)"><input name="technicalDepth" type="number" min={1} max={10} defaultValue={8} style={inputStyle} /></Field>
        <Field label="Engagement Model"><select name="preferredEngagementModel" defaultValue="owner-operator" style={inputStyle}><option value="fractional-founder">Fractional Founder</option><option value="owner-operator">Owner Operator</option><option value="team-led">Team Led</option></select></Field>
        <button type="submit" style={buttonStyle}>Save Founder Profile</button>
      </form>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
    </FormShell>
  );
}
