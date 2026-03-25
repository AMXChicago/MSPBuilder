# Rules Engine

## Purpose
The rules engine is the central place for recommendation and decision logic. It exists to prevent business rules from being scattered across UI components, API routes, or template metadata.

## Core Input Rule
Policies do not accept UI-facing form payloads. Policies accept a domain-level `RecommendationContext` built from a persisted recommendation scenario plus supporting catalogs.

That remains the critical architectural rule for this workflow.

## Scoring Philosophy
This first usable recommendation workflow is heuristic-driven, explicit, and explainable.

The engine does not try to hide its reasoning behind opaque scoring. Instead, each policy:
- evaluates one recommendation concern
- produces a numeric score
- returns a confidence value
- returns a short summary
- returns concrete reasons tied to the input context
- returns contributing factors plus positive and negative signals
- returns structured details that future UI and reporting layers can render directly

The goal is not perfect recommendation science in the first pass. The goal is dependable, inspectable decision support that is materially sensitive to MSP/MSSP operating inputs.

## RecommendationContext
The strengthened `RecommendationContext` contains:
- `contextVersion`
- `rulesVersion`
- optional founder profile snapshot
- business model snapshot
- service package snapshot
- pricing model snapshot
- explicit constraints
- vendor catalog entries
- vendor cost profiles
- baseline options
- generation timestamp

This shape exists so future scoring can remain stable even when frontend forms, API payloads, or live records evolve.

## Unified Result Model
The engine now produces a unified `UnifiedRecommendationResult` that aggregates all policy outputs into one decision object.

It includes:
- `overallScore`
- `readinessLevel`
- `riskLevel`
- `confidenceLevel`
- `confidenceScore`
- weighted policy summaries for pricing, package completeness, stack fit, and security baseline
- aggregate explainability fields

This is the model the API should hand to any future UI.

## Explainability Contract
Every policy result includes:
- `score`
- `confidence`
- `summary`
- `reasons`
- `contributingFactors`
- `positiveSignals`
- `negativeSignals`
- structured output data specific to that policy

The unified recommendation result then merges those signals into one aggregate explainability block.

## Weighted Aggregation
Overall scoring uses configurable weights.

Default weights:
- pricing readiness: `0.30`
- package completeness: `0.25`
- stack fit: `0.30`
- security baseline: `0.15`

This weighting biases the recommendation toward commercial viability and stack suitability while still accounting for operational completeness and baseline security posture.

## Interpreting Results
### Overall Score
A 0-100 weighted score representing the combined recommendation quality of the draft offer.

### Readiness Level
- `high`: the draft is broadly coherent and usable for the next planning step
- `medium`: the draft is promising but still has notable issues
- `low`: the draft has major gaps that should be resolved before relying on recommendations

### Risk Level
Risk is driven by negative signals and critical failures in pricing or package completeness.

### Confidence Level
Confidence is derived from policy confidence plus the completeness and consistency of the input model.

## Current Policy Families
### Pricing Readiness
Scoring now considers:
- missing required commercial fields
- effective margin vs target and floor
- pricing-unit alignment with package structure
- billing frequency and contract-term coherence
- beginner-operator risk posture

### Package Completeness
Scoring now considers:
- helpdesk coverage for MSP and co-managed offers
- endpoint or security coverage for security-led contexts
- backup or continuity coverage when compliance or vertical profile requires it
- SLA and support-hour consistency
- dangerous exclusions that create delivery gaps

### Stack Fit
Scoring now weights:
- category fit
- MSSP friendliness
- multi-tenant support
- compliance fit
- package alignment
- budget alignment

### Security Baseline Selection
Selection now considers:
- business type
- compliance sensitivity
- target verticals
- package security content
- delivery model implications

## API Mapping
The preview API returns:
- normalized recommendation context
- unified recommendation result
- detailed policy breakdown

This keeps API integration thin while preserving full explainability.

## Design Goal
The rules engine should become the single place where recommendation behavior changes. UI changes should not require recommendation rewrites, and recommendation rewrites should not require UI redesign.

That separation is only possible because the recommendation context is a stable domain input rather than an ad hoc request payload.
