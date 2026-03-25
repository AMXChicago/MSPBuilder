const pillars = [
  "Founder profile and operating posture",
  "Service packaging and margin-aware pricing",
  "Vendor stack recommendations driven by rules",
  "Contracts, onboarding assets, and SOP templates",
  "Security baseline planning and KPI tracking"
];

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
          Foundation Scaffold
        </p>
        <h1 style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 0.95, margin: "16px 0 20px" }}>
          MSP/MSSP Launch OS
        </h1>
        <p style={{ maxWidth: 720, color: "var(--muted)", fontSize: 20, lineHeight: 1.6, margin: 0 }}>
          A multi-tenant SaaS foundation for operators who need to design profitable services, choose the right stack,
          standardize delivery, and launch with repeatable operating assets.
        </p>
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
