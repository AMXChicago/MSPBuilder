# User Flows

## Primary MVP Flow
1. User creates or joins an organization.
2. User completes the founder profile.
3. User defines the business model with MSP/MSSP-specific posture fields.
4. User assembles a service package and its package items.
5. User enters pricing inputs including quantities, billing cadence, and margin behavior.
6. System generates a recommendation context preview snapshot.
7. Rules-engine policy stubs return readiness and fit previews.
8. User iterates on founder, business, package, or pricing inputs before deeper recommendation workflows exist.

## Founder Profile Flow
1. Capture operator background, region, and service motion.
2. Save the profile as recommendation input for an organization.
3. Reuse the profile for scenario generation.

## Business Model Flow
1. Define the offer posture using business type, delivery model, compliance sensitivity, budget positioning, and founder maturity.
2. Add target verticals and company sizes.
3. Persist the model as a reusable planning artifact.

## Service Package Builder Flow
1. Define the package shell with market position, SLA tier, support hours, and exclusions.
2. Add package items that declare required vs optional services.
3. Set included quantities and limits per item.
4. Save the package as the operational definition of the offer.

## Pricing Input Flow
1. Attach a pricing input record to a service package.
2. Define pricing unit, minimum quantity, included quantity, overage price, billing frequency, and contract term.
3. Persist target and floor margin expectations.
4. Feed the pricing input into recommendation scenario preview.

## Recommendation Context Preview Flow
1. Load the latest founder profile, business model, package, pricing input, vendor metadata, and baseline options.
2. Create a versioned recommendation scenario snapshot.
3. Run lightweight policy previews for pricing readiness, package completeness, stack fit structure, and baseline selection structure.
4. Return preview context and outputs to support model validation before deeper implementation.
