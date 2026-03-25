# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Foundation / Architecture / Domain Correction

## Goal Of This Phase
Correct and deepen the core MSP/MSSP domain model with:
- a first-class recommendation scenario that stores all recommendation inputs
- MSP-specific pricing model fields that support margin and markup analysis
- service package composition rich enough for real managed-service offers
- business model posture fields that materially influence recommendations
- rules-engine inputs that depend on domain snapshots, not UI-facing models

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
1. Introduce a first-class recommendation scenario model with explicit snapshots and constraints
2. Upgrade pricing, service package composition, and business model schemas for MSP/MSSP specificity
3. Align shared domain contracts and repository interfaces with the corrected schema
4. Strengthen rules-engine context definitions so future scoring plugs into stable domain inputs
5. Update architecture documentation to explain why these domain changes exist

## Non-Goals For This Pass
- UI implementation work
- live auth integration
- real payment flows
- production deployment automation
- full recommendation scoring logic
- production repository implementations

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic and reusable domain primitives rather than ad hoc screens and hardcoded decisions.
