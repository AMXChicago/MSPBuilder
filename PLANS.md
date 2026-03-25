# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Foundation / Architecture / Scaffolding

## Goal Of This Phase
Stand up a production-grade SaaS foundation for an MSP/MSSP Launch OS with:
- clear domain boundaries
- a centralized rules and recommendation engine
- a normalized multi-tenant data model
- modular templates and content primitives
- room to scale without prematurely implementing product features

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
1. Refine root documentation for product boundaries and system intent
2. Scaffold monorepo structure with `apps` and `packages`
3. Add shared TypeScript configuration and package boundaries
4. Define normalized Prisma schema for MVP entities
5. Add domain contracts and repository interfaces
6. Add rules engine primitives and placeholder policies
7. Add template module primitives and seed placeholder content
8. Write product, flow, architecture, data model, and roadmap docs
9. Create a prioritized backlog for the next 10 implementation tasks

## Non-Goals For This Pass
- polished UI implementation
- live auth integration
- real payment flows
- production deployment automation
- completed business workflows

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic and reusable domain primitives rather than ad hoc screens and hardcoded decisions.
