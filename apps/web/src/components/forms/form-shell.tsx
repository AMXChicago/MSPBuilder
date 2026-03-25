"use client";

import type { ReactNode } from "react";

export function FormShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section
      style={{
        maxWidth: 860,
        margin: "32px auto",
        padding: 24,
        border: "1px solid var(--border)",
        borderRadius: 18,
        background: "rgba(255,255,255,0.82)"
      }}
    >
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{description}</p>
      <div style={{ display: "grid", gap: 14 }}>{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

export const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(31, 42, 55, 0.2)",
  font: "inherit",
  width: "100%"
} as const;

export const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  background: "#0d6b68",
  color: "white",
  font: "inherit",
  cursor: "pointer"
} as const;
