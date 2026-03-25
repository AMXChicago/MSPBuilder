"use client";

import { useState, type FormEvent } from "react";
import { Field, FormShell, buttonStyle, inputStyle } from "./form-shell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function PricingInputForm() {
  const [result, setResult] = useState<string>("");
  const [preview, setPreview] = useState<string>("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      organizationId: formData.get("organizationId"),
      servicePackageId: formData.get("servicePackageId"),
      pricingUnit: formData.get("pricingUnit"),
      currencyCode: "USD",
      monthlyBasePrice: Number(formData.get("monthlyBasePrice")),
      onboardingFee: Number(formData.get("onboardingFee")),
      minimumQuantity: Number(formData.get("minimumQuantity")),
      includedQuantity: Number(formData.get("includedQuantity")),
      overageUnitPrice: Number(formData.get("overageUnitPrice")),
      billingFrequency: formData.get("billingFrequency"),
      contractTermMonths: Number(formData.get("contractTermMonths")),
      marginBehavior: formData.get("marginBehavior"),
      targetMarginPercent: Number(formData.get("targetMarginPercent")),
      floorMarginPercent: Number(formData.get("floorMarginPercent"))
    };

    const response = await fetch(`${API_URL}/internal/pricing-input`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setResult(JSON.stringify(await response.json(), null, 2));
  }

  async function fetchPreview() {
    const response = await fetch(`${API_URL}/internal/recommendation-context-preview?organizationId=demo-org`);
    setPreview(JSON.stringify(await response.json(), null, 2));
  }

  return (
    <FormShell title="Pricing Input" description="Capture pricing mechanics and preview the recommendation context generated from the current draft state.">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
        <Field label="Organization ID"><input name="organizationId" defaultValue="demo-org" style={inputStyle} /></Field>
        <Field label="Service Package ID"><input name="servicePackageId" defaultValue="package-placeholder" style={inputStyle} /></Field>
        <Field label="Pricing Unit"><select name="pricingUnit" defaultValue="per-device" style={inputStyle}><option value="per-user">Per User</option><option value="per-device">Per Device</option><option value="per-location">Per Location</option><option value="per-tenant">Per Tenant</option><option value="flat-rate">Flat Rate</option></select></Field>
        <Field label="Monthly Base Price"><input name="monthlyBasePrice" type="number" defaultValue={89} style={inputStyle} /></Field>
        <Field label="Onboarding Fee"><input name="onboardingFee" type="number" defaultValue={1500} style={inputStyle} /></Field>
        <Field label="Minimum Quantity"><input name="minimumQuantity" type="number" defaultValue={25} style={inputStyle} /></Field>
        <Field label="Included Quantity"><input name="includedQuantity" type="number" defaultValue={25} style={inputStyle} /></Field>
        <Field label="Overage Unit Price"><input name="overageUnitPrice" type="number" defaultValue={7} style={inputStyle} /></Field>
        <Field label="Billing Frequency"><select name="billingFrequency" defaultValue="monthly" style={inputStyle}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select></Field>
        <Field label="Contract Term Months"><input name="contractTermMonths" type="number" defaultValue={12} style={inputStyle} /></Field>
        <Field label="Margin Behavior"><select name="marginBehavior" defaultValue="markup" style={inputStyle}><option value="passthrough">Passthrough</option><option value="markup">Markup</option><option value="blended">Blended</option></select></Field>
        <Field label="Target Margin %"><input name="targetMarginPercent" type="number" defaultValue={65} style={inputStyle} /></Field>
        <Field label="Floor Margin %"><input name="floorMarginPercent" type="number" defaultValue={48} style={inputStyle} /></Field>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" style={buttonStyle}>Save Pricing Input</button>
          <button type="button" onClick={fetchPreview} style={buttonStyle}>Fetch Recommendation Preview</button>
        </div>
      </form>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{result}</pre>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{preview}</pre>
    </FormShell>
  );
}
