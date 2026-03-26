import type { ReactNode } from "react";

interface WorkflowShellProps {
  title: string;
  description: string;
  currentStep: string;
  children: ReactNode;
  savedStateLabel?: string;
}

const steps = [
  { href: "/founder", label: "Founder" },
  { href: "/business-model", label: "Business Model" },
  { href: "/service-package", label: "Service Package" },
  { href: "/pricing", label: "Pricing" },
  { href: "/recommendation", label: "Recommendation" }
] as const;

export function WorkflowShell({ title, description, currentStep, children, savedStateLabel }: WorkflowShellProps) {
  const currentIndex = Math.max(steps.findIndex((step) => step.label === currentStep), 0);
  const progressPercent = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 56px" }}>
      <p>Step {currentIndex + 1} of {steps.length}</p>
      <div aria-hidden="true" style={{ width: "100%", height: 8, background: "#ddd", marginBottom: 16 }}>
        <div style={{ width: `${progressPercent}%`, height: 8, background: "#222" }} />
      </div>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {steps.map((step, index) => (
          <a
            key={step.href}
            href={step.href}
            style={{
              fontWeight: currentStep === step.label ? 700 : 400,
              textDecoration: "underline",
              color: "inherit"
            }}
          >
            {index + 1}. {step.label}
          </a>
        ))}
      </nav>
      <h1>{title}</h1>
      <p>{description}</p>
      <p>{savedStateLabel ?? "Progress is saved to the backend when you submit each step."}</p>
      {children}
    </main>
  );
}
