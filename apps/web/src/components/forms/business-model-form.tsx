"use client";

import { useState, type FormEvent } from "react";
import { Field, FormShell, buttonStyle, inputStyle } from "./form-shell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function BusinessModelForm() {
  const [result, setResult] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      organizationId: formData.get("organizationId"),
      name: formData.get("name"),
      businessType: formData.get("businessType"),
      targetVerticals: String(formData.get("targetVerticals")).split(",").map((value) => value.trim()).filter(Boolean),
      targetCompanySizes: String(formData.get("targetCompanySizes")).split(",").map((value) => value.trim()).filter(Boolean),
      deliveryModel: formData.get("deliveryModel"),
      complianceSensitivity: formData.get("complianceSensitivity"),
      budgetPositioning: formData.get("budgetPositioning"),
      founderMaturity: formData.get("founderMaturity"),
      revenueStrategy: formData.get("revenueStrategy"),
      targetGrossMarginPercent: Number(formData.get("targetGrossMarginPercent")),
      currencyCode: "USD",
      status: "draft"
    };

    const response = await fetch(`${API_URL}/internal/business-model`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setResult(JSON.stringify(await response.json(), null, 2));
  }

  return (
    <FormShell title="Business Model" description="Define the operating posture that makes an MSP/MSSP offer meaningfully different.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <Field label="Organization ID"><input name="organizationId" defaultValue="demo-org" style={inputStyle} /></Field>
        <Field label="Model Name"><input name="name" defaultValue="Security-led SMB Hybrid" style={inputStyle} /></Field>
        <Field label="Business Type"><select name="businessType" defaultValue="hybrid" style={inputStyle}><option value="msp">MSP</option><option value="mssp">MSSP</option><option value="hybrid">Hybrid</option><option value="co-managed">Co-Managed</option></select></Field>
        <Field label="Target Verticals (comma separated)"><input name="targetVerticals" defaultValue="Healthcare, Professional Services" style={inputStyle} /></Field>
        <Field label="Target Company Sizes (comma separated)"><input name="targetCompanySizes" defaultValue="25-100 employees, 100-250 employees" style={inputStyle} /></Field>
        <Field label="Delivery Model"><select name="deliveryModel" defaultValue="hybrid" style={inputStyle}><option value="remote">Remote</option><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="co-managed">Co-Managed</option></select></Field>
        <Field label="Compliance Sensitivity"><select name="complianceSensitivity" defaultValue="high" style={inputStyle}><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option><option value="regulated">Regulated</option></select></Field>
        <Field label="Budget Positioning"><select name="budgetPositioning" defaultValue="premium" style={inputStyle}><option value="budget">Budget</option><option value="mainstream">Mainstream</option><option value="premium">Premium</option><option value="enterprise">Enterprise</option></select></Field>
        <Field label="Founder Maturity"><select name="founderMaturity" defaultValue="experienced-builder" style={inputStyle}><option value="new-operator">New Operator</option><option value="experienced-builder">Experienced Builder</option><option value="scale-ready">Scale Ready</option></select></Field>
        <Field label="Revenue Strategy"><select name="revenueStrategy" defaultValue="recurring" style={inputStyle}><option value="recurring">Recurring</option><option value="hybrid">Hybrid</option><option value="project-first">Project First</option></select></Field>
        <Field label="Target Gross Margin %"><input name="targetGrossMarginPercent" type="number" defaultValue={62} style={inputStyle} /></Field>
        <button type="submit" style={buttonStyle}>Save Business Model</button>
      </form>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
    </FormShell>
  );
}
