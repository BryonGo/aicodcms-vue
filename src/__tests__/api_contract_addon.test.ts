import { describe, it, expect } from "vite-plus/test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

interface ApiEndpoint {
  file: string;
  method: string;
  path: string;
}

interface OpenApiDoc {
  paths?: Record<string, Record<string, unknown>>;
}

const API_JSON_URL = process.env.API_CONTRACT_API_JSON || "http://127.0.0.1:8201/api.json";
const ENABLED = process.env.API_CONTRACT_CHECK === "1";
const ADDON_API_DIR = join(process.cwd(), "src/api/addon");

const walkTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkTsFiles(full);
    return entry.isFile() && full.endsWith(".ts") ? [full] : [];
  });
};

const normalizeTemplatePath = (path: string) =>
  path.replace(/\$\{[^}]+\}/g, "{param}").replace(/\{[^/}]+\}/g, "{param}");

const extractAddonApiEndpoints = (): ApiEndpoint[] => {
  const endpoints: ApiEndpoint[] = [];
  for (const file of walkTsFiles(ADDON_API_DIR)) {
    const source = readFileSync(file, "utf8");
    const shortFile = relative(process.cwd(), file);

    // request({ url: '...', method: 'get' }) / request({ url: `...${id}`, method: 'get' })
    const objectCall =
      /request\s*\(\s*\{[\s\S]*?url\s*:\s*(['"`])([\s\S]*?)\1[\s\S]*?method\s*:\s*(['"`])([a-zA-Z]+)\3/g;
    for (const match of source.matchAll(objectCall)) {
      const rawPath = match[2];
      if (!rawPath.startsWith("/")) continue;
      endpoints.push({
        file: shortFile,
        path: normalizeTemplatePath(rawPath),
        method: match[4].toLowerCase(),
      });
    }

    // request.get('...') / request.post(`...${id}`)
    const methodCall = /request\.(get|post|put|delete|patch)\s*\(\s*(['"`])([\s\S]*?)\2/g;
    for (const match of source.matchAll(methodCall)) {
      const rawPath = match[3];
      if (!rawPath.startsWith("/")) continue;
      endpoints.push({
        file: shortFile,
        path: normalizeTemplatePath(rawPath),
        method: match[1].toLowerCase(),
      });
    }
  }

  const seen = new Set<string>();
  return endpoints.filter((endpoint) => {
    const key = `${endpoint.method} ${endpoint.path} ${endpoint.file}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fetchOpenApi = async (): Promise<OpenApiDoc | null> => {
  if (!ENABLED) return null;
  try {
    const res = await fetch(API_JSON_URL);
    if (!res.ok) return null;
    return (await res.json()) as OpenApiDoc;
  } catch {
    return null;
  }
};

const openApi = await fetchOpenApi();
const describeIfEnabled = ENABLED && openApi?.paths ? describe : describe.skip;

describeIfEnabled("addon API contract against backend api.json", () => {
  it("all frontend addon endpoints exist in backend OpenAPI paths with matching method", () => {
    const backend = new Map<string, Set<string>>();
    for (const [path, methods] of Object.entries(openApi?.paths || {})) {
      backend.set(
        normalizeTemplatePath(path),
        new Set(Object.keys(methods).map((method) => method.toLowerCase())),
      );
    }

    const missing = extractAddonApiEndpoints()
      .filter((endpoint) => !backend.get(endpoint.path)?.has(endpoint.method))
      .map((endpoint) => {
        const available = backend.get(endpoint.path);
        const hint = available
          ? `backend methods: ${Array.from(available).sort().join(",")}`
          : "backend path missing";
        return `${endpoint.file}: ${endpoint.method.toUpperCase()} ${endpoint.path} — ${hint}`;
      })
      .sort();

    expect(missing).toEqual([]);
  });
});

if (!ENABLED) {
  describe("addon API contract against backend api.json", () => {
    it.skip(`set API_CONTRACT_CHECK=1 to compare src/api/addon/** against ${API_JSON_URL}`, () => {});
  });
}
