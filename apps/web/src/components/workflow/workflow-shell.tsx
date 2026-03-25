import Link from "next/link";
import type { ReactNode } from "react";

interface WorkflowShellProps {
  title: string;
  description: string;
  currentStep: string;
  children: ReactNode;
}

const steps = [
  { href: "/founder", label: "Founder" },
  { href: "/business-model", label: "Business Model" },
  { href: "/service-package", label: "Service Package" },
  { href: "/pricing", label: "Pricing" },
  { href: "/recommendation", label: "Recommendation" }
];

export function WorkflowShell({ title, description, currentStep, children }: WorkflowShellProps) {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 56px" }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {steps.map((step) => (
          <Link
            key={step.href}
            href={step.href}
            style={{
              fontWeight: currentStep === step.label ? 700 : 400,
              textDecoration: "underline",
              color: "inherit"
            }}
          >
            {step.label}
          </Link>
        ))}
      </nav>
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </main>
  );
}
