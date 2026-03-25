# User Flows

## Primary MVP Flow
1. User opens the workflow at `/founder`.
2. Web loads saved tenant-scoped state from `GET /workflow/state`.
3. User submits a founder profile to `POST /founder` or `PUT /founder`.
4. User continues to `/business-model` and submits MSP/MSSP posture inputs to `POST /business-model` or `PUT /business-model`.
5. User continues to `/service-package`, loads tenant service definitions from workflow state, and submits package composition to `POST /service-package` or `PUT /service-package`.
6. User continues to `/pricing` and submits pricing inputs to `POST /pricing` or `PUT /pricing`.
7. User reaches `/recommendation`, which calls `GET /recommendation/preview`.
8. API loads persisted workflow records, builds a versioned recommendation scenario, runs the rules engine, persists the recommendation result, and returns the preview.
9. UI renders the unified recommendation result plus grouped explainability by pricing, package, stack, and security.
10. Refreshing any workflow page reloads saved state from persistence rather than losing progress.

## Full MVP Input-to-Recommendation Flow
This first persisted workflow validates that the product can take real MSP/MSSP inputs, save them as tenant-scoped business records, and generate explainable recommendation output from centralized rules and persisted scenarios.

### Step 1: Founder Profile
- Captures operator background, motion, confidence, and technical depth.
- Saves a tenant-scoped founder record.
- Reloads on refresh from persisted state.

### Step 2: Business Model
- Captures business type, target verticals, target company sizes, delivery model, compliance sensitivity, budget positioning, and founder maturity.
- Defines the commercial posture that recommendation policies optimize around.
- Saves a tenant-scoped business model record.

### Step 3: Service Package
- Loads tenant service definitions from the backend.
- Captures package shell details and selected service-definition relationships.
- Saves the service package and its package items with real relational IDs.

### Step 4: Pricing
- Loads the current saved service package from the backend.
- Captures pricing unit, quantity structure, overage handling, billing frequency, term, passthrough cost, and margin expectations.
- Saves pricing aligned to the persisted service package.

### Step 5: Recommendation Preview
- Calls a thin API endpoint rather than UI-side scoring logic.
- Builds recommendation context from persisted workflow records plus tenant reference data.
- Persists `RecommendationScenario`, `RecommendationResultRecord`, and stack-fit output linkage.
- Returns normalized context, unified result, and detailed policy breakdown.

## Tenant Behavior In MVP
- Every workflow request resolves a tenant context.
- In local development, a bootstrap organization and user are created automatically when auth context is absent.
- Real auth will later replace this fallback with membership-backed tenant resolution.

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
- This MVP flow now uses persisted API-backed state rather than in-memory workflow storage.
- It is intended to validate durable tenant-aware recommendation behavior before polished UX and full auth are added.
- The UI still does not contain recommendation logic. It only loads state, posts inputs, and renders response data.
