# PLANS.md

## Project
MSP/MSSP Launch OS

## Current Phase
Foundation / Architecture / First End-to-End Flow

## Goal Of This Phase
Connect the first usable end-to-end workflow from:
- founder input
- business model input
- service package input
- pricing input
- recommendation preview output

using the existing API and rules engine with minimal UI only

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
1. Add minimal workflow pages for founder, business model, service package, pricing, and recommendation preview
2. Expose simple API routes for the workflow inputs
3. Connect frontend form submissions to the API and recommendation preview endpoint
4. Add loading and error handling for the workflow
5. Update product flow documentation for the MVP path

## Non-Goals For This Pass
- polished UI or design work
- live auth integration
- real payment flows
- production deployment automation
- production repository implementations

## Guiding Principle
Help users build a profitable, operational MSP/MSSP using centralized logic and reusable domain primitives rather than ad hoc screens and hardcoded decisions.
