# System Design

## Architecture Summary
The current MVP runs as a TypeScript monorepo with a thin Next.js workflow UI, a Fastify API, a centralized rules engine, and Prisma-backed persistence. The active founder workflow is authenticated, membership-scoped, and now produces richer launch-readiness recommendations that are explainable and operator-reviewable.

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
- renders a minimal operator-facing recommendation review surface
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
- scores pricing readiness, package completeness, stack fit, and security baseline selection
- aggregates these into a stable `RecommendationResult` with:
  - overall score
  - readiness, risk, and confidence
  - launch summary
  - launch blockers and accelerators
  - next three actions
  - structured explanation items
  - top stack choices with fit reasons and tradeoffs

### Database Layer
- uses Prisma as the persistence boundary
- repository adapters translate Prisma records into domain contracts
- every repository method requires explicit organization context
- workflow state, recommendation scenarios, recommendation results, and auth sessions are persisted

## Recommendation Output Model
The recommendation output is now designed for founder/operator review rather than raw policy inspection.

Key result sections:
- `overallScore`, `readinessLevel`, `riskLevel`, `confidenceLevel`
- `launchSummary`
- `launchBlockers`
- `launchAccelerators`
- `nextThreeActions`
- `stackFitSummary.data.topChoices`
- `explainability.items`

This creates a stable, frontend-friendly API contract where the UI can render a useful review experience without reconstructing logic from scattered policy strings.

## Explainability Structure
Each policy can now emit structured explanation items instead of only freeform strings.

Each explanation item includes:
- `category`
- `impact`
- `message`
- `recommendedAction`

This improves operator usability in three ways:
- reasons can be grouped consistently by pricing, package, stack, security, and launch
- positive versus negative signals are clearer
- every important issue can carry an explicit action recommendation

## Improved Stack-Fit Logic
Vendor-fit scoring is now materially sensitive to founder workflow inputs.

At minimum, stack scoring now considers:
- business type
- target verticals
- delivery model
- compliance sensitivity
- budget positioning
- founder maturity
- service package composition
- pricing posture

Stack outputs now include:
- top recommended vendor choices
- why each choice fits
- tradeoffs to watch
- coverage gaps in the current shortlist
- vendor score breakdowns for operator review

## Launch Readiness Interpretation
The aggregated recommendation now explicitly answers whether the founder looks launch-ready, not just whether individual policies scored well.

Interpretation logic combines:
- weighted policy scores
- missing information and input completeness
- package and pricing blockers
- stack coverage gaps
- positive accelerators already present in the workflow

This gives internal operators a more useful answer than a raw score alone.

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

## Authorization Model
Current authorization is intentionally simple and explicit.

Rules enforced now:
- every workflow and recommendation route requires authentication
- every workflow and recommendation route requires organization membership
- users can only read and write records for organizations they belong to
- recommendation preview only reads persisted records for the authenticated tenant
- repositories and services receive tenant context explicitly so organization scoping is never implicit

Role capture is already present through `OrganizationMember.role`, but route-level behavior is not yet differentiated by role. Future RBAC can plug in after membership resolution, before service orchestration.

## Development Fallback Behavior
The old silent development fallback has been removed from the production path.

A development bootstrap path still exists, but only when both of these are true:
- `NODE_ENV` is not `production`
- `AUTH_ALLOW_DEV_FALLBACK=true`

Even then, it is opt-in at request time through an explicit development header rather than being silently applied to every unauthenticated request.

## Known Limitations
- Vendor-fit still depends on seeded vendor profiles rather than a fully managed vendor intelligence dataset.
- The web app still needs a first-class login/session flow wired into these authenticated API requirements.
- Session issuance and revocation endpoints are not yet built for operators.
- RBAC is still membership-based only and does not yet differentiate owner/admin/operator/advisor privileges in handlers.
- I could not run typecheck, Prisma generation, or tests in this environment because `node` and `pnpm` are unavailable.
