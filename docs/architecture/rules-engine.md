# Rules Engine

## Purpose
The rules engine is the central place for recommendation and decision logic. It exists to prevent business rules from being scattered across UI components, API routes, or templates.

## Responsibilities
- evaluate recommendation context assembled from domain entities
- score and rank recommendations
- provide explainable rationale for outputs
- enforce pricing and stack guardrails
- stay configuration-driven where possible

## Initial Structure
- `core/types.ts`
  shared engine contracts
- `core/engine.ts`
  policy runner and result aggregation
- `policies/*.policy.ts`
  individual decision policies
- `registry/default-registry.ts`
  prewired engine instances by recommendation family

## Initial Policies
### Pricing Guardrails
- verifies that packages are published with explicit target and floor margins
- returns structured outputs that future UIs can turn into warnings or readiness indicators

### Stack Recommendation
- favors MSP/MSSP-friendly, multi-tenant-capable vendors
- produces rationale and confidence instead of a black-box answer

## Design Rules
- policies accept typed context only
- policies return structured outputs, not rendered strings
- API layer owns loading context; engine owns evaluation
- UI consumes results but never contains the recommendation logic itself

## Future Additions
- package readiness scoring
- onboarding path selection
- security baseline selection by service motion
- upsell recommendations based on package maturity and KPI signals
