import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health";
import { registerLaunchOsRoutes } from "./routes/internal/launch-os";
import { registerRecommendationRoutes } from "./routes/recommendation";

export function createApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });
  app.register(sensible);
  app.register(registerHealthRoutes, { prefix: "/health" });
  app.register(registerLaunchOsRoutes, { prefix: "/internal" });
  app.register(registerRecommendationRoutes, { prefix: "/recommendation" });

  return app;
}
