# User Flows

## Persisted Founder Workflow
1. Operator starts at `/founder`.
2. Page loads the saved tenant workflow state from `GET /workflow/state`.
3. Founder profile is saved with `POST /founder` or `PUT /founder`.
4. Business model is saved with `POST /business-model` or `PUT /business-model`.
5. Service package is saved with `POST /service-package` or `PUT /service-package`.
6. Pricing is saved with `POST /pricing` or `PUT /pricing`.
7. Recommendation page calls `GET /recommendation/preview`.
8. API rebuilds preview output from persisted records, persists the scenario/result, and returns the latest explainable recommendation.

## Operator Testing Goals
This flow is now designed for real internal testing, not just architecture validation.

What should work reliably:
- each step reloads previously saved state
- saves update existing tenant records cleanly
- refresh does not lose progress
- back and forward navigation preserve the saved workflow record set
- recommendation preview always reflects the latest saved backend state

## Recommendation Preview Behavior
Recommendation output now emphasizes operator readability.

The page shows:
- overall score
- readiness level
- risk level
- confidence level and score
- summary
- missing-information warnings when the workflow is incomplete
- grouped reasons by pricing, package, stack, and security
- top action items
- recommended next steps

## Missing Information Handling
If key workflow inputs are incomplete or inconsistent, the preview now:
- lists missing sections
- shows warning messages
- lowers confidence
- prevents the summary from sounding falsely launch-ready

This is important because internal operators need to know when the preview is incomplete versus when the business design is genuinely weak.

## Tenant-Aware Flow Behavior
- Every request resolves a tenant context.
- Tenant context can come from headers or a local development bootstrap fallback.
- All saved records belong to one organization.
- Workflow state and recommendation preview are always loaded for the active tenant only.

## Known Limitations
- The current UX is intentionally plain and does not yet include production-ready operator ergonomics.
- Auth-backed tenant resolution is not integrated yet.
- Recommendation history views and scenario comparison are still pending.
- Vendor suggestions are explainable, but the current UI still keeps the presentation minimal.
