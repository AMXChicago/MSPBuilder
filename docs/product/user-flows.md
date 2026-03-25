# User Flows

## Primary MVP Flow
1. User creates or joins an organization.
2. User completes the founder profile.
3. User defines the business model with MSP/MSSP-specific posture fields.
4. User assembles a service package and its package items.
5. User enters pricing inputs including quantities, billing cadence, cost assumptions, and margin structure.
6. System builds a versioned recommendation scenario.
7. The rules engine evaluates pricing readiness, package completeness, stack fit, and security baseline selection.
8. The API returns normalized context, a unified recommendation result, and detailed explainability.
9. User iterates on business posture, package design, or pricing based on recommendation reasons, positive signals, and risk flags.

## First Recommendation Workflow
This first workflow is a recommendation preview workflow. It does not attempt to automate the entire launch platform yet. Instead, it helps validate whether a proposed MSP/MSSP offer is commercially and operationally coherent.

### Inputs Used
- founder profile snapshot
- business model snapshot
- service package snapshot
- pricing model snapshot
- explicit constraints
- vendor metadata
- baseline options

### Outputs Returned
- normalized `RecommendationContext`
- unified `RecommendationResult`
- detailed pricing readiness output
- detailed package completeness output
- stack-fit shortlist with reasons and score breakdown
- security baseline recommendation with rationale and priority

### How Results Are Interpreted
- `overallScore` shows overall recommendation quality on a 0-100 scale
- `readinessLevel` signals whether the offer is ready for the next planning step
- `riskLevel` highlights operational or commercial exposure
- `confidenceLevel` reflects how complete and internally consistent the current model is

### Explainability Behavior
Every output includes:
- a summary sentence
- explicit reasons
- contributing factors
- positive signals
- negative signals
- a score
- a confidence indicator
- structured detail fields for downstream rendering

## Founder Profile Flow
1. Capture operator background, region, and service motion.
2. Save the profile as recommendation input for an organization.
3. Reuse the profile in recommendation scenarios.

## Business Model Flow
1. Define the offer posture using business type, delivery model, compliance sensitivity, budget positioning, and founder maturity.
2. Add target verticals and company sizes.
3. Persist the model as a reusable planning artifact.

## Service Package Builder Flow
1. Define the package shell with market position, SLA defaults, support-hour defaults, and exclusions.
2. Add package items that declare required services, included quantities, service-level obligations, and priority.
3. Save the package as the operational definition of the offer.

## Pricing Model Flow
1. Attach a pricing model to a service package.
2. Define pricing unit, quantity structure, overage pricing, billing cadence, contract term, passthrough cost, and markup.
3. Persist target and floor margin expectations.
4. Feed the pricing model into the recommendation scenario.
