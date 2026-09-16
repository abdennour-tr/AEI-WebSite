import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { sites } from "@openai/sites-vite-plugin";
import path from "path";
import { fileURLToPath } from "url";
import portalWorker from "./server/worker.js";

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
        SUPABASE_URL:
          process.env.SUPABASE_URL || localEnvironment.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY:
          process.env.SUPABASE_ANON_KEY ||
          localEnvironment.VITE_SUPABASE_PUBLISHABLE_KEY,
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
