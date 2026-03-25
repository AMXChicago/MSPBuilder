import type { BusinessModel, FounderProfile, PricingInput, RecommendationScenario, ServicePackageAggregate } from "@launch-os/domain";

interface LaunchOsState {
  founderProfiles: Map<string, FounderProfile>;
  businessModels: Map<string, BusinessModel>;
  servicePackages: Map<string, ServicePackageAggregate>;
  pricingInputs: Map<string, PricingInput>;
  recommendationScenarios: Map<string, RecommendationScenario>;
}

const state: LaunchOsState = {
  founderProfiles: new Map(),
  businessModels: new Map(),
  servicePackages: new Map(),
  pricingInputs: new Map(),
  recommendationScenarios: new Map()
};

function now() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function upsertFounderProfile(input: Omit<FounderProfile, "id" | "createdAt" | "updatedAt"> & Partial<Pick<FounderProfile, "id" | "createdAt" | "updatedAt">>) {
  const existing = input.id ? state.founderProfiles.get(input.id) : null;
  const entity: FounderProfile = {
    ...input,
    id: existing?.id ?? input.id ?? createId("founder"),
    createdAt: existing?.createdAt ?? input.createdAt ?? now(),
    updatedAt: now()
  };
  state.founderProfiles.set(entity.id, entity);
  return entity;
}

export function upsertBusinessModel(input: Omit<BusinessModel, "id" | "createdAt" | "updatedAt"> & Partial<Pick<BusinessModel, "id" | "createdAt" | "updatedAt">>) {
  const existing = input.id ? state.businessModels.get(input.id) : null;
  const entity: BusinessModel = {
    ...input,
    id: existing?.id ?? input.id ?? createId("business"),
    createdAt: existing?.createdAt ?? input.createdAt ?? now(),
    updatedAt: now()
  };
  state.businessModels.set(entity.id, entity);
  return entity;
}

export function upsertServicePackage(input: Omit<ServicePackageAggregate, "id" | "createdAt" | "updatedAt" | "items"> & { items: Array<Omit<ServicePackageAggregate["items"][number], "id" | "organizationId" | "servicePackageId" | "createdAt" | "updatedAt"> & Partial<Pick<ServicePackageAggregate["items"][number], "id" | "createdAt" | "updatedAt">>> } & Partial<Pick<ServicePackageAggregate, "id" | "createdAt" | "updatedAt">>) {
  const existing = input.id ? state.servicePackages.get(input.id) : null;
  const packageId = existing?.id ?? input.id ?? createId("package");
  const entity: ServicePackageAggregate = {
    ...input,
    id: packageId,
    createdAt: existing?.createdAt ?? input.createdAt ?? now(),
    updatedAt: now(),
    items: input.items.map((item) => ({
      ...item,
      id: item.id ?? createId("package-item"),
      organizationId: input.organizationId,
      servicePackageId: packageId,
      createdAt: item.createdAt ?? now(),
      updatedAt: now()
    }))
  };
  state.servicePackages.set(entity.id, entity);
  return entity;
}

export function upsertPricingInput(input: Omit<PricingInput, "id" | "createdAt" | "updatedAt"> & Partial<Pick<PricingInput, "id" | "createdAt" | "updatedAt">>) {
  const existing = input.id ? state.pricingInputs.get(input.id) : null;
  const entity: PricingInput = {
    ...input,
    id: existing?.id ?? input.id ?? createId("pricing"),
    createdAt: existing?.createdAt ?? input.createdAt ?? now(),
    updatedAt: now()
  };
  state.pricingInputs.set(entity.id, entity);
  return entity;
}

export function getLatestFounderProfile(organizationId: string) {
  return [...state.founderProfiles.values()].filter((item) => item.organizationId === organizationId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export function getLatestBusinessModel(organizationId: string) {
  return [...state.businessModels.values()].filter((item) => item.organizationId === organizationId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export function getLatestServicePackage(organizationId: string) {
  return [...state.servicePackages.values()].filter((item) => item.organizationId === organizationId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export function getLatestPricingInput(organizationId: string) {
  return [...state.pricingInputs.values()].filter((item) => item.organizationId === organizationId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
}

export function saveScenario(input: Omit<RecommendationScenario, "id" | "createdAt" | "updatedAt"> & Partial<Pick<RecommendationScenario, "id" | "createdAt" | "updatedAt">>) {
  const entity: RecommendationScenario = {
    ...input,
    id: input.id ?? createId("scenario"),
    createdAt: input.createdAt ?? now(),
    updatedAt: now()
  };
  state.recommendationScenarios.set(entity.id, entity);
  return entity;
}
