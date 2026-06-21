# E2E 测试说明

使用 [Playwright](https://playwright.dev/) 对管理后台进行端对端测试。

## 测试文件

| 文件                 | 内容                                           |
| -------------------- | ---------------------------------------------- |
| `login.spec.ts`      | 登录页面：重定向、表单验证、错误凭据、登录成功 |
| `navigation.spec.ts` | 导航布局：侧边菜单、顶部导航、用户菜单         |
| `i18n.spec.ts`       | 国际化：默认语言、html lang 属性               |
| `pms.spec.ts`        | 权限管理：用户/角色/菜单页面访问、表格渲染     |

## 运行方式

### 前提条件

1. 启动前端 dev server（默认 8888 端口）：

   ```bash
   npm run dev
   ```

2. 部分测试（标记 `E2E_FULL=1` 的）还需要后端在线（默认 8201 端口）。

### 只跑不需要后端的测试

```bash
npm run test:e2e
```

这会运行登录页结构检查、i18n 检查等不依赖真实后端的测试，以及所有标记了 `test.skip(!process.env.E2E_FULL, ...)` 的测试（会自动跳过）。

### 运行全部测试（含需要后端的）

```bash
E2E_FULL=1 E2E_USER=admin E2E_PASS=admin123 npm run test:e2e
```

### 可视化调试模式

```bash
npm run test:e2e:ui
```

### 查看测试报告

```bash
npx playwright show-report
```

## 环境变量

| 变量           | 默认值                  | 说明                        |
| -------------- | ----------------------- | --------------------------- |
| `E2E_BASE_URL` | `http://localhost:8888` | 前端地址                    |
| `E2E_FULL`     | 未设置                  | 设为 `1` 开启需要后端的测试 |
| `E2E_USER`     | `admin`                 | 登录用户名                  |
| `E2E_PASS`     | `admin123`              | 登录密码                    |
