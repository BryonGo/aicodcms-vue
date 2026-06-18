import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    staged: {
      "*": "true /* vp check --fix skipped */",
    },
    plugins: [vue(), tailwindcss()],
    resolve: { alias },
    base: mode === "development" ? "./" : env.VITE_PUBLIC_PATH,
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_PORT) || 8888,
      open: env.VITE_OPEN === "true",
      proxy: {},
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
