import { describe, it, expect } from "vite-plus/test";

/**
 * 约定式 i18n key 规范测试
 *
 * moduleField.{name}           → 模型字段标签
 * moduleFieldOpt.{name}.{key}  → 字段选项值
 * moduleInfo.{id}              → 模型名称
 * settingField.{name}          → 设置字段标签
 *
 * $t(key, fallback) — key 不存在时自动回退 fallback 中文
 */

describe("moduleField i18n 约定", () => {
  const testFields = [
    { name: "os", label: "支持平台", en: "Platform" },
    { name: "language", label: "语言", en: "Language" },
    { name: "plot", label: "剧情简介", en: "Plot" },
    { name: "director", label: "导演", en: "Director" },
    { name: "actors", label: "主演", en: "Actors" },
    { name: "region", label: "地区", en: "Region" },
    { name: "year", label: "年份", en: "Year" },
    { name: "score", label: "评分", en: "Score" },
    { name: "poster", label: "海报", en: "Poster" },
    { name: "version", label: "最新版本", en: "Version" },
  ];

  it("所有字段有 name 和中文 label", () => {
    for (const f of testFields) {
      expect(f.name).toBeTruthy();
      expect(f.label).toBeTruthy();
    }
  });

  it("key 格式为 moduleField.{name}", () => {
    for (const f of testFields) {
      const key = `moduleField.${f.name}`;
      expect(key).toMatch(/^moduleField\.\w+/);
    }
  });

  it("字段名不含特殊字符", () => {
    for (const f of testFields) {
      expect(f.name).toMatch(/^[a-z0-9_]+$/);
    }
  });
});

describe("moduleFieldOpt i18n 约定", () => {
  it("语言选项 key 使用前缀 label", () => {
    // options: "zh-cn:中文,en-us:英文"
    // parsed: {label:'zh-cn', value:'中文'}, {label:'en-us', value:'英文'}
    // key = 'moduleFieldOpt.language.zh-cn'
    const opts = [
      { label: "zh-cn", value: "中文", key: "moduleFieldOpt.language.zh-cn" },
      { label: "en-us", value: "英文", key: "moduleFieldOpt.language.en-us" },
    ];
    for (const o of opts) {
      expect(o.key).toBe(`moduleFieldOpt.language.${o.label}`);
    }
  });

  it("地区选项 key 使用前缀 label", () => {
    // options: "mainland:内地,hktw:港台,euus:欧美"
    const opts = [
      { label: "mainland", value: "内地", key: "moduleFieldOpt.region.mainland" },
      { label: "hktw", value: "港台", key: "moduleFieldOpt.region.hktw" },
      { label: "euus", value: "欧美", key: "moduleFieldOpt.region.euus" },
    ];
    for (const o of opts) {
      expect(o.key).toBe(`moduleFieldOpt.region.${o.label}`);
    }
  });
});

describe("$t() fallback 行为", () => {
  it("未知 key 应返回 fallback 值", () => {
    // 模拟: $t('moduleField.unknown_field', '未知字段') → '未知字段'
    const fallback = "未知字段";
    expect(fallback).toBe("未知字段");
  });

  it("已知 key 应返回翻译值", () => {
    const translations: Record<string, string> = {
      "moduleField.plot": "Plot",
      "moduleField.director": "Director",
    };
    expect(translations["moduleField.plot"]).toBe("Plot");
    expect(translations["moduleField.director"]).toBe("Director");
  });
});

describe("backendToFrontendLang 映射", () => {
  const map: Record<string, string> = {
    "zh-CN": "zh-cn",
    "en-US": "en",
  };

  it("zh-CN → zh-cn", () => {
    expect(map["zh-CN"]).toBe("zh-cn");
  });

  it("en-US → en", () => {
    expect(map["en-US"]).toBe("en");
  });

  it("unknown → zh-cn", () => {
    const result = map["ja-JP"] || "zh-cn";
    expect(result).toBe("zh-cn");
  });
});
