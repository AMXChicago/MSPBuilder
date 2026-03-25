# MVP Roadmap

## What This Scaffold Delivers
- monorepo structure for web, API, and shared packages
- normalized Prisma schema for MVP entities
- typed domain models for the core business domains
- a rules engine skeleton for centralized recommendation logic
- a templates package for versioned content assets
- first-pass architecture and product documentation

## Next 10 Tasks
1. Add authentication and tenant membership enforcement across the API and web app.
2. Implement Prisma client wiring and repository adapters in `packages/database`.
3. Build the founder profile intake flow end to end with validation and persistence.
4. Build business model creation and editing workflows.
5. Implement service definition and service package management.
6. Implement pricing model CRUD plus margin guardrail evaluation endpoints.
7. Seed the vendor catalog and expose stack recommendation evaluation APIs.
8. Add template management APIs and a first rendering pipeline contract.
9. Implement onboarding checklist, SOP, and security baseline CRUD flows.
10. Add KPI ingestion, reporting endpoints, and an initial operations dashboard shell.

## Delivery Guidance
- keep domain logic in shared packages or API use cases
- keep UI focused on workflow orchestration and presentation
- add tests alongside repository and rules implementations as those modules become concrete
