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

## Tenant-Aware Workflow Behavior
The active workflow now behaves like a real multi-tenant SaaS path instead of relying on a dev shortcut.

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
- returns grouped reasoning, action items, next steps, and missing-information warnings

## Development Fallback
A development fallback is still available for local work, but it is no longer silent.

It is only allowed when:
- the server is not running in production mode
- `AUTH_ALLOW_DEV_FALLBACK=true`
- the request explicitly opts in to development auth behavior

This keeps local setup practical without letting production requests drift into a fake tenant automatically.

## Future Role Expansion
Current authorization is membership-based. Future role expansion should plug in after authenticated tenant resolution.

Planned extension point:
- resolve session
- resolve membership
- evaluate role policy for route or action
- continue into workflow service

This keeps role-specific authorization separate from both auth verification and business workflow logic.

## Known Limitations
- The web app still needs a real login/session UX wired to these authenticated API requirements.
- Session issuance, logout, and revocation flows are not yet exposed to operators.
- Fine-grained RBAC is not implemented yet beyond membership validation.
