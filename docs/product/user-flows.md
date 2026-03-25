# User Flows

## Primary MVP Flow
1. User opens the workflow at `/founder`.
2. User submits a founder profile to `POST /founder`.
3. User continues to `/business-model` and submits MSP/MSSP posture inputs to `POST /business-model`.
4. User continues to `/service-package` and defines a minimal package composition that is sent to `POST /service-package`.
5. User continues to `/pricing` and submits pricing inputs to `POST /pricing`.
6. User reaches `/recommendation`, which calls `GET /recommendation/preview?organizationId=...`.
7. API builds a normalized `RecommendationContext` from the saved records.
8. Rules engine evaluates pricing readiness, package completeness, stack fit, and security baseline selection.
9. UI renders the unified recommendation result plus grouped explainability by pricing, package, stack, and security.

## Full MVP Input-to-Recommendation Flow
This first end-to-end workflow is intentionally narrow. Its purpose is to validate that the product can take real MSP/MSSP inputs, normalize them through the API, and return recommendation output from the centralized rules engine.

### Step 1: Founder Profile
- Captures operator background, motion, confidence, and technical depth.
- Establishes context for recommendation interpretation.
- Saves a reusable founder record for the organization.

### Step 2: Business Model
- Captures business type, target verticals, target company sizes, delivery model, compliance sensitivity, budget positioning, and founder maturity.
- Defines the commercial posture that recommendation policies optimize around.
- Saves a business model draft for the organization.

### Step 3: Service Package
- Captures package shell details and included services.
- Produces a package composition that policy logic can evaluate for operational coherence.
- Saves the package as the offer definition used by the recommendation context.

### Step 4: Pricing
- Captures pricing unit, quantity structure, overage handling, billing frequency, term, passthrough cost, and margin expectations.
- Produces the commercial input set for pricing readiness.
- Saves pricing aligned to the selected service package.

### Step 5: Recommendation Preview
- Calls a thin API endpoint rather than UI-side scoring logic.
- Returns normalized `RecommendationContext`, unified result, and detailed policy breakdown.
- Shows `overallScore`, `readinessLevel`, `riskLevel`, aggregate summary, reasons, vendor suggestions, baseline suggestions, and grouped explainability.

## Explainability Behavior
The recommendation page groups policy output into four sections:
- pricing
- package
- stack
- security

Each group shows:
- summary
- reasons
- positive signals
- negative signals

The aggregate result also shows:
- overall score
- readiness level
- risk level
- top-level summary
- top-level reasons

## Workflow Boundaries
- This MVP flow uses simple forms and an in-memory API store.
- It is intended to validate end-to-end recommendation behavior before persistence, auth, and polished UX are added.
- The UI does not contain recommendation logic. It only collects inputs, posts them to the API, and renders response data.
