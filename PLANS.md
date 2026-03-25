# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Persistence / Tenant-Aware Workflow Foundation

## Goal Of This Phase
Replace temporary workflow state with Prisma-backed persistence so the current founder -> business model -> service package -> pricing -> recommendation flow behaves like a real multi-tenant SaaS foundation.

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
1. Implement Prisma-backed repository adapters for workflow entities and recommendation persistence
2. Enforce organization scoping in repositories and API routes
3. Add application services for save, load, and recommendation generation flows
4. Add workflow-state retrieval and dev tenant bootstrap for local development
5. Update the web flow to load persisted state and survive refreshes
6. Add tests for repository behavior, tenant scoping, and persisted recommendation generation
7. Update architecture and product documentation for persistence

## Non-Goals For This Pass
- polished UI or design work
- live auth provider integration
- production deployment automation
- advanced analytics or reporting surfaces
- non-workflow product modules beyond the first persisted flow

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic, durable tenant-aware persistence, and reusable domain primitives rather than ad hoc screens and transient state.
