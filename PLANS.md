# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Local Development Auth Bootstrap / Workflow Runtime Wiring

## Goal Of This Phase
Make the founder workflow run locally without manual header hacking by wiring route registration, development-only session bootstrap, and centralized frontend auth context attachment while keeping production behavior strict.

## MVP Scope
### In MVP
- Founder Profile
- Business Model
- Service Catalog
- Pricing Engine
- Stack Recommendation Engine
- Contracts and Templates
- Onboarding Checklists and SOPs
- Security Baseline
- Marketing and Launch planning
- KPI Tracking

### Deferred Until After Foundation
- live vendor integrations
- billing automation
- advanced analytics
- workflow automation
- compliance evidence collection

## Architectural Direction
- Monorepo with isolated apps and shared packages
- TypeScript across the stack
- Next.js for the application frontend
- Fastify for the API service layer
- PostgreSQL with Prisma for persistence
- shared domain package for contracts, enums, and value objects
- tenant-aware repository adapters at the database boundary
- application services to coordinate persistence and recommendation generation
- rules-engine package for recommendation and decision orchestration
- templates package for reusable contracts, onboarding assets, SOPs, and marketing assets
- configuration-driven recommendations, scoring, and defaults

## Core Domains
- Identity and Access
- Tenant and Organization Management
- Founder Profile
- Business Model
- Service Catalog
- Pricing and Margin Modeling
- Vendor Catalog
- Stack Recommendation
- Recommendation Scenarios and Persisted Outputs
- Templates and Contracts
- Onboarding and SOPs
- Security Baseline
- Marketing and Launch
- KPI Tracking

## Major Deliverables In This Pass
1. Verify workflow and recommendation routes are registered from the API runtime entrypoint
2. Add a development-only auth bootstrap endpoint that can mint a usable local session
3. Centralize frontend auth header attachment for workflow and recommendation requests
4. Initialize local dev session automatically before the founder workflow loads persisted state
5. Add tests for route registration, dev bootstrap behavior, and production auth rejection
6. Update local-run documentation and environment requirements

## Non-Goals For This Pass
- polished UI or design work
- full RBAC beyond membership-role capture
- production deployment automation
- advanced analytics or reporting surfaces
- non-workflow product modules beyond authenticated workflow access

## Guiding Principle
Keep production auth strict while removing avoidable friction in local development through one explicit development bootstrap path and one centralized client auth helper.
