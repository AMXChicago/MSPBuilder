const pillars = [
  "Founder profile and operating posture",
  "Service packaging and margin-aware pricing",
  "Vendor stack recommendations driven by rules",
  "Contracts, onboarding assets, and SOP templates",
  "Security baseline planning and KPI tracking"
];

const internalLinks = [
  ["/internal", "Internal Validation"],
  ["/internal/founder-profile", "Founder Profile"],
  ["/internal/business-model", "Business Model"],
  ["/internal/service-package", "Service Package"],
  ["/internal/pricing-input", "Pricing Input"]
] as const;

export default function HomePage() {
  return (
    <main
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "64px 24px 96px"
      }}
    >
      <section
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 28,
          boxShadow: "var(--shadow)",
          backdropFilter: "blur(14px)",
          padding: 40
        }}
      >
        <p style={{ color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          First Product Slice
        </p>
        <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.95, margin: "16px 0 20px" }}>
          MSP/MSSP Launch OS
        </h1>
        <p style={{ maxWidth: 720, color: "var(--muted)", fontSize: 20, lineHeight: 1.6, margin: 0 }}>
          The repo now includes real offer-design primitives for founder posture, business model, package composition,
          pricing inputs, and recommendation-context previews.
        </p>
      </section>

      <section style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
        {internalLinks.map(([href, label]) => (
          <a key={href} href={href} style={{ padding: "10px 14px", borderRadius: 999, background: "rgba(255,255,255,0.82)", border: "1px solid var(--border)" }}>
            {label}
          </a>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 18,
          marginTop: 28
        }}
      >
        {pillars.map((pillar) => (
          <article
            key={pillar}
            style={{
              background: "rgba(255,255,255,0.74)",
              border: "1px solid var(--border)",
              borderRadius: 22,
              padding: 22
            }}
          >
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>{pillar}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
