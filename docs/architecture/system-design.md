# System Design

## Architecture Summary
The current MVP runs as a TypeScript monorepo with a thin Next.js workflow UI, a Fastify API, a centralized rules engine, and Prisma-backed persistence. The active founder workflow is now tenant-aware, persisted, and reloadable across refreshes.

## Runtime Responsibilities
### Web
- Loads saved workflow state from `GET /workflow/state`
- Saves founder, business model, service package, and pricing data through thin API routes
- Shows progress, saved-state messaging, and recommendation output
- Does not contain recommendation logic

### API
- Resolves tenant context from headers, request payload/query, or a local-development bootstrap fallback
- Validates input with zod
- Uses application services to coordinate repository calls and recommendation generation
- Returns standardized `{ ok, data }` success envelopes and structured error responses

### Rules Engine
- Consumes normalized `RecommendationContext`
- Produces pricing, package, stack, and security outputs
- Aggregates them into one result with:
  - score
  - readiness
  - risk
  - confidence
  - missing-information warnings
  - top action items
  - recommended next steps

### Database Layer
- Uses Prisma as the persistence boundary
- Repository adapters translate Prisma records into domain contracts
- Every repository method requires tenant context
- Recommendation scenarios and recommendation results are persisted for reloadability

## Persisted Founder Workflow
1. Operator opens `/founder` and the page loads saved state from the backend.
2. Each save writes through the API into tenant-scoped repositories.
3. Back/forward navigation and refresh reload the same saved tenant records.
4. `/recommendation` rebuilds preview output from the latest persisted founder, business model, service package, and pricing records.
5. Recommendation preview persistence stores both scenario snapshots and unified result output.

## Tenant-Aware Behavior
- `Organization` is the tenant root.
- All workflow records are scoped by `organizationId`.
- Repository writes pre-check ownership before update to avoid cross-tenant overwrite by foreign IDs.
- Local development can bootstrap a fallback organization and user when auth is not yet wired.
- Real auth will later replace this fallback with membership-backed tenant resolution.

## Recommendation Preview Behavior
The recommendation preview is intentionally read-mostly and explainable.

It always:
- loads persisted workflow state first
- builds a fresh recommendation scenario snapshot
- runs the rules engine from normalized context
- persists the unified result and output links
- returns grouped reasoning, action items, next steps, and missing-information warnings

## Known Limitations
- Auth and RBAC are still not integrated.
- The development tenant bootstrap is a temporary local fallback.
- The UI is intentionally minimal and optimized for internal testing rather than polished operator experience.
- Recommendation history browsing and scenario comparison are not yet built.
- I could not run typecheck, Prisma generation, or tests in this environment because `node` and `pnpm` are unavailable.
