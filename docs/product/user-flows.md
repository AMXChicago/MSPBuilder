# User Flows

## Authenticated Founder Workflow
1. Operator authenticates and receives a bearer session token.
2. Operator selects an organization context.
3. Client sends workflow requests with:
   - `Authorization: Bearer <token>`
   - `x-organization-id: <organization-id>`
4. API resolves the current user from the session token.
5. API validates that the user belongs to the requested organization.
6. Founder, business model, service package, and pricing records are saved only within that tenant.
7. Recommendation preview rebuilds from persisted records for that same authenticated tenant.

## Improved Recommendation Review Flow
The recommendation page is now meant to help an internal operator or founder answer a practical question: “Are we launch-ready, and what should we do next?”

The page now shows:
- overall score
- readiness level
- risk level
- confidence
- launch summary
- launch blockers
- launch accelerators
- next three actions
- top stack choices with fit reasons and tradeoffs
- structured explainability grouped by pricing, package, stack, security, and launch

## Tenant-Aware Workflow Behavior
The active workflow behaves like a real multi-tenant SaaS path instead of relying on a dev shortcut.

What is enforced:
- unauthenticated requests are rejected
- requests for organizations outside the user membership set are rejected
- workflow state is loaded only for the authenticated tenant
- recommendation preview reads only persisted records for the authenticated tenant
- route handlers do not implement tenant resolution themselves; they rely on one shared auth and membership path

## Recommendation Preview Behavior
Recommendation preview remains read-mostly and explainable.

For an authenticated tenant, the API:
- loads the latest persisted founder workflow records
- builds a recommendation scenario snapshot
- runs the rules engine
- persists the recommendation scenario and unified result
- returns launch-readiness interpretation plus structured explanation items

## Explainability Structure
Recommendation output is now easier to review internally because major findings are structured instead of only being freeform strings.

Each explanation item includes:
- category
- impact
- message
- recommended action

This lets the frontend group recommendation output cleanly without embedding business logic in the UI.

## Launch Readiness Interpretation
The aggregated result now interprets the recommendation for operators.

It answers:
- how strong the current launch posture is
- what is blocking launch
- what is accelerating launch
- which three actions matter most next

This is especially important for internal founder testing because a score alone is not actionable enough.

## Development Fallback
A development fallback is still available for local work, but it is no longer silent.

It is only allowed when:
- the server is not running in production mode
- `AUTH_ALLOW_DEV_FALLBACK=true`
- the request explicitly opts in to development auth behavior

## Future Role Expansion
Current authorization is membership-based. Future role expansion should plug in after authenticated tenant resolution.

Planned extension point:
- resolve session
- resolve membership
- evaluate role policy for route or action
- continue into workflow service

## Known Limitations
- Vendor-fit still uses seeded vendor intelligence rather than a larger curated catalog.
- The web app still needs a real login/session UX wired to these authenticated API requirements.
- Session issuance, logout, and revocation flows are not yet exposed to operators.
- Fine-grained RBAC is not implemented yet beyond membership validation.
