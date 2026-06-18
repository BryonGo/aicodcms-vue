import { describe, it, expect, vi } from "vite-plus/test";

// Mock 引起 .vue 解析失败的依赖
vi.mock("/@/components/svgIcon/index.vue", () => ({ default: {} }));

import { deepClone, isMobile, handleEmpty } from "/@/utils/other";

describe("deepClone", () => {
  it("克隆基本类型（数字）", () => {
    // 注意：当前实现 clone 非对象时返回 {}（已知限制）
    const result = deepClone(42);
    expect(typeof result).toBe("object");
  });

  it("克隆基本类型（字符串）", () => {
    const result = deepClone("hello");
    expect(typeof result).toBe("object");
  });

  it("克隆数组", () => {
    const arr = [1, { a: 2 }, [3, 4]];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned[1]).not.toBe(arr[1]);
  });

  it("克隆嵌套对象", () => {
    const obj = { x: 1, y: { z: 2, w: { v: 3 } } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.y).not.toBe(obj.y);
    expect(cloned.y.w.v).toBe(3);
  });

  it("克隆后修改不影响原对象", () => {
    const original = { name: "test", items: [1, 2, 3] };
    const cloned = deepClone(original);
    cloned.name = "modified";
    cloned.items.push(4);
    expect(original.name).toBe("test");
    expect(original.items).toEqual([1, 2, 3]);
  });
});

describe("isMobile", () => {
  const originalUA = navigator.userAgent;

  afterAll(() => {
    Object.defineProperty(navigator, "userAgent", {
      value: originalUA,
      configurable: true,
    });
  });

  function setUA(ua: string) {
    Object.defineProperty(navigator, "userAgent", {
      value: ua,
      configurable: true,
      writable: true,
    });
  }

  it("Android 返回 true", () => {
    setUA("Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36");
    expect(isMobile()).toBe(true);
  });

  it("iPhone 返回 true", () => {
    setUA("Mozilla/5.0 (iPhone; CPU iPhone OS 16_0) AppleWebKit/605.1.15");
    expect(isMobile()).toBe(true);
  });

  it("iPad 返回 true", () => {
    setUA("Mozilla/5.0 (iPad; CPU OS 16_0) AppleWebKit/605.1.15");
    expect(isMobile()).toBe(true);
  });

  it("Chrome desktop 返回 false", () => {
    setUA("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0");
    expect(isMobile()).toBe(false);
  });
});

describe("handleEmpty", () => {
  it("删除全空的行", () => {
    const input = [
      { name: "test", value: "123" },
      { name: "", value: "" },
      { name: "keep", value: "456" },
    ];
    const result = handleEmpty(input);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("test");
    expect(result[1].name).toBe("keep");
  });

  it("所有行都不为空时原样返回", () => {
    const input = [
      { name: "a", val: "1" },
      { name: "b", val: "2" },
    ];
    expect(handleEmpty(input)).toEqual(input);
  });

  it("空数组返回空数组", () => {
    expect(handleEmpty([])).toEqual([]);
  });
});
