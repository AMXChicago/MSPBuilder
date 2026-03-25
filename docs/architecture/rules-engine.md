# Rules Engine

## Purpose
The rules engine is the central place for recommendation and decision logic. It exists to prevent business rules from being scattered across UI components, API routes, or template metadata.

## Core Input Rule
Policies do not accept UI-facing form payloads. Policies accept a domain-level `RecommendationContext` built from a persisted recommendation scenario plus supporting catalogs.

That is the critical correction in this pass.

## RecommendationContext
The strengthened `RecommendationContext` now contains:
- `contextVersion`
- `rulesVersion`
- `founderProfile` snapshot
- `businessModel` snapshot
- `servicePackage` snapshot
- `pricingModel` snapshot
- `constraints`
- vendor catalog entries
- vendor cost profiles
- baseline options
- generation timestamp

This shape exists so future scoring can remain stable even when frontend forms, API payloads, or live records evolve.

## Why Snapshot-Based Inputs Matter
Without snapshot-based inputs, recommendations become hard to trust:
- historical outputs can silently drift as source records change
- debugging rule behavior becomes harder
- A/B comparison of rule versions becomes unreliable
- recommendation outputs become coupled to UI data contracts

By using scenario snapshots, the engine can evolve independently from the UI.

## Policy Contract
Every policy follows the same rule:
- accept `RecommendationContext`
- return structured `RecommendationResult<T>`
- avoid side effects
- avoid direct persistence dependencies
- avoid any dependency on frontend form shape

## Current Policy Families
### Pricing Readiness
Consumes pricing model snapshots and checks whether enough cost and quantity structure exists to support future margin analysis.

### Package Completeness
Consumes service package snapshots and checks whether the package composition is detailed enough to score.

### Stack Fit
Consumes business posture, package composition, pricing structure, and constraints to prepare future vendor-fit scoring.

### Security Baseline Selection
Consumes compliance and delivery constraints to prepare future baseline selection logic.

## Design Goal
The rules engine should become the single place where recommendation behavior changes. UI changes should not require recommendation rewrites, and recommendation rewrites should not require UI redesign.

That separation is only possible because the recommendation context is now a stable domain input rather than an ad hoc request payload.
