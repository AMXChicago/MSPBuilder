import { loadLocalEnvironment } from "./load-env";
import { createApp } from "./app";

loadLocalEnvironment();

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function main() {
  const app = createApp();
  await app.listen({ host, port });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
