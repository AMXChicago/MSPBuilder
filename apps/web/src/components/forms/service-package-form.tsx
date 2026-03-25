"use client";

import { useState, type FormEvent } from "react";
import { Field, FormShell, buttonStyle, inputStyle } from "./form-shell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function ServicePackageForm() {
  const [result, setResult] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      organizationId: formData.get("organizationId"),
      name: formData.get("name"),
      marketPosition: formData.get("marketPosition"),
      description: formData.get("description"),
      targetPersona: formData.get("targetPersona"),
      includesSecurityBaseline: formData.get("includesSecurityBaseline") === "on",
      slaTier: formData.get("slaTier"),
      supportHours: formData.get("supportHours"),
      exclusions: String(formData.get("exclusions")).split("\n").map((value) => value.trim()).filter(Boolean),
      status: "draft",
      items: [
        {
          serviceDefinitionId: formData.get("serviceDefinitionId"),
          requirement: formData.get("requirement"),
          includedQuantity: Number(formData.get("includedQuantity")),
          quantityUnit: formData.get("quantityUnit"),
          limitSummary: formData.get("limitSummary") || undefined,
          notes: formData.get("notes") || undefined,
          sortOrder: 0
        }
      ]
    };

    const response = await fetch(`${API_URL}/internal/service-package`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setResult(JSON.stringify(await response.json(), null, 2));
  }

  return (
    <FormShell title="Service Package Builder" description="Model the actual offer shape, including SLA posture, support window, exclusions, and package item composition.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <Field label="Organization ID"><input name="organizationId" defaultValue="demo-org" style={inputStyle} /></Field>
        <Field label="Package Name"><input name="name" defaultValue="Security Core" style={inputStyle} /></Field>
        <Field label="Market Position"><select name="marketPosition" defaultValue="better" style={inputStyle}><option value="good">Good</option><option value="better">Better</option><option value="best">Best</option><option value="enterprise">Enterprise</option></select></Field>
        <Field label="Description"><textarea name="description" defaultValue="Managed security-first support package for regulated SMBs." style={{ ...inputStyle, minHeight: 84 }} /></Field>
        <Field label="Target Persona"><input name="targetPersona" defaultValue="SMB operations leader" style={inputStyle} /></Field>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="includesSecurityBaseline" defaultChecked /> Includes security baseline</label>
        <Field label="SLA Tier"><select name="slaTier" defaultValue="priority" style={inputStyle}><option value="best-effort">Best Effort</option><option value="business-hours">Business Hours</option><option value="priority">Priority</option><option value="24x7">24x7</option></select></Field>
        <Field label="Support Hours"><select name="supportHours" defaultValue="24x7" style={inputStyle}><option value="business-hours">Business Hours</option><option value="extended-hours">Extended Hours</option><option value="24x7">24x7</option></select></Field>
        <Field label="Exclusions (one per line)"><textarea name="exclusions" defaultValue={"Project labor\nThird-party app customization"} style={{ ...inputStyle, minHeight: 84 }} /></Field>
        <Field label="Primary Service Definition ID"><input name="serviceDefinitionId" defaultValue="svc-edr" style={inputStyle} /></Field>
        <Field label="Requirement"><select name="requirement" defaultValue="required" style={inputStyle}><option value="required">Required</option><option value="optional">Optional</option></select></Field>
        <Field label="Included Quantity"><input name="includedQuantity" type="number" defaultValue={1} style={inputStyle} /></Field>
        <Field label="Quantity Unit"><input name="quantityUnit" defaultValue="device" style={inputStyle} /></Field>
        <Field label="Limit Summary"><input name="limitSummary" defaultValue="Up to 250 covered devices" style={inputStyle} /></Field>
        <Field label="Notes"><textarea name="notes" defaultValue="Additional services can be attached later as optional add-ons." style={{ ...inputStyle, minHeight: 84 }} /></Field>
        <button type="submit" style={buttonStyle}>Save Service Package</button>
      </form>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
    </FormShell>
  );
}
