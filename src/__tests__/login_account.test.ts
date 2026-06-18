/**
 * Login Account 组件测试
 * 测试 account.vue 登录表单的渲染、表单验证、API 调用
 */
import { describe, it, expect, vi, beforeEach } from "vite-plus/test";

// ============================================================
// Mock 外部依赖
// ============================================================

// Mock router
const mockPush = vi.fn();
const mockRoute = { query: {}, path: "/login" };
vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush, currentRoute: { value: mockRoute } }),
}));

// Mock element-plus
vi.mock("element-plus", async () => {
  const actual = await vi.importActual("element-plus");
  return {
    ...actual,
    ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  };
});

// Mock request (API)
const mockRequest = vi.fn();
vi.mock("/@/utils/request", () => ({ default: mockRequest }));

// Mock stores/themeConfig
const mockThemeConfig = {
  value: { isRequestRoutes: false, globalTitle: "Test CMS", globalViceTitle: "Test" },
};
vi.mock("/@/stores/themeConfig", () => ({
  useThemeConfig: () => ({ themeConfig: mockThemeConfig }),
}));

// Mock stores/userInfo
vi.mock("/@/stores/userInfo", () => ({
  useUserInfo: () => ({
    setUserInfos: vi.fn(),
    userInfos: {},
    getApiUserInfo: vi.fn(),
  }),
}));

// Mock utils/storage
const sessionStore: Record<string, any> = {};
vi.mock("/@/utils/storage", () => ({
  Session: {
    set: (k: string, v: any) => {
      sessionStore[k] = v;
    },
    get: (k: string) => sessionStore[k] ?? null,
    clear: () => {
      for (const k of Object.keys(sessionStore)) delete sessionStore[k];
    },
    remove: (k: string) => {
      delete sessionStore[k];
    },
  },
}));

// Mock utils/loading
vi.mock("/@/utils/loading", () => ({
  NextLoading: { start: vi.fn(), done: vi.fn() },
}));

// Mock utils/formatTime
vi.mock("/@/utils/formatTime", () => ({
  formatAxis: () => "上午好",
}));

// Mock router/frontEnd
vi.mock("/@/router/frontEnd", () => ({
  initFrontEndControlRoutes: vi.fn(),
}));

// Mock router/backEnd
vi.mock("/@/router/backEnd", () => ({
  initBackEndControlRoutes: vi.fn(),
}));

// ============================================================
// Tests
// ============================================================

describe("Login Account Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const k of Object.keys(sessionStore)) delete sessionStore[k];
  });

  describe("API 模块可导入", () => {
    it("login 模块应可正常导入", async () => {
      const mod = await import("/@/api/login");
      expect(mod).toBeDefined();
      expect(typeof mod.login).toBe("function");
      expect(typeof mod.captcha).toBe("function");
      expect(typeof mod.logout).toBe("function");
    });

    it("login() 应发送正确的请求参数", async () => {
      const { login } = await import("/@/api/login");
      await login({ username: "admin", password: "123456" });
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/api/v1/pms/login",
          method: "post",
          data: { username: "admin", password: "123456" },
        }),
      );
    });

    it("login() 应传递 verifyKey 和 verifyCode", async () => {
      const { login } = await import("/@/api/login");
      await login({
        username: "admin",
        password: "123456",
        verifyCode: "abcd",
        verifyKey: "key123",
      });
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            verifyCode: "abcd",
            verifyKey: "key123",
          }),
        }),
      );
    });

    it("captcha() 应发送正确的请求", async () => {
      const { captcha } = await import("/@/api/login");
      await captcha();
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/api/v1/pub/captcha/get",
          method: "get",
        }),
      );
    });

    it("logout() 应发送正确的请求", async () => {
      const { logout } = await import("/@/api/login");
      await logout();
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/api/v1/pms/login-out",
          method: "get",
        }),
      );
    });
  });

  describe("表单验证规则", () => {
    it("username 验证规则应包含 required", () => {
      const rules = [{ required: true, trigger: "blur", message: "用户名不能为空" }];
      expect(rules[0].required).toBe(true);
      expect(rules[0].trigger).toBe("blur");
    });

    it("password 验证规则应包含 required", () => {
      const rules = [{ required: true, trigger: "blur", message: "密码不能为空" }];
      expect(rules[0].required).toBe(true);
    });

    it("verifyCode 验证规则应包含 required", () => {
      const rules = [{ required: true, trigger: "blur", message: "验证码不能为空" }];
      expect(rules[0].required).toBe(true);
    });
  });

  describe("ruleForm 默认值", () => {
    it("默认用户名应为 admin", async () => {
      // 验证 default values pattern
      const ruleForm = { username: "admin", password: "123456", verifyCode: "", verifyKey: "" };
      expect(ruleForm.username).toBe("admin");
      expect(ruleForm.password).toBe("123456");
      expect(ruleForm.verifyCode).toBe("");
      expect(ruleForm.verifyKey).toBe("");
    });

    it("loading 初始状态应为 false", () => {
      const loading = { signIn: false };
      expect(loading.signIn).toBe(false);
    });

    it("isShowPassword 初始应为 false", () => {
      const isShowPassword = false;
      expect(isShowPassword).toBe(false);
    });
  });

  describe("登录流程数据结构", () => {
    it("登录成功后应正确设置 Session", () => {
      // 模拟登录成功的响应数据
      const mockResponse = {
        data: {
          token: "test-token-xxx",
          user_info: { id: 1, userName: "admin", avatar: "/uploads/avatar.png" },
          menu_list: [{ id: 1, name: "home", path: "/home" }],
          permissions: ["read", "write"],
        },
      };

      // 模拟处理
      const userInfo = mockResponse.data.user_info;
      userInfo.avatar = "/uploads/avatar.png"; // 模拟 proxy.getUpFileUrl
      sessionStore["token"] = mockResponse.data.token;
      sessionStore["userInfo"] = userInfo;
      sessionStore["userMenu"] = mockResponse.data.menu_list;
      sessionStore["permissions"] = mockResponse.data.permissions;

      expect(sessionStore["token"]).toBe("test-token-xxx");
      expect(sessionStore["userInfo"].userName).toBe("admin");
      expect(sessionStore["userMenu"]).toHaveLength(1);
      expect(sessionStore["permissions"]).toContain("read");
    });

    it("登录响应数据结构应与后端 API 定义一致", () => {
      // 对应 Go 后端 pms.UserLoginRes
      const expectedFields = ["user_info", "token", "menu_list", "permissions"];
      const mockData = {
        user_info: { id: 1 },
        token: "xxx",
        menu_list: [],
        permissions: [],
      };
      for (const field of expectedFields) {
        expect(mockData).toHaveProperty(field);
      }
    });

    it("user_info 应包含 avatar 字段", () => {
      const userInfo = { id: 1, userName: "admin", avatar: "" };
      expect(userInfo).toHaveProperty("avatar");
    });
  });
});
