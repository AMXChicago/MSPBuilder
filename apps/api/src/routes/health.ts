import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      status: "ok",
      service: "@launch-os/api"
    };
  });
}
