# Data Model

## Modeling Principles
- use `Organization` as the tenant root
- isolate user identity from tenant membership
- normalize reusable offer-design entities instead of hiding logic in JSON blobs
- persist recommendation inputs as versioned snapshots so outputs remain explainable over time
- persist recommendation outputs so previews can be reloaded and compared
- model MSP/MSSP pricing and package composition explicitly rather than treating them as generic SaaS plan fields

## Core Entity Groups
### Identity And Tenancy
- `User`
- `Organization`
- `OrganizationMember`

### Offer Design
- `FounderProfile`
- `BusinessModel`
- `ServiceDefinition`
- `ServicePackage`
- `ServicePackageItem`
- `PricingModel`

### Recommendation Inputs And Outputs
- `RecommendationScenario`
- `RecommendationResultRecord`
- `RecommendationOutputLink`
- `StackRecommendation`
- `StackRecommendationVendor`
- `Vendor`
- `VendorCostProfile`

## Why These Entities Exist
### RecommendationScenario Is First-Class
`RecommendationScenario` stores the exact business model, package, pricing, and constraint snapshots used for one recommendation run.

It exists so the system can answer:
- which saved records produced this recommendation?
- which snapshots and rules version were used?
- how did a later recommendation differ from an earlier one?

### RecommendationResultRecord Persists Explainable Output
`RecommendationResultRecord` stores the unified recommendation result plus detailed breakdown JSON.

It exists because recommendation output should survive refreshes and be reloadable without recomputing everything immediately. It also creates a clean foundation for recommendation history, audits, and scenario comparison.

### PricingModel Matches MSP Economics
`PricingModel` captures recurring managed-service pricing mechanics instead of generic plan metadata:
- `pricingUnit`
- `minimumQuantity`
- `includedQuantity`
- `overageUnitPrice`
- `billingFrequency`
- `contractTermMonths`
- `passthroughCost`
- `markupPercentage`
- `effectiveMarginPercent`

These fields exist because MSP/MSSP pricing depends on quantity structure, vendor cost passthrough, markup behavior, and margin-aware packaging.

### ServicePackageItem Carries Operational Meaning
`ServicePackageItem` defines the operational contract between a package and a service capability. It includes:
- `isRequired`
- `includedQuantity`
- `slaTier`
- `supportHours`
- `exclusions`
- `priorityLevel`

This exists because a package is not just a label. The service relationship itself defines scope, urgency, and delivery expectations.

### BusinessModel Stores Recommendation-Critical Posture
`BusinessModel` stores the inputs that materially shift recommendations:
- `businessType`
- `targetVerticals`
- `targetCompanySizes`
- `deliveryModel`
- `complianceSensitivity`
- `budgetPositioning`
- `founderMaturity`

These fields exist because an MSSP serving regulated healthcare buyers should not inherit the same assumptions as a budget MSP serving general SMBs.

## Tenant-Scoping Rules
Every workflow record belongs to exactly one organization.

Important consequences:
- repositories always query by `organizationId`
- writes always stamp `organizationId`
- recommendation scenarios and results are tenant-owned
- service definitions and vendors are also tenant-scoped

To support reliable tenant bootstrap and reference-data loading, service definitions and vendors now have unique organization-scoped names.

## Key Relationships
- one `Organization` owns many founder profiles, business models, service packages, pricing models, recommendation scenarios, and recommendation results
- one `ServicePackage` contains many `ServicePackageItem` records
- one `PricingModel` belongs to one service package and can be referenced by many recommendation scenarios over time
- one `RecommendationScenario` links to one or more structured outputs, including `StackRecommendation`
- one `RecommendationResultRecord` stores the unified result for a scenario

## Design Consequence
This model deliberately favors explicitness over abstraction. The goal is not a generic configurable platform. The goal is a trustworthy MSP/MSSP operating model where recommendations can be persisted, audited, reloaded, and improved without losing tenant boundaries or historical context.
