# Data Model

## Modeling Principles
- use `Organization` as the tenant root
- isolate user identity from tenant membership
- normalize reusable business entities and join them explicitly
- keep versioned content assets independent from runtime workflows
- capture recommendation outputs separately from recommendation inputs

## Core Entity Groups
### Identity And Tenancy
- `User`
- `Organization`
- `OrganizationMember`

### Business Design
- `FounderProfile`
- `BusinessModel`
- `ServiceDefinition`
- `ServicePackage`
- `ServicePackageService`
- `PricingModel`

### Vendor And Recommendations
- `Vendor`
- `VendorCostProfile`
- `StackRecommendation`
- `StackRecommendationVendor`

### Templates And Operations
- `TemplateAsset`
- `OnboardingChecklist`
- `OnboardingChecklistStep`
- `SopDocument`

### Security, Marketing, And Analytics
- `SecurityBaseline`
- `LaunchCampaign`
- `KpiRecord`

## Key Relationships
- one `User` can belong to many organizations
- one `Organization` can have many founder profiles, business models, packages, templates, and KPI records
- many services can belong to many service packages through `ServicePackageService`
- many vendors can belong to many stack recommendations through `StackRecommendationVendor`
- one onboarding checklist contains many ordered checklist steps

## Normalization Notes
- service definitions are separate from service packages to support package reuse and future what-if modeling
- vendor costs are separated from vendors so the same vendor can have service-specific cost assumptions
- stack recommendations are persisted outputs, not embedded arrays on business models
- checklist steps are first-class records to support ownership, ordering, and completion state later

## MVP Constraints
- pricing formulas are stored as configuration fields, not a full expression language yet
- recommendations are deterministic policy outputs, not ML-driven
- template rendering is deferred; only metadata and interfaces exist in this pass
