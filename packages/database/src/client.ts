import { PrismaClient } from "@prisma/client";

declare global {
  var __launchOsPrisma__: PrismaClient | undefined;
}

export type DatabasePrismaClient = PrismaClient;

export function createPrismaClient() {
  return new PrismaClient();
}

export const prisma = globalThis.__launchOsPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__launchOsPrisma__ = prisma;
}
