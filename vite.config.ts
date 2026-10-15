import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { Plugin } from "vite";

const demoCollections: Array<{ id: number; name: string; description: string }> = [];

const proxyPlugin = (): Plugin => ({
  name: "api-tracing-proxy",
  configureServer(server) {
    server.middlewares.use("/api/proxy", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      try {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk));
        }

        const payload = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
          url?: string;
          method?: string;
          headers?: Record<string, string>;
          body?: string;
        };
        const target = new URL(payload.url ?? "");
        if (!["http:", "https:"].includes(target.protocol)) {
          throw new Error("Only HTTP and HTTPS URLs are supported.");
        }

        const isDemoApi = target.hostname === "localhost" && target.port === "3000";
        if (isDemoApi && ["/api/collections", "/api/logs"].includes(target.pathname)) {
          const requestMethod = (payload.method ?? "GET").toUpperCase();
          let status = 200;
          let responseBody: unknown;

          if (target.pathname === "/api/collections" && requestMethod === "POST") {
            const input = JSON.parse(payload.body || "{}") as {
              name?: string;
              description?: string;
            };
            if (!input.name) {
              status = 400;
              responseBody = { error: "Collection name is required." };
            } else {
              const collection = {
                id: demoCollections.length + 1,
                name: input.name,
                description: input.description ?? "",
              };
              demoCollections.push(collection);
              responseBody = collection;
            }
          } else if (target.pathname === "/api/collections" && requestMethod === "GET") {
            responseBody = demoCollections;
          } else if (target.pathname === "/api/logs" && requestMethod === "GET") {
            responseBody = [];
          } else {
            status = 405;
            responseBody = { error: `Method ${requestMethod} is not supported for ${target.pathname}.` };
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({
            status,
            statusText: status === 200 ? "OK" : status === 400 ? "Bad Request" : "Method Not Allowed",
            body: JSON.stringify(responseBody),
            headers: {
              "content-type": "application/json",
              "server-timing": "demo-api;dur=1",
            },
          }));
          return;
        }

        const forwardedHeaders = Object.fromEntries(
          Object.entries(payload.headers ?? {}).filter(([name]) =>
            !["host", "content-length", "connection", "transfer-encoding"].includes(name.toLowerCase()),
          ),
        );
        forwardedHeaders.accept ??= "*/*";
        forwardedHeaders["user-agent"] ??= "API-Tracing/1.0";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        let response: Response;
        try {
          response = await fetch(target, {
            method: payload.method ?? "GET",
            headers: forwardedHeaders,
            redirect: "follow",
            body: payload.method && !["GET", "HEAD"].includes(payload.method)
              ? payload.body || undefined
              : undefined,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        const responseBody = await response.text();
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          body: responseBody,
          headers: responseHeaders,
        }));
      } catch (error) {
        const cause = error instanceof Error && error.cause instanceof Error
          ? `: ${error.cause.message}`
          : "";
        const errorCode = error && typeof error === "object" && "cause" in error
          && error.cause && typeof error.cause === "object" && "code" in error.cause
          ? ` (${String(error.cause.code)})`
          : "";
        const message = error instanceof DOMException && error.name === "AbortError"
          ? "The upstream API timed out after 30 seconds."
          : error instanceof Error
          ? `${error.message}${errorCode}${cause}`
          : "Proxy request failed";
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          error: message,
        }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mode === "development" && proxyPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
