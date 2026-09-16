import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const clientDirectory = path.join(projectRoot, "dist", "client");
const workerSourcePath = path.join(projectRoot, "server", "worker.js");
const workerOutputPath = path.join(projectRoot, "dist", "server", "index.js");
const placeholder =
  "const STATIC_ASSETS = globalThis.__AEI_STATIC_ASSETS__ || {};";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolutePath)));
    if (entry.isFile()) files.push(absolutePath);
  }

  return files;
}

const files = await listFiles(clientDirectory);
const assets = {};

for (const filename of files) {
  const relativePath = path.relative(clientDirectory, filename).split(path.sep).join("/");
  const extension = path.extname(filename).toLowerCase();
  const file = await readFile(filename);
  assets[`/${relativePath}`] = {
    contentType: contentTypes[extension] || "application/octet-stream",
    body: file.toString("base64"),
  };
}

const workerSource = await readFile(workerSourcePath, "utf8");
if (!workerSource.includes(placeholder)) {
  throw new Error("Worker static asset placeholder is missing.");
}

const bundledWorker = workerSource.replace(
  placeholder,
  `const STATIC_ASSETS = ${JSON.stringify(assets)};`
);

await mkdir(path.dirname(workerOutputPath), { recursive: true });
await writeFile(workerOutputPath, bundledWorker);

console.log(`Worker created with ${files.length} static assets.`);
