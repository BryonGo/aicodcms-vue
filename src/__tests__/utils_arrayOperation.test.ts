import { describe, it, expect } from "vite-plus/test";

describe("arrayOperation", () => {
  it("数组去重", async () => {
    const mod = await import("/@/utils/arrayOperation");
    const result = mod.unique?.(["a", "b", "a", "c", "b"]);
    if (result) {
      expect(result).toEqual(["a", "b", "c"]);
    }
  });
});
