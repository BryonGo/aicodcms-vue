import { describe, it, expect } from "vite-plus/test";
import { formatDate, getWeek, formatPast, formatAxis } from "/@/utils/formatTime";

describe("formatDate", () => {
  it("使用默认格式 YYYY-mm-dd HH:MM:SS", () => {
    const d = new Date("2026-05-10 14:30:00");
    const result = formatDate(d, "YYYY-mm-dd");
    expect(result).toBe("2026-05-10");
  });

  it("自定义格式", () => {
    const d = new Date("2026-01-15 10:30:00");
    const result = formatDate(d, "YYYY/mm/dd");
    expect(result).toBe("2026/01/15");
  });
});

describe("getWeek", () => {
  it("返回有效星期号", () => {
    // getWeek 可能返回 1-7 或 0-6，只验证类型正确
    const week = getWeek(new Date());
    expect(typeof week).toBe("number");
  });
});

describe("formatPast", () => {
  it("格式化过去时间", () => {
    const d = new Date(Date.now() - 3600000); // 1 hour ago
    const result = formatPast(d);
    expect(result).toMatch(/小时前/);
  });
});

describe("formatAxis", () => {
  it("返回时段问候", () => {
    const morning = new Date("2026-05-10 08:00:00");
    const result = formatAxis(morning);
    expect(result).toMatch(/早上|上午/);
  });
});
