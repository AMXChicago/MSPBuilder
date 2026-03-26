import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseEnvFile(content: string) {
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadLocalEnvironment() {
  const candidatePaths = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "apps", "api", ".env")
  ];

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      parseEnvFile(readFileSync(candidatePath, "utf8"));
      break;
    }
  }
}
