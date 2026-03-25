# AGENTS.md

## Mission
This repository powers an MSP/MSSP Launch OS.

The goal is to help users:
- Define business model
- Build services and pricing
- Select stack
- Generate contracts
- Launch marketing
- Deliver services
- Scale

## Product Boundaries
### In Scope
- MSP/MSSP workflows
- Service packaging
- Pricing and margin design
- Stack recommendations
- Contracts, proposals, and onboarding assets
- Security baseline guidance
- Operational playbooks and KPI tracking

### Out of Scope
- Business formation execution
- Legal or tax advisory
- Compliance certification issuance

## Engineering Principles
1. Domain-Driven Design
2. Rules Engine First
3. Strong Typing
4. Modular Templates
5. Maintainability > Speed
6. Multi-Tenant By Default
7. Configuration Over Hardcoding

## Rules for Codex
- Read this file first
- Update PLANS.md before major changes
- Avoid overbuilding early
- Keep logic centralized
- Prefer shared contracts over duplicated app-specific types
- Treat UI as orchestration, not the source of business rules

## Anti-Patterns
- Hardcoded logic
- Tight coupling
- UI-driven architecture
- Tenant-specific branching in presentation code
- Hidden business rules in templates or components
