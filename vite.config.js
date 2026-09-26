import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { sites } from "@openai/sites-vite-plugin";
import path from "path";
import { fileURLToPath } from "url";
import portalWorker from "./server/worker.js";
import { handleReportNotification } from "./api/report-notification.js";
import { handleCourseSummary } from "./api/course-summary.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function portalApiDevPlugin(environment) {
  return {
    name: "aei-portal-api-dev",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (request, response) => {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);

        const headers = new Headers();
        for (const [name, value] of Object.entries(request.headers)) {
          if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
          else if (value !== undefined) headers.set(name, value);
        }

        const webRequest = new Request("http://localhost/api/chat", {
          method: request.method,
          headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        });
        const webResponse = await portalWorker.fetch(webRequest, environment);

        response.statusCode = webResponse.status;
        webResponse.headers.forEach((value, name) => response.setHeader(name, value));
        response.end(Buffer.from(await webResponse.arrayBuffer()));
      });

      server.middlewares.use("/api/report-notification", async (request, response) => {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);

        const headers = new Headers();
        for (const [name, value] of Object.entries(request.headers)) {
          if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
          else if (value !== undefined) headers.set(name, value);
        }

        const webRequest = new Request("http://localhost/api/report-notification", {
          method: request.method,
          headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        });
        const webResponse = await handleReportNotification(webRequest, environment);
        response.statusCode = webResponse.status;
        webResponse.headers.forEach((value, name) => response.setHeader(name, value));
        response.end(Buffer.from(await webResponse.arrayBuffer()));
      });

      server.middlewares.use("/api/course-summary", async (request, response) => {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);

        const headers = new Headers();
        for (const [name, value] of Object.entries(request.headers)) {
          if (Array.isArray(value)) value.forEach((item) => headers.append(name, item));
          else if (value !== undefined) headers.set(name, value);
        }

        const webRequest = new Request("http://localhost/api/course-summary", {
          method: request.method,
          headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        });
        const webResponse = await handleCourseSummary(webRequest, environment);
        response.statusCode = webResponse.status;
        webResponse.headers.forEach((value, name) => response.setHeader(name, value));
        response.end(Buffer.from(await webResponse.arrayBuffer()));
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const localEnvironment = loadEnv(mode, currentDirectory, "");

  return {
    plugins: [
      portalApiDevPlugin({
        GROQ_API_KEY: process.env.GROQ_API_KEY || localEnvironment.GROQ_API_KEY,
        GROQ_MODEL: process.env.GROQ_MODEL || localEnvironment.GROQ_MODEL,
        SUPABASE_URL:
          process.env.SUPABASE_URL || localEnvironment.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY:
          process.env.SUPABASE_ANON_KEY ||
          localEnvironment.VITE_SUPABASE_PUBLISHABLE_KEY,
        RESEND_API_KEY:
          process.env.RESEND_API_KEY || localEnvironment.RESEND_API_KEY,
        REPORTS_FROM_EMAIL:
          process.env.REPORTS_FROM_EMAIL || localEnvironment.REPORTS_FROM_EMAIL,
        ADMIN_REPORT_EMAIL:
          process.env.ADMIN_REPORT_EMAIL || localEnvironment.ADMIN_REPORT_EMAIL,
      }),
      tailwindcss(),
      react(),
      sites(),
    ],
    build: {
      outDir: "dist/client",
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(currentDirectory, "src"),
      },
    },
  };
});
