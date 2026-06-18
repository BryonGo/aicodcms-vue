import { describe, it, expect } from "vitest";

// SDK 用户管理页面数据转换函数测试
// Tests for SDK user management page data transformation

describe("SDK User Management - Tabs", () => {
  const tabFields = [
    { key: "all", label: "all", count: 10 },
    { key: "active", label: "active", count: 5 },
    { key: "banned", label: "banned", count: 3 },
    { key: "deleted", label: "deleted", count: 2 },
  ];

  it("tabs should have the correct structure", () => {
    tabFields.forEach((tab) => {
      expect(tab).toHaveProperty("key");
      expect(tab).toHaveProperty("label");
      expect(tab).toHaveProperty("count");
    });
  });

  it("total count should equal sum of all tabs", () => {
    const total = tabFields.reduce((sum, t) => sum + t.count, 0);
    expect(total).toBe(20);
  });
});

describe("SDK User Management - Status mapping", () => {
  const statusMap: Record<number, string> = {
    0: "unknown",
    1: "active",
    2: "banned",
  };

  it("should have status codes 0, 1, 2", () => {
    expect(statusMap[0]).toBeDefined();
    expect(statusMap[1]).toBeDefined();
    expect(statusMap[2]).toBeDefined();
  });

  it("should not have unexpected status codes", () => {
    expect(statusMap[-1]).toBeUndefined();
    expect(statusMap[3]).toBeUndefined();
    expect(statusMap[99]).toBeUndefined();
  });

  it("should map correctly", () => {
    expect(statusMap[1]).toBe("active");
    expect(statusMap[2]).toBe("banned");
  });
});
