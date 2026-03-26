# User Flows

## Local Founder Workflow
For local development, the founder workflow no longer requires manual header entry in the browser.

Local flow:
1. Developer runs API with `AUTH_ALLOW_DEV_FALLBACK=true` in development mode.
2. Developer runs the web app with `NEXT_PUBLIC_AUTH_ALLOW_DEV_FALLBACK=true`.
3. User opens `/founder`.
4. Frontend initializes development auth through `GET /auth/dev-session`.
5. Frontend stores the returned bearer token and tenant context.
6. Frontend calls:
   - `GET /workflow/state`
   - `POST` / `PUT` workflow routes
   - `GET /recommendation/preview`
   with the required auth headers automatically attached.
7. Founder workflow becomes usable immediately without custom browser setup.

## Authenticated Founder Workflow
In non-development environments, the workflow remains strict.

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
What is enforced:
- unauthenticated requests are rejected
- requests for organizations outside the user membership set are rejected
- workflow state is loaded only for the authenticated tenant
- recommendation preview reads only persisted records for the authenticated tenant
- route handlers do not implement tenant resolution themselves; they rely on one shared auth and membership path

## Development Auth Behavior
Development bootstrap is explicit.

It works only when:
- API runs with `NODE_ENV=development`
- API runs with `AUTH_ALLOW_DEV_FALLBACK=true`
- web runs with `NEXT_PUBLIC_AUTH_ALLOW_DEV_FALLBACK=true`

Production behavior differs:
- `/auth/dev-session` is disabled
- workflow and recommendation routes require real auth
- there is no silent tenant fallback

## Recommendation Review Flow
The recommendation page shows:
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

## Known Limitations
- The web app still needs a real login/session UX for non-development use.
- Session issuance, logout, and revocation flows are not yet exposed to operators beyond development bootstrap.
- Fine-grained RBAC is not implemented yet beyond membership validation.
