# System Design

## Architecture Summary
The current MVP runs as a TypeScript monorepo with a thin Next.js workflow UI, a Fastify API, a centralized rules engine, and Prisma-backed persistence. The active founder workflow is authenticated, membership-scoped, and can now bootstrap a usable local development session automatically when development auth is explicitly enabled.

## Authentication Approach
The API uses Prisma-backed bearer sessions for authenticated access.

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
- initializes a development session automatically when `NEXT_PUBLIC_AUTH_ALLOW_DEV_FALLBACK=true`
- stores the local dev token and tenant context in one centralized client helper
- renders a minimal operator-facing recommendation review surface
- does not contain recommendation or tenant-authorization logic

### API
- registers `GET /auth/dev-session` for explicit development bootstrap
- registers workflow routes:
  - `GET /workflow/state`
  - `POST /founder`
  - `PUT /founder`
  - `POST /business-model`
  - `PUT /business-model`
  - `POST /service-package`
  - `PUT /service-package`
  - `POST /pricing`
  - `PUT /pricing`
- registers recommendation routes:
  - `GET /recommendation/preview`
- authenticates bearer session tokens
- resolves organization membership from the authenticated user plus the requested organization context
- rejects unauthenticated or cross-tenant access before workflow handlers run
- validates input with zod
- uses application services to coordinate repository calls and recommendation generation
- returns standardized `{ ok, data }` success envelopes and structured error responses

### Rules Engine
- consumes normalized `RecommendationContext`
- scores pricing readiness, package completeness, stack fit, and security baseline selection
- aggregates these into a stable `RecommendationResult` with overall score, readiness, risk, confidence, launch summary, blockers, accelerators, next actions, and structured explanation items

### Database Layer
- uses Prisma as the persistence boundary
- repository adapters translate Prisma records into domain contracts
- every repository method requires explicit organization context
- workflow state, recommendation scenarios, recommendation results, and auth sessions are persisted

## Development Auth Bootstrap
Local development auth is now explicit and usable.

Bootstrap flow:
1. Web app starts with `NEXT_PUBLIC_AUTH_ALLOW_DEV_FALLBACK=true`.
2. First workflow request path calls the centralized auth helper.
3. Helper requests `GET /auth/dev-session`.
4. API verifies that:
   - `NODE_ENV !== production`
   - `AUTH_ALLOW_DEV_FALLBACK=true`
5. API bootstraps the development user and organization if needed, issues a real bearer session, and returns tenant context.
6. Web app stores the bearer token and `organizationId`, then attaches them automatically to workflow and recommendation requests.

This keeps local development friction low without weakening production paths.

## Membership-Based Tenant Resolution
The tenant boundary is enforced through one reusable path.

Resolution flow:
1. API reads `Authorization: Bearer <token>`.
2. Session token hash is looked up in `UserSession`.
3. Expired or revoked sessions are rejected.
4. API reads the requested organization from `x-organization-id`.
5. `OrganizationMember` is checked for the authenticated user and requested organization.
6. If membership exists, the request receives an authenticated tenant context.
7. If membership does not exist, the request is rejected with `403`.

## Development Versus Production
Development mode:
- `GET /auth/dev-session` works only when development auth is explicitly enabled.
- frontend can auto-bootstrap a session and tenant context.

Production mode:
- `GET /auth/dev-session` returns `404`.
- workflow and recommendation routes require real bearer auth.
- missing auth returns `401`.
- cross-tenant access returns `403`.

## Known Limitations
- Vendor-fit still depends on seeded vendor profiles rather than a fully managed vendor intelligence dataset.
- The web app still needs a first-class login/session flow wired into these authenticated API requirements.
- Session issuance and revocation endpoints are not yet built for operators beyond the explicit development bootstrap path.
- RBAC is still membership-based only and does not yet differentiate owner/admin/operator/advisor privileges in handlers.
- I could not run typecheck, Prisma generation, or tests in this environment because `node` and `pnpm` are unavailable.
