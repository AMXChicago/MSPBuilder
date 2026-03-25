import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __launchOsPrisma__: PrismaClient | undefined;
}

export function createPrismaClient() {
  return new PrismaClient();
}

export const prisma = globalThis.__launchOsPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__launchOsPrisma__ = prisma;
}
