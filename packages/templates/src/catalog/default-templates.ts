import type { TemplateAsset } from "@launch-os/domain";

export const defaultTemplateCatalog: Omit<TemplateAsset, "organizationId" | "createdAt" | "updatedAt">[] = [
  {
    id: "tmpl-master-service-agreement",
    name: "Master Service Agreement",
    kind: "contract",
    slug: "master-service-agreement",
    version: "0.1.0",
    status: "draft",
    variables: ["client_name", "services_summary", "billing_terms"]
  },
  {
    id: "tmpl-client-onboarding-checklist",
    name: "Client Onboarding Checklist",
    kind: "checklist",
    slug: "client-onboarding-checklist",
    version: "0.1.0",
    status: "draft",
    variables: ["client_name", "stack_components", "go_live_date"]
  },
  {
    id: "tmpl-qbr-sop",
    name: "Quarterly Business Review SOP",
    kind: "sop",
    slug: "quarterly-business-review-sop",
    version: "0.1.0",
    status: "draft",
    variables: ["client_segment", "kpi_summary", "recommendations"]
  }
];
