export interface PackageArchetypeItem {
  serviceName: string;
  requirement: "required" | "optional";
  includedQuantity: number;
  quantityUnit: string;
}

export interface PackageArchetype {
  name: string;
  marketPosition: "good" | "better" | "best" | "enterprise";
  slaTier: "best-effort" | "business-hours" | "priority" | "24x7";
  supportHours: "business-hours" | "extended-hours" | "24x7";
  exclusions: string[];
  items: PackageArchetypeItem[];
}

export const packageArchetypes: PackageArchetype[] = [
  {
    name: "Core Managed MSP",
    marketPosition: "better",
    slaTier: "business-hours",
    supportHours: "business-hours",
    exclusions: ["After-hours project work", "Line-of-business application support"],
    items: [
      { serviceName: "Managed Help Desk", requirement: "required", includedQuantity: 1, quantityUnit: "user" },
      { serviceName: "Microsoft 365 Administration", requirement: "required", includedQuantity: 1, quantityUnit: "tenant" },
      { serviceName: "Backup Monitoring", requirement: "optional", includedQuantity: 1, quantityUnit: "tenant" }
    ]
  },
  {
    name: "Security-Led MSSP",
    marketPosition: "best",
    slaTier: "priority",
    supportHours: "24x7",
    exclusions: ["Compliance audit execution", "Incident retainer legal services"],
    items: [
      { serviceName: "Endpoint Detection and Response", requirement: "required", includedQuantity: 1, quantityUnit: "device" },
      { serviceName: "Backup Monitoring", requirement: "required", includedQuantity: 1, quantityUnit: "tenant" }
    ]
  }
];
