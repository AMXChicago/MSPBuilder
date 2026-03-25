# System Design

## Architecture Summary
The recommended shape is a TypeScript monorepo with a thin UI, a service-oriented API, and shared packages for domain contracts, rules, templates, and persistence.

## Repo Topology
- `apps/web`
  Next.js application shell for authenticated workflows, intake forms, package builders, and dashboards.
- `apps/api`
  Fastify API responsible for orchestration, validation, and invoking domain use cases plus rules evaluation.
- `packages/domain`
  Shared domain contracts, value object primitives, and repository interfaces.
- `packages/rules-engine`
  Centralized recommendation and policy engine. This is where pricing guardrails and stack recommendations live.
- `packages/templates`
  Template catalog and rendering contracts for contracts, checklists, SOPs, and marketing assets.
- `packages/database`
  Prisma schema and future repository implementations.

## Why Monorepo
- shared types stay version-aligned
- rules engine can be reused by API and async workers later
- documentation and modules evolve together
- lower coordination cost during early product formation

## Frontend Choice
Next.js is the preferred frontend framework because it gives a clean route-based application shell, server rendering where useful, and broad ecosystem support without forcing business logic into React components.

## Backend Choice
Fastify is the preferred backend foundation because it is lightweight, high-performance, type-friendly, and works well when the architecture needs explicit control over module boundaries instead of a framework-heavy abstraction layer.

## Persistence
- PostgreSQL as the system of record
- Prisma for schema management and generated client
- tenant scoping via `organizationId` on business data
- join tables for many-to-many associations

## Multi-Tenant Model
- top-level tenant entity is `Organization`
- users can belong to multiple organizations via membership records
- all business entities are scoped to an organization
- future authz should enforce tenant boundaries in API service layer and repositories

## Recommended Runtime Boundaries
- Web app: presentation, form state, server actions or API calls
- API: validation, orchestration, tenancy enforcement, repository access
- Domain package: types and use case contracts
- Rules engine: deterministic recommendation logic
- Templates package: asset metadata and future rendering support
- Database package: schema and persistence implementation

## Future Evolution
- add background workers for batch recommendation refreshes and document rendering
- add eventing around organization setup, package publication, and KPI snapshots
- add tenant-aware RBAC and audit trails
