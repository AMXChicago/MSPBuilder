# Data Model

## Modeling Principles
- use `Organization` as the tenant root
- isolate user identity from tenant membership
- normalize reusable offer-design entities instead of hiding logic in JSON blobs
- persist recommendation inputs as versioned snapshots so outputs remain explainable over time
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
- `RecommendationOutputLink`
- `StackRecommendation`
- `StackRecommendationVendor`
- `Vendor`
- `VendorCostProfile`

## Why These Changes Exist
### RecommendationScenario Is Now First-Class
`RecommendationScenario` is the most important correction in this pass. It exists because recommendations must be reproducible and explainable.

A recommendation should never depend on whatever the current live records happen to look like at read time. Instead, the scenario stores:
- `founderProfileSnapshot`
- `businessModelSnapshot`
- `servicePackageSnapshot`
- `pricingModelSnapshot`
- `constraintSnapshot`
- `vendorSnapshot`
- `contextVersion`
- `rulesVersion`

This makes it possible to answer:
- which inputs produced this recommendation?
- which rule version produced it?
- what changed between one recommendation run and another?

### PricingModel Now Matches MSP Economics
The pricing model now captures recurring managed-service pricing mechanics instead of generic plan metadata:
- `pricingUnit` supports `user`, `device`, or `hybrid`
- `minimumQuantity` and `includedQuantity` support coverage thresholds
- `overageUnitPrice` supports excess usage or asset growth
- `billingFrequency` and `contractTermMonths` support real service agreements
- `passthroughCost` and `markupPercentage` support vendor-cost-aware pricing
- `effectiveMarginPercent` supports downstream readiness and profitability checks

These fields exist because MSP/MSSP pricing is usually a blend of recurring operational value, vendor passthrough cost, and markup assumptions.

### ServicePackage Composition Carries Operational Meaning
The relationship between a package and a service definition is now rich enough to describe the offer itself. `ServicePackageItem` includes:
- `isRequired`
- `includedQuantity`
- `slaTier`
- `supportHours`
- `exclusions`
- `priorityLevel`

This exists because package composition is not just a list of services. The service relationship itself defines delivery expectations, urgency, and scope boundaries.

### BusinessModel Stores Recommendation-Critical Posture
`BusinessModel` now captures the posture that materially changes recommendations:
- `businessType`
- `targetVerticals`
- `targetCompanySizes`
- `deliveryModel`
- `complianceSensitivity`
- `budgetPositioning`
- `founderMaturity`

These fields exist because a security-led MSSP serving regulated healthcare buyers should not inherit the same assumptions as a budget MSP serving general SMBs.

## Key Relationships
- one `Organization` owns many business models, service packages, pricing models, and recommendation scenarios
- one `ServicePackage` contains many `ServicePackageItem` records
- one `PricingModel` belongs to one service package and can be snapshotted into many recommendation scenarios over time
- one `RecommendationScenario` links directly to `StackRecommendation` outputs and can also reference generic outputs through `RecommendationOutputLink`

## Normalization Notes
- service definitions remain reusable independent capabilities
- package composition meaning lives in `ServicePackageItem`, not in `ServicePackage` alone
- recommendation scenarios snapshot mutable entities instead of re-reading live records during output inspection
- stack recommendations point back to the exact scenario that produced them

## Design Consequence
This model deliberately favors explicitness over abstraction. The goal is not a generic configurable platform. The goal is a trustworthy MSP/MSSP operating model where recommendations can be audited, compared, and improved without losing historical context.
