# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Foundation / Architecture / First Product Slice

## Goal Of This Phase
Deepen the domain foundation for the first real product slice with:
- MSP/MSSP-specific founder and business model inputs
- service package composition that supports real offer design
- pricing input structures that support recurring-service economics
- recommendation context snapshots for explainable outputs
- minimal API and internal web forms to validate the model end to end

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
- Templates and Contracts
- Onboarding and SOPs
- Security Baseline
- Marketing and Launch
- KPI Tracking

## Major Deliverables In This Pass
1. Refine Prisma schema for founder profile, business model, package composition, pricing inputs, and recommendation scenarios
2. Add typed domain contracts, enums, and repository interfaces for the first product slice
3. Expand the rules-engine context and add policy stubs for readiness and fit scoring
4. Add seed/config shapes for service definitions, package archetypes, vendor metadata, and pricing assumptions
5. Implement minimal API routes with validation for the first product slice
6. Implement minimal internal web forms to validate the new model
7. Update architecture and user-flow documentation to reflect the richer offer-design model

## Non-Goals For This Pass
- polished UI implementation
- live auth integration
- real payment flows
- production deployment automation
- full recommendation scoring logic
- production repository implementations

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic and reusable domain primitives rather than ad hoc screens and hardcoded decisions.
