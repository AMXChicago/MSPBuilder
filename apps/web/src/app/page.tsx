import Link from "next/link";

const steps = [
  { href: "/founder", label: "Founder" },
  { href: "/business-model", label: "Business Model" },
  { href: "/service-package", label: "Service Package" },
  { href: "/pricing", label: "Pricing" },
  { href: "/recommendation", label: "Recommendation" }
];

export default function HomePage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 56px" }}>
      <h1>MSP/MSSP Launch OS</h1>
      <p>Minimal MVP flow for validating founder, business model, package, pricing, and recommendation output.</p>
      <ol>
        {steps.map((step) => (
          <li key={step.href}>
            <Link href={step.href}>{step.label}</Link>
          </li>
        ))}
      </ol>
      <p>
        Start at <Link href="/founder">/founder</Link> to walk the full input-to-recommendation workflow.
      </p>
    </main>
  );
}
