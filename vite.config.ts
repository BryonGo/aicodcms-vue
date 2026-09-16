import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { execSync } from "child_process";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv } from "vite-plus";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

const pathResolve = (dir: string): string => {
  return resolve(__dirname, ".", dir);
};

const alias: Record<string, string> = {
  "@": pathResolve("./src/"),
  "/@": pathResolve("./src/"),
};

export const fmt = {
  printWidth: 150,
  tabWidth: 2,
  useTabs: true,
  semi: true,
  singleQuote: true,
  quoteProps: "as-needed",
  jsxSingleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "always",
  rangeStart: 0,
  rangeEnd: null,
  requirePragma: false,
  insertPragma: false,
  proseWrap: "preserve",
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  endOfLine: "lf",
  sortPackageJson: false,
  ignorePatterns: [],
};

export const lint = { options: { typeAware: true, typeCheck: true } };

/**
 * dev 下把 `/version.json` 换成 `dev-<短 sha>[-dirty]`。
 *
 * 为什么需要：本地没人传 CONSOLE_BUILD_VERSION，`public/version.json` 是**已提交**的
 * 占位文件（内容恒为 {"version":"dev"}），任何服务都分辨不出这个 dev server 跑的是哪一版
 * 代码 —— 而这正是本地最常问的问题。生产不受影响：这个插件只在 serve 阶段生效，
 * 生产读的仍是容器启动脚本写进 /admin/version.json 的镜像 tag。
 *
 * 用中间件覆盖而不是改写 public/version.json：后者是跟踪文件，改它会污染工作区。
 * 时间点取**配置求值**（≈ dev server 启动），与 API 侧 buildinfo 的口径一致：
 * 它表达的是"这个进程从哪一版启动"，变了就说明需要重启。
 */
function devVersionPlugin() {
  return {
    name: "console-dev-version",
    apply: "serve" as const,
    configureServer(server: {
      middlewares: {
        use: (fn: (req: { url?: string }, res: any, next: () => void) => void) => void;
      };
    }) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (!path.endsWith("/version.json")) return next();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ version: devBuildVersion() }));
      });
    },
  };
}

/** dev-<短 sha>[-dirty]；取不到 git 就退回 "dev"。 */
function devBuildVersion(): string {
  try {
    const sha = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    if (!sha) return "dev";
    // dirty 不能省：本地几乎总带未提交改动，只报 sha 会让人以为跑的就是那个提交。
    const dirty = execSync("git status --porcelain", { encoding: "utf8" }).trim() !== "";
    return `dev-${sha}${dirty ? "-dirty" : ""}`;
  } catch {
    return "dev";
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    staged: {
      "*": "true /* vp check --fix skipped */",
    },
    plugins: [vue(), tailwindcss(), devVersionPlugin()],
    resolve: { alias },
    base: mode === "development" ? "./" : env.VITE_PUBLIC_PATH,
    server: {
      host: "0.0.0.0",
      allowedHosts: ["console.taohuadao.app", "console.thdmid.com", "localhost"],
      port: Number(env.VITE_PORT) || 8888,
      open: env.VITE_OPEN === "true",
      proxy: {},
      // 忽略编辑器原子写残留的临时目录（.en.ts.<pid>.<uuid>.tmpdir），
      // 否则文件被锁时 watcher 抛 EBUSY 导致 dev server 崩溃
      watch: {
        ignored: ["**/.*.tmpdir/**", "**/.tmp/**"],
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].[hash].js`,
          chunkFileNames: `assets/[name].[hash].js`,
          assetFileNames: `assets/[name].[hash].[ext]`,
          manualChunks(id: string) {
            if (
              id.includes("node_modules/vue") ||
              id.includes("node_modules/vue-router") ||
              id.includes("node_modules/pinia")
            )
              return "vue";
            if (id.includes("node_modules/echarts")) return "echarts";
          },
        },
      },
    },
    define: {
      __VUE_I18N_LEGACY_API__: JSON.stringify(false),
      __VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
      __INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
    },
  };
});
