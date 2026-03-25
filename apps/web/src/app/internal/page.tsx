import Link from "next/link";

const links = [
  { href: "/internal/founder-profile", label: "Founder Profile" },
  { href: "/internal/business-model", label: "Business Model" },
  { href: "/internal/service-package", label: "Service Package Builder" },
  { href: "/internal/pricing-input", label: "Pricing Input" }
];

export default function InternalIndexPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <h1>Internal Validation Pages</h1>
      <p style={{ color: "var(--muted)" }}>Use these lightweight forms to validate the founder, business, package, pricing, and recommendation-context model.</p>
      <div style={{ display: "grid", gap: 12 }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} style={{ padding: 16, borderRadius: 14, border: "1px solid var(--border)", background: "rgba(255,255,255,0.82)" }}>
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
