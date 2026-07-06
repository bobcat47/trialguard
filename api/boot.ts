import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { trpcServer } from "@trpc/server/adapters/hono";
import { appRouter } from "./router";
import { createContext } from "./context";
import { authHandler } from "./kimi/auth";
import { config } from "dotenv";

config();

const app = new Hono();

// Health check
app.get("/api/ping", (c) => c.json({ ok: true, time: Date.now() }));

// OAuth routes
app.get("/api/oauth/callback", authHandler);

// tRPC API
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError: ({ error }) => console.error("tRPC error:", error),
  })
);

// Static files (frontend)
app.use("/*", async (c, next) => {
  const fs = await import("fs/promises");
  const path = await import("path");
  const { fileURLToPath } = await import("url");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicDir = path.join(__dirname, "public");

  const url = new URL(c.req.url);
  let filePath = path.join(publicDir, url.pathname === "/" ? "index.html" : url.pathname);

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };
    return c.newResponse(content, 200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
  } catch {
    // Fallback to index.html for SPA routing
    try {
      const content = await fs.readFile(path.join(publicDir, "index.html"));
      return c.newResponse(content, 200, { "Content-Type": "text/html" });
    } catch {
      return next();
    }
  }
});

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running at http://localhost:${port}`);
});
