import { describe, it, expect } from "vite-plus/test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

interface ApiEndpoint {
  file: string;
  method: string;
  path: string;
  symbol?: string;
}

interface OpenApiDoc {
  paths?: Record<string, Record<string, any>>;
  components?: {
    schemas?: Record<string, any>;
  };
}

interface CriticalResponseContract {
  name: string;
  path: string;
  method: string;
  fields: string[];
  itemFields?: string[];
}

interface CriticalRequestContract {
  name: string;
  path: string;
  method: string;
  location: "query" | "body";
  fields: string[];
}

const API_JSON_URL = process.env.API_CONTRACT_API_JSON || "http://127.0.0.1:8201/api.json";
const ENABLED = process.env.API_CONTRACT_CHECK === "1";
const API_DIRS = ["addon", "cms", "pms"].map((name) =>
  join(process.cwd(), "src/api", name),
);

const walkTsFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkTsFiles(full);
    return entry.isFile() && full.endsWith(".ts") ? [full] : [];
  });
};

const normalizeTemplatePath = (path: string) =>
  path
    .replace(/\$\{[^}]+\}/g, "{param}")
    .replace(/\{[^/}]+\}/g, "{param}")
    .replace(/\/$/, "") || "/";

const extractApiEndpoints = (): ApiEndpoint[] => {
  const endpoints: ApiEndpoint[] = [];
  for (const apiDir of API_DIRS) {
    for (const file of walkTsFiles(apiDir)) {
      const source = readFileSync(file, "utf8");
      const shortFile = relative(process.cwd(), file);
      const symbolBefore = (offset: number) => {
        const prefix = source.slice(0, offset);
        const matches = prefix.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/g);
        return matches?.at(-1)?.match(/function\s+(\w+)/)?.[1];
      };

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
          symbol: symbolBefore(match.index ?? 0),
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
          symbol: symbolBefore(match.index ?? 0),
        });
      }
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

const walkSourceFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return walkSourceFiles(full);
    return /\.(ts|vue)$/.test(entry.name) ? [full] : [];
  });
};

const applicationSource = walkSourceFiles(join(process.cwd(), "src"))
  .map((file) => ({ file: relative(process.cwd(), file), source: readFileSync(file, "utf8") }));

// These are the response fields consumed by high-risk pages. URL/method matching alone
// cannot detect a renamed JSON field that would render an empty table without errors.
const criticalResponseContracts: CriticalResponseContract[] = [
  {
    name: "admin login",
    path: "/api/v1/pms/login",
    method: "post",
    fields: ["token", "menu_list", "permissions"],
  },
  {
    name: "user menus",
    path: "/api/v1/pms/user/menus",
    method: "get",
    fields: ["menu_list", "permissions"],
  },
  {
    name: "completed orders",
    path: "/api/v1/addon/order/completed/list",
    method: "get",
    fields: ["list", "total"],
    itemFields: ["platform_order_id", "product_id"],
  },
  {
    name: "shared notify logs",
    path: "/api/v1/addon/order/notify-log/list",
    method: "get",
    fields: ["list", "total"],
    itemFields: ["notify_state", "notify_result", "notify_url"],
  },
];

const criticalRequestContracts: CriticalRequestContract[] = [
  {
    name: "admin login",
    path: "/api/v1/pms/login",
    method: "post",
    location: "body",
    fields: ["username", "password"],
  },
  {
    name: "completed orders",
    path: "/api/v1/addon/order/completed/list",
    method: "get",
    location: "query",
    fields: ["app_id", "uid", "keyword", "page", "row"],
  },
  {
    name: "shared notify logs",
    path: "/api/v1/addon/order/notify-log/list",
    method: "get",
    location: "query",
    fields: ["app_id", "uid", "order_id", "keyword", "page", "row"],
  },
];

const resolveSchema = (schema: any, openApiDoc: OpenApiDoc): any => {
  if (!schema?.$ref) return schema;
  const prefix = "#/components/schemas/";
  if (!schema.$ref.startsWith(prefix)) return schema;
  return openApiDoc.components?.schemas?.[schema.$ref.slice(prefix.length)];
};

const responseFieldGroups = (path: string, method: string) => {
  const operation = openApi?.paths?.[path]?.[method];
  const schema = operation?.responses?.["200"]?.content?.["application/json"]?.schema;
  const dataSchema = resolveSchema(schema, openApi || {})?.properties?.data;
  const resolvedData = resolveSchema(dataSchema, openApi || {});
  const listSchema = resolveSchema(resolvedData?.properties?.list?.items, openApi || {});
  return {
    envelope: new Set(Object.keys(resolvedData?.properties || {})),
    item: new Set(Object.keys(listSchema?.properties || {})),
  };
};

const requestFields = (contract: CriticalRequestContract): Set<string> => {
  const operation = openApi?.paths?.[contract.path]?.[contract.method];
  if (contract.location === "query") {
    return new Set((operation?.parameters || [])
      .filter((parameter: any) => parameter.in === "query")
      .map((parameter: any) => parameter.name));
  }
  const schema = operation?.requestBody?.content?.["application/json"]?.schema;
  return new Set(Object.keys(resolveSchema(schema, openApi || {})?.properties || {}));
};

const isApiSymbolUsedByApplication = (endpoint: ApiEndpoint): boolean => {
  if (!endpoint.symbol) return true;
  const symbolPattern = new RegExp(`\\b${endpoint.symbol}\\b`);
  return applicationSource.some(
    ({ file, source }) => file !== endpoint.file && symbolPattern.test(source),
  );
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
const describeIfEnabled = ENABLED ? describe : describe.skip;

describeIfEnabled("business API contract against backend api.json", () => {
  it("backend OpenAPI is available when the contract check is enabled", () => {
    expect(openApi?.paths).toBeDefined();
  });

  it("critical response contracts expose the fields consumed by Vue", () => {
    if (!openApi?.paths) return;

    const missing = criticalResponseContracts.flatMap((contract) => {
      const groups = responseFieldGroups(contract.path, contract.method);
      const envelopeMissing = contract.fields
        .filter((field) => !groups.envelope.has(field))
        .map((field) => `${contract.name}: ${contract.method.toUpperCase()} ${contract.path} missing response field ${field}`);
      const itemMissing = (contract.itemFields || [])
        .filter((field) => !groups.item.has(field))
        .map((field) => `${contract.name}: ${contract.method.toUpperCase()} ${contract.path} list item missing ${field}`);
      return [...envelopeMissing, ...itemMissing];
    });

    expect(missing).toEqual([]);
  });

  it("critical request contracts expose the fields sent by Vue", () => {
    if (!openApi?.paths) return;

    const missing = criticalRequestContracts.flatMap((contract) => {
      const fields = requestFields(contract);
      return contract.fields
        .filter((field) => !fields.has(field))
        .map((field) => `${contract.name}: ${contract.method.toUpperCase()} ${contract.path} missing ${contract.location} field ${field}`);
    });

    expect(missing).toEqual([]);
  });

  it("all frontend business endpoints exist in backend OpenAPI paths with matching method", () => {
    if (!openApi?.paths) return;

    const backend = new Map<string, Set<string>>();
    for (const [path, methods] of Object.entries(openApi?.paths || {})) {
      backend.set(
        normalizeTemplatePath(path),
        new Set(Object.keys(methods).map((method) => method.toLowerCase())),
      );
    }

    const missing = extractApiEndpoints()
      .filter(isApiSymbolUsedByApplication)
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
  describe("business API contract against backend api.json", () => {
    it.skip(`set API_CONTRACT_CHECK=1 to compare src/api/{addon,cms,pms}/** against ${API_JSON_URL}`, () => {});
  });
}
