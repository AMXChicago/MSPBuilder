export interface SeedServiceDefinition {
  name: string;
  category: "helpdesk" | "security" | "network" | "compliance" | "cloud" | "vcio";
  description: string;
  baseUnit: "user" | "device" | "site" | "tenant" | "hour";
}

export const commonServiceDefinitions: SeedServiceDefinition[] = [
  {
    name: "Managed Help Desk",
    category: "helpdesk",
    description: "End-user support with ticket triage and escalation handling.",
    baseUnit: "user"
  },
  {
    name: "Endpoint Detection and Response",
    category: "security",
    description: "Managed endpoint protection and investigation workflow coverage.",
    baseUnit: "device"
  },
  {
    name: "Microsoft 365 Administration",
    category: "cloud",
    description: "Tenant administration, identity hygiene, and operational support.",
    baseUnit: "tenant"
  },
  {
    name: "Backup Monitoring",
    category: "security",
    description: "Backup health monitoring with restore-readiness checks.",
    baseUnit: "tenant"
  }
];
