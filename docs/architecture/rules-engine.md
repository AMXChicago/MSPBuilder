# Rules Engine

## Purpose
The rules engine is the central place for recommendation and decision logic. It exists to prevent business rules from being scattered across UI components, API routes, or templates.

## Responsibilities
- evaluate typed recommendation context assembled from founder, business, package, pricing, vendor, and baseline inputs
- score and rank recommendations
- provide explainable rationale for outputs
- support readiness checks before full recommendation generation
- stay configuration-driven where possible

## Recommendation Context
The richer `RecommendationContext` now includes:
- founder profile
- business model posture
- service package
- service package items
- pricing input
- vendor metadata and vendor cost profiles
- available security baseline options
- generation timestamp

This structure exists so the rules engine can reason about actual offer design instead of generic account metadata.

## Initial Structure
- `core/types.ts`
  shared engine contracts and richer context shape
- `core/engine.ts`
  policy runner and result aggregation
- `policies/*.policy.ts`
  individual policy stubs by recommendation family
- `registry/default-registry.ts`
  prewired engine instances by recommendation family

## Policy Families Added In This Pass
### Pricing Readiness
Validates whether enough pricing inputs exist to run pricing guardrails and downstream recommendation logic.

### Package Completeness
Checks whether a service package is sufficiently composed to evaluate offer readiness.

### Stack Fit Scoring
Defines the structure for vendor fit scoring based on business posture, package design, and pricing context.

### Security Baseline Selection
Defines the structure for choosing baseline controls based on offer type and sensitivity.

## Why These Policies Exist Now
These policies are intentionally stubbed instead of fully implemented so the architecture can prove:
- recommendation context is complete enough
- the API can preview recommendation inputs and outputs
- future scoring logic has stable boundaries

## Design Rules
- policies accept typed context only
- policies return structured outputs, not rendered strings
- API layer owns loading and snapshotting context; engine owns evaluation
- UI consumes previews and results but never contains recommendation logic itself
- recommendation scenarios should persist the exact inputs used for evaluation

## Future Additions
- package readiness scoring by service coverage archetype
- vertical-aware stack scoring
- co-managed delivery adjustments
- compliance-sensitive security baseline branching
- pricing health checks against vendor cost assumptions
