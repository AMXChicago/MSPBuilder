# System Design

## Architecture Summary
The recommended shape is a TypeScript monorepo with a thin UI, a service-oriented API, centralized recommendation logic, and a Prisma-backed persistence layer that enforces tenant scoping through application services and repository adapters.

## Repo Topology
- `apps/web`
  Next.js workflow UI. It collects inputs, loads saved workflow state from the API, and renders persisted recommendation output.
- `apps/api`
  Fastify API responsible for validation, tenant resolution, application services, repository orchestration, and invoking the rules engine.
- `packages/domain`
  Shared domain contracts, repository interfaces, tenant context types, and value object primitives.
- `packages/rules-engine`
  Centralized recommendation and policy engine. Pricing, package, stack, and security logic all run here from a normalized recommendation context.
- `packages/templates`
  Template catalog and rendering contracts for contracts, checklists, SOPs, and marketing assets.
- `packages/database`
  Prisma schema, client bootstrap, tenant seed/bootstrap helpers, and Prisma-backed repository adapters.

## Runtime Shape
### Web
- Loads workflow state from `GET /workflow/state`
- Submits founder, business model, service package, and pricing data to thin API routes
- Never computes recommendation logic locally
- Survives refreshes because saved state is loaded from persistence

### API
- Resolves tenant context from request headers, payload, query, or local-development bootstrap
- Validates payloads with zod
- Calls application services rather than Prisma directly from routes
- Persists workflow records and recommendation outputs
- Builds normalized recommendation context from persisted state and reference data

### Database Layer
- Prisma is the system-of-record boundary
- Repository adapters translate Prisma enums, decimals, and relations into domain contracts
- Every repository method requires `TenantContext`
- Persistence concerns stay out of the web app and rules engine

## Tenant Model
- `Organization` is the tenant root
- Every business record includes `organizationId`
- Repository reads and writes always include organization scoping
- Local development uses a bootstrap organization and user when no auth context exists
- Real auth will later replace bootstrap tenant resolution with authenticated membership lookup

## Application Service Boundary
The first persisted workflow is coordinated by an application service in the API layer.

Current responsibilities:
- save founder profile
- save business model
- save service package
- save pricing model
- fetch saved workflow state
- build recommendation scenario from persisted records
- generate unified recommendation preview
- persist recommendation results and stack recommendation links

This boundary exists so routes stay thin and so repository coordination does not leak into the UI.

## Persistence Strategy For Recommendations
The current flow persists recommendation execution in three layers:
- `RecommendationScenario`
  Versioned snapshot of all inputs used to generate the recommendation.
- `RecommendationResultRecord`
  Persisted unified result plus detailed breakdown JSON for reload and history.
- `StackRecommendation`
  Structured vendor linkage for stack-fit output.

This gives the product both explainability and an upgrade path toward recommendation history, audits, and scenario comparison.

## Development Bootstrap
A simple dev bootstrap creates:
- a local development organization
- a local development user
- membership between them
- tenant-scoped service definitions
- tenant-scoped vendor metadata

This allows the current workflow to behave like a real multi-tenant application before full auth is added.

## Future Evolution
- replace development tenant bootstrap with authenticated tenant resolution and RBAC
- add migrations and seed commands for local environment setup
- add recommendation history browsing and scenario diffing
- persist vendor cost profiles and baseline catalogs as first-class tenant data
- introduce async jobs for recommendation refresh and document generation
