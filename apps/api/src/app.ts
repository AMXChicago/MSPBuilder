import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health";

export function createApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });
  app.register(sensible);
  app.register(registerHealthRoutes, { prefix: "/health" });

  return app;
}
