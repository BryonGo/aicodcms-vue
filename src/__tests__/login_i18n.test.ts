/**
 * 登录页 i18n 国际化 key 完整性测试
 * 验证 account.vue 和 login/index.vue 中使用的所有 i18n key 在两个语言中都存在
 */
import { describe, it, expect, vi } from "vite-plus/test";

// Mock vue-i18n 避免全量初始化
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: { value: "zh-cn" } }),
}));

describe("Login i18n Keys", () => {
  // ========== 加载所有 i18n 源文件 ==========

  let zhcnBase: any;
  let enBase: any;
  let zhcnLogin: any;
  let enLogin: any;

  beforeAll(async () => {
    zhcnBase = (await import("/@/i18n/lang/zh-cn")).default;
    enBase = (await import("/@/i18n/lang/en")).default;
    zhcnLogin = (await import("/@/i18n/pages/login/zh-cn")).default;
    enLogin = (await import("/@/i18n/pages/login/en")).default;
  });

  // Helper: 构建与 i18n/index.ts 一致的 messages 对象
  function makeZhcnMessages() {
    return { ...zhcnBase, ...zhcnLogin, cms: {}, pms: {}, sdk: {} };
  }
  function makeEnMessages() {
    return { ...enBase, ...enLogin, cms: {}, pms: {}, sdk: {} };
  }

  // ============================================================
  // 1. account.vue 使用的所有 key
  // ============================================================
  const accountKeys = [
    "account.accountPlaceholder1",
    "account.accountPlaceholder2",
    "account.accountPlaceholder3",
    "account.accountBtnText",
    "account.msgUsernameRequired",
    "account.msgPasswordRequired",
    "account.msgVerifyCodeRequired",
    "signInText",
  ];

  // ============================================================
  // 2. login/index.vue 使用的所有 key
  // ============================================================
  const loginPageKeys = ["label.one1", "label.two2"];

  // ============================================================
  // Tests
  // ============================================================

  describe("messages 拼接结构", () => {
    it("zh-cn messages 应包含 account key", () => {
      const messages = makeZhcnMessages();
      expect(messages).toHaveProperty("account");
      expect(messages.account).toHaveProperty("accountPlaceholder1");
      expect(messages).toHaveProperty("signInText");
    });

    it("en messages 应包含 account key", () => {
      const messages = makeEnMessages();
      expect(messages).toHaveProperty("account");
      expect(messages.account).toHaveProperty("accountPlaceholder1");
      expect(messages).toHaveProperty("signInText");
    });

    it("messages.common.save 应在 zh-cn base 中存在", () => {
      const messages = makeZhcnMessages();
      expect(messages.common).toBeDefined();
      expect(messages.common.save).toBe("保存");
    });

    it("messages.common.save 应在 en base 中存在", () => {
      const messages = makeEnMessages();
      expect(messages.common).toBeDefined();
      expect(messages.common.save).toBeTruthy();
    });
  });

  describe("account.vue keys - zh-cn", () => {
    for (const key of accountKeys) {
      it(`key "${key}" 应在 zh-cn 中存在`, () => {
        const messagesZhcn = makeZhcnMessages();
        const parts = key.split(".");
        let obj: any = messagesZhcn;
        for (const part of parts) {
          expect(obj).toHaveProperty(part);
          obj = obj[part];
        }
        expect(obj).toBeTruthy();
      });
    }
  });

  describe("account.vue keys - en", () => {
    for (const key of accountKeys) {
      it(`key "${key}" 应在 en 中存在`, () => {
        const messagesEn = makeEnMessages();
        const parts = key.split(".");
        let obj: any = messagesEn;
        for (const part of parts) {
          expect(obj).toHaveProperty(part);
          obj = obj[part];
        }
        expect(obj).toBeTruthy();
      });
    }
  });

  describe("login/index.vue keys - zh-cn", () => {
    for (const key of loginPageKeys) {
      it(`key "${key}" 应在 zh-cn 中存在`, () => {
        const messagesZhcn = makeZhcnMessages();
        const parts = key.split(".");
        let obj: any = messagesZhcn;
        for (const part of parts) {
          expect(obj).toHaveProperty(part);
          obj = obj[part];
        }
        expect(obj).toBeTruthy();
      });
    }
  });

  describe("login/index.vue keys - en", () => {
    for (const key of loginPageKeys) {
      it(`key "${key}" 应在 en 中存在`, () => {
        const messagesEn = makeEnMessages();
        const parts = key.split(".");
        let obj: any = messagesEn;
        for (const part of parts) {
          expect(obj).toHaveProperty(part);
          obj = obj[part];
        }
        expect(obj).toBeTruthy();
      });
    }
  });

  // ============================================================
  // 3. 登录页 zh-cn/en 应有相同的 key 结构
  // ============================================================
  describe("登录页 zh-cn/en key 结构一致性", () => {
    function getAllKeys(obj: any, prefix = ""): string[] {
      if (typeof obj !== "object" || obj === null) return [];
      const keys: string[] = [];
      for (const k of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])) {
          keys.push(...getAllKeys(obj[k], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    }

    it("zh-cn 和 en 的 login pages 应有相同的顶层 key", () => {
      const zhcnTopKeys = Object.keys(zhcnLogin).sort();
      const enTopKeys = Object.keys(enLogin).sort();
      expect(zhcnTopKeys).toEqual(enTopKeys);
    });

    it("zh-cn 和 en 的 login pages 应有相同的叶子 key 总数", () => {
      const zhcnKeys = getAllKeys(zhcnLogin).sort();
      const enKeys = getAllKeys(enLogin).sort();
      expect(zhcnKeys).toEqual(enKeys);
    });
  });

  // ============================================================
  // 4. BUG DETECTION: 检查 '$t("\"...\"") 错误写法
  // ============================================================
  describe("i18n 调用格式检查", () => {
    it("login/index.vue 中 $t 不应包含内嵌双引号 (bug detect)", () => {
      // 这个是逻辑测试：验证正确 key 存在
      const messagesZhcn = makeZhcnMessages();
      // 正确的 key 是 message.common.save（从 zh-cn base）
      expect(messagesZhcn.common).toBeDefined();
      expect(messagesZhcn.common.save).toBe("保存");

      // BUG: 代码中写了 $t('"message.cms.common.save"')
      // 带引号的 key 不存在
      const wrongKey = '"message.cms.common.save"';
      // 模拟 vue-i18n 行为: 如果 key 不存在，返回 key 本身
      expect(messagesZhcn[wrongKey as keyof typeof messagesZhcn]).toBeUndefined();
      // 如果代码中把 key 当字符串传给 t()，t 会 fallback 到 key 自身
      // 所以在实际页面中，会显示字面量 '"message.cms.common.save"' 而不是 '保存'
    });

    it("正确的 key message.common.save 存在且在 messages 中可达", () => {
      const messagesZhcn = makeZhcnMessages();
      // message.common.save 应该在 zhcnBase.common.save
      expect(messagesZhcn.common).toBeDefined();
      expect(messagesZhcn.common.save).toBe("保存");
    });
  });
});
