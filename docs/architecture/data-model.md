# Data Model

## Modeling Principles
- use `Organization` as the tenant root
- isolate user identity from tenant membership
- normalize reusable business entities and join them explicitly
- capture MSP/MSSP-specific offer design inputs instead of generic product fields
- keep recommendation scenarios separate from recommendation outputs so decision traces remain explainable

## Core Entity Groups
### Identity And Tenancy
- `User`
- `Organization`
- `OrganizationMember`

### Founder And Offer Design
- `FounderProfile`
- `BusinessModel`
- `ServiceDefinition`
- `ServicePackage`
- `ServicePackageItem`
- `PricingInput`

### Vendor And Recommendations
- `Vendor`
- `VendorCostProfile`
- `RecommendationScenario`
- `RecommendationOutputLink`
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

## New MVP-Specific Modeling Choices
### BusinessModel
`BusinessModel` now stores the operating posture that materially changes recommendations:
- `businessType` distinguishes MSP, MSSP, Hybrid, and Co-Managed offers
- `deliveryModel` captures remote, onsite, hybrid, or co-managed delivery expectations
- `complianceSensitivity` and `budgetPositioning` influence stack and baseline selection later
- `founderMaturity` helps recommendation policies adapt to operator stage

These fields exist because MSP/MSSP design choices are not interchangeable. A co-managed healthcare offer should not inherit the same defaults as a budget-first remote-only SMB MSP.

### ServicePackage And ServicePackageItem
Package composition moved into first-class `ServicePackageItem` records so each package can express:
- whether a service is required or optional
- included quantities and units
- limit summaries and operator notes
- ordering within the package definition

`ServicePackage` itself now stores `slaTier`, `supportHours`, and `exclusions` because these are essential parts of a managed-services offer, not display-only details.

### PricingInput
`PricingInput` replaces the earlier generic pricing model shape with fields that support recurring offer mechanics:
- `pricingUnit`
- `minimumQuantity`
- `includedQuantity`
- `overageUnitPrice`
- `billingFrequency`
- `contractTermMonths`
- `marginBehavior`

These inputs are necessary for later readiness checks, margin guardrails, and recommendation logic.

### RecommendationScenario
`RecommendationScenario` stores a versioned snapshot of the inputs used to generate recommendations. This gives the system:
- a stable evaluation context
- explainability over which inputs produced which outputs
- a path to recommendation history and re-runs as rules evolve

`RecommendationOutputLink` keeps the relationship between a scenario and recommendation outputs explicit without forcing every output type into one table.

## Key Relationships
- one `User` can belong to many organizations
- one `Organization` can have many founder profiles, business models, packages, pricing inputs, and recommendation scenarios
- one `ServicePackage` contains many `ServicePackageItem` records
- one `PricingInput` attaches to one service package and can be referenced by many recommendation scenarios over time
- one `RecommendationScenario` can link to many outputs through `RecommendationOutputLink`

## Normalization Notes
- service definitions remain separate from service packages to preserve reuse
- package item metadata lives in the join entity because offer composition contains real business meaning
- pricing inputs are independent from recommendation outputs so the same package can be evaluated repeatedly
- recommendation scenarios snapshot inputs instead of relying on mutable live records at read time

## MVP Constraints
- `RecommendationScenario.inputSnapshot` is stored as JSON for explicit traceability without over-modeling every draft-state variant yet
- package items use maintainable explicit fields rather than a generic configuration blob
- recommendation output links are generic enough to support multiple output families while keeping the schema understandable
