# System Design

## Architecture Summary
The current MVP runs as a TypeScript monorepo with a thin Next.js workflow UI, a Fastify API, a centralized rules engine, and Prisma-backed persistence. The active founder workflow is now authenticated, membership-scoped, and persisted for reloadable multi-tenant use.

## Authentication Approach
The API now uses Prisma-backed bearer sessions for authenticated access.

Why this approach fits the repo now:
- simple enough to implement and test without introducing a full identity platform immediately
- production-appropriate because requests identify a real user by a revocable, expiring session token instead of trusting headers for identity
- maintainable because the session lookup and tenant resolution logic is centralized and can later be replaced with SSO, magic-link, or external IdP verification without rewriting workflow handlers

Current auth primitives:
- `User` remains the identity root
- `OrganizationMember` remains the membership source of truth
- `UserSession` stores hashed bearer tokens, expiration, revocation, and last-used tracking

## Runtime Responsibilities
### Web
- calls authenticated workflow endpoints
- will eventually attach a bearer token and active organization context
- does not contain recommendation or tenant-authorization logic

### API
- authenticates bearer session tokens
- resolves organization membership from the authenticated user plus the requested organization context
- rejects unauthenticated or cross-tenant access before workflow handlers run
- validates input with zod
- uses application services to coordinate repository calls and recommendation generation
- returns standardized `{ ok, data }` success envelopes and structured error responses

### Rules Engine
- consumes normalized `RecommendationContext`
- produces pricing, package, stack, and security outputs
- aggregates them into one result with score, readiness, risk, confidence, missing-information warnings, action items, and next steps

### Database Layer
- uses Prisma as the persistence boundary
- repository adapters translate Prisma records into domain contracts
- every repository method requires explicit organization context
- workflow state, recommendation scenarios, recommendation results, and auth sessions are persisted

## Membership-Based Tenant Resolution
The tenant boundary is now enforced through one reusable path.

Resolution flow:
1. API reads `Authorization: Bearer <token>`.
2. Session token hash is looked up in `UserSession`.
3. Expired or revoked sessions are rejected.
4. API reads the requested organization from `x-organization-id`.
5. `OrganizationMember` is checked for the authenticated user and requested organization.
6. If membership exists, the request receives an authenticated tenant context.
7. If membership does not exist, the request is rejected with `403`.

This keeps organization selection explicit while ensuring identity comes from authentication rather than caller-controlled payload fields.

## Authorization Model
Current authorization is intentionally simple and explicit.

Rules enforced now:
- every workflow and recommendation route requires authentication
- every workflow and recommendation route requires organization membership
- users can only read and write records for organizations they belong to
- recommendation preview only reads persisted records for the authenticated tenant
- repositories and services receive tenant context explicitly so organization scoping is never implicit

Role capture is already present through `OrganizationMember.role`, but route-level behavior is not yet differentiated by role. Future RBAC can plug in after membership resolution, before service orchestration.

## Persisted Founder Workflow
1. Authenticated operator calls workflow endpoints with a bearer token and active organization header.
2. Shared tenant-resolution middleware authenticates the user and validates membership.
3. Workflow handlers validate payloads and delegate to application services.
4. Services read and write tenant-scoped repositories.
5. Recommendation preview rebuilds from the latest persisted tenant records and persists scenario/result output.

## Development Fallback Behavior
The old silent development fallback has been removed from the production path.

A development bootstrap path still exists, but only when both of these are true:
- `NODE_ENV` is not `production`
- `AUTH_ALLOW_DEV_FALLBACK=true`

Even then, it is opt-in at request time through an explicit development header rather than being silently applied to every unauthenticated request.

## Known Limitations
- The web app still needs a first-class login/session flow wired into these authenticated API requirements.
- Session issuance and revocation endpoints are not yet built for operators.
- RBAC is still membership-based only and does not yet differentiate owner/admin/operator/advisor privileges in handlers.
- I could not run typecheck, Prisma generation, or tests in this environment because `node` and `pnpm` are unavailable.
