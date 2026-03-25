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

## Explainability Contract
Every policy result includes:
- `score`
- `confidence`
- `summary`
- `reasons`
- structured output data specific to that policy

This is the explainability contract for the first recommendation workflow. The API preview endpoint simply returns these outputs; it does not reinterpret them.

## Current Policy Families
### Pricing Readiness
Scoring now considers:
- missing required commercial fields
- effective margin vs target and floor
- pricing-unit alignment with package structure
- billing frequency and contract-term coherence
- beginner-operator risk posture

Outputs include:
- readiness boolean
- missing fields
- risk flags
- improvement notes
- effective margin estimate

### Package Completeness
Scoring now considers:
- helpdesk coverage for MSP and co-managed offers
- endpoint or security coverage for security-led contexts
- backup or continuity coverage when compliance or vertical profile requires it
- SLA and support-hour consistency
- dangerous exclusions that create delivery gaps

Outputs include:
- completeness boolean
- missing capabilities
- package risks
- package notes

### Stack Fit
Scoring now weights:
- category fit
- MSSP friendliness
- multi-tenant support
- compliance fit
- package alignment
- budget alignment

Outputs include:
- suggested vendor IDs
- fit notes
- vendor-level score breakdowns with reasons

### Security Baseline Selection
Selection now considers:
- business type
- compliance sensitivity
- target verticals
- package security content
- delivery model implications

Outputs include:
- suggested baseline codes
- rationale
- priority level

## What This Workflow Covers
This first workflow covers recommendation preview for a draft MSP/MSSP offer design. It is intended to answer:
- Is the pricing model commercially coherent enough to proceed?
- Is the package operationally coherent enough to deliver?
- Which core vendors fit this business posture best?
- Which baseline security controls should be prioritized first?

## Design Goal
The rules engine should become the single place where recommendation behavior changes. UI changes should not require recommendation rewrites, and recommendation rewrites should not require UI redesign.

That separation is only possible because the recommendation context is a stable domain input rather than an ad hoc request payload.
