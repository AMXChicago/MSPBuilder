# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Authentication / Membership-Based Tenant Resolution

## Goal Of This Phase
Replace the development tenant fallback with real authenticated tenant resolution so workflow reads and writes are organization-scoped, membership-checked, and safe for production-style multi-tenant access.

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
1. Add a production-appropriate authentication layer for API requests
2. Resolve tenant context from authenticated user sessions plus organization membership
3. Enforce reusable authorization across workflow and recommendation routes
4. Isolate the development fallback behind explicit development-only configuration
5. Tighten service and repository entry points around authenticated tenant context
6. Add tests for unauthenticated, unauthorized, cross-tenant, and valid tenant-scoped access
7. Update architecture and product documentation for authenticated multi-tenant behavior

## Non-Goals For This Pass
- polished UI or design work
- full RBAC beyond membership-role capture
- production deployment automation
- advanced analytics or reporting surfaces
- non-workflow product modules beyond authenticated workflow access

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic, authenticated tenant boundaries, and reusable domain primitives rather than ad hoc screens, transient state, or hidden dev shortcuts.
