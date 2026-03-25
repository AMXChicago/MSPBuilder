export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorShape {
  ok: false;
  error: {
    message: string;
    code: string;
  };
}

export interface WorkflowStateResponse {
  tenant: {
    organizationId: string;
    userId?: string;
  };
  founderProfile: {
    id: string;
    fullName: string;
    roleTitle: string;
    priorExperienceYears: number;
    targetGeo: string;
    serviceMotion: "managed-services" | "project-led" | "security-led" | "hybrid";
    maturityLevel: "new" | "growing" | "established";
    salesConfidence: number;
    technicalDepth: number;
    preferredEngagementModel: "fractional-founder" | "owner-operator" | "team-led";
  } | null;
  businessModel: {
    id: string;
    name: string;
    businessType: "msp" | "mssp" | "hybrid" | "co-managed";
    targetVerticals: string[];
    targetCompanySizes: string[];
    deliveryModel: "remote" | "onsite" | "hybrid";
    complianceSensitivity: "low" | "medium" | "high";
    budgetPositioning: "budget" | "standard" | "premium";
    founderMaturity: "beginner" | "intermediate" | "advanced";
    revenueStrategy: "recurring" | "hybrid" | "project-first";
    targetGrossMarginPercent: number;
  } | null;
  servicePackage: {
    id: string;
    name: string;
    marketPosition: "good" | "better" | "best" | "enterprise";
    description: string;
    targetPersona: string;
    includesSecurityBaseline: boolean;
    defaultSlaTier: "best-effort" | "standard" | "priority" | "24x7";
    defaultSupportHours: "business-hours" | "extended-hours" | "24x7";
    defaultExclusions: string[];
    items: Array<{
      id: string;
      serviceDefinitionId: string;
    }>;
  } | null;
  pricingModel: {
    id: string;
    servicePackageId: string;
    pricingUnit: "user" | "device" | "hybrid";
    monthlyBasePrice: number;
    onboardingFee: number;
    minimumQuantity: number;
    includedQuantity: number;
    overageUnitPrice: number;
    billingFrequency: "monthly" | "quarterly" | "annual";
    contractTermMonths: number;
    passthroughCost: number;
    markupPercentage: number;
    targetMarginPercent: number;
    floorMarginPercent: number;
    effectiveMarginPercent?: number;
  } | null;
  latestRecommendation: {
    summary: string;
  } | null;
  referenceData: {
    serviceDefinitions: Array<{
      id: string;
      name: string;
      category: string;
    }>;
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccessResponse<T> | ApiErrorShape;

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.ok === false ? payload.error.message : `Request failed with status ${response.status}`);
  }

  return payload.data;
}

export async function saveJson<TResponse>(path: string, payload: unknown, method: "POST" | "PUT" = "POST"): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseApiResponse<TResponse>(response);
}

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  return parseApiResponse<TResponse>(response);
}

export async function getWorkflowState() {
  return getJson<WorkflowStateResponse>("/workflow/state");
}

export function splitCommaSeparatedList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitLineSeparatedList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
