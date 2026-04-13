import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import mainRouter from "./routes";

const app = new Hono().basePath("/api");
app.use("*", logger());
app.use("*", async (c, next) => {
  if (!c.env?.CLIENT_BASE_URI) {
    const context = getCloudflareContext();
    c.env = context.env;
  }
  await next();
});
app.onError(globalErrorHandler);

app.route("/", mainRouter);

export default app;
