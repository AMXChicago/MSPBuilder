# MSP/MSSP Launch OS

## Overview
MSP/MSSP Launch OS is a multi-tenant SaaS platform that helps founders design, launch, and operate managed service and managed security service businesses.

It is purpose-built for MSP/MSSP operators, not a generic startup builder. The platform is meant to guide users through the operating decisions that matter most:
- defining the business model
- building service packages
- modeling pricing and margins
- selecting a vendor stack
- generating contracts and customer-facing artifacts
- preparing onboarding workflows and SOPs
- establishing a security baseline
- organizing launch and growth activities

## Product Boundary
This product does not handle business formation execution. That work is expected to happen through ecosystem partners such as doola, Stripe Atlas, or similar providers.

This product also does not provide legal, tax, or formal compliance certification advice. It can structure templates and operational guidance, but not replace professional counsel.

## Product Thesis
MSP/MSSP Launch OS should behave like an operating system for a managed services business:
- domain-driven at the core
- rules-engine first for recommendations and decision support
- template-driven for repeatable execution assets
- strongly typed across services and data contracts
- configuration-first so business logic is not trapped inside UI code

## Initial Architecture
- `apps/web`: Next.js application shell and user workflows
- `apps/api`: Fastify API for orchestration, domain use cases, and persistence boundaries
- `packages/domain`: shared types, entities, value objects, and interfaces
- `packages/rules-engine`: centralized recommendation and decision primitives
- `packages/templates`: modular template catalog primitives
- `packages/database`: Prisma schema and persistence support
- `docs/`: product, architecture, roadmap, and data model documentation

## Core Domains
- Founder Profile
- Business Model
- Service Catalog
- Pricing Engine
- Stack Recommendation Engine
- Contracts and Templates
- Onboarding and SOPs
- Security Baseline
- Marketing and Launch
- KPI Tracking

## Local Development
Local env files now exist at:
- `apps/api/.env`
- `apps/web/.env.local`

Tracked examples:
- `apps/api/.env.example`
- `apps/web/.env.local.example`

Current local defaults:
- API port: `4000`
- web API base URL: `http://localhost:4000`
- development auth bootstrap: enabled

Startup steps:
1. Start PostgreSQL locally on port `5432`.
2. From the repo root run the API:
   `pnpm --dir C:\MySoftware --filter @launch-os/api dev`
3. In a second terminal run the web app:
   `pnpm --dir C:\MySoftware --filter @launch-os/web dev`
4. Open `http://localhost:3000/founder`

Production behavior differs:
- `/auth/dev-session` is disabled outside explicit development mode.
- workflow and recommendation routes require a real bearer session plus `x-organization-id`.
- there is no silent tenant fallback.

## Current Status
The repository is in foundation mode. The goal of the current phase is to establish a clean architecture, a normalized schema, and module boundaries before feature implementation begins.
