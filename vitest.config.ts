import { defineConfig } from "vite-plus";
import { resolve } from "path";

const pathResolve = (dir: string): any => {
  return resolve(__dirname, ".", dir);
};

export default defineConfig({
  resolve: {
    alias: {
      "@": pathResolve("./src/"),
      "/@": pathResolve("./src/"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
