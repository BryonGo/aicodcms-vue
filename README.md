# aicodcms-vue

aicodcms 后台管理系统前端，基于 **Vue 3** + **TypeScript** + **Element Plus** + **Vite** 构建。

对应后端：[github.com/BryonGo/aicodcms](https://github.com/BryonGo/aicodcms)

## 功能模块

### 权限管理系统 (PMS)
- 用户管理 / 角色管理 / 菜单管理（支持拖拽排序）
- 部门管理 / 岗位管理 / 字典管理
- 系统参数 / 操作日志 / 登录日志
- 在线用户 / 缓存管理 / 服务器监控
- Casbin RBAC 权限控制

### 内容管理系统 (CMS)
- 文章管理（含回收站、多语言翻译支持）
- 栏目树形管理 / 区块管理 / 标签管理
- 单页管理 / 模型管理（自定义字段）
- 模板编辑 / 设置管理
- TipTap 富文本编辑器（支持图片/附件拖拽上传）

### 插件模块 (Addon)
- MinIO 对象存储管理 / 定时任务
- 备份恢复 / 邮件管理 / MQ 消息队列
- 表单构建器 / SDK 订单 / Webhook
- 评论管理 / 影视管理 / 支付管理
- 文档管理 / Sitemap 站点地图

### 系统特性
- 暗色/亮色主题切换 / 水印 / 锁屏
- 多布局切换（默认/经典/横向/分栏）
- 中英文国际化 (zh-CN / en)
- 后端动态路由与权限控制
- 大文件分片上传 / 图片裁剪

## 禁用 pro 插件

某些高级插件（如 Game SDK、支付通道等）放在后端 `pro/` 目录，不是所有人都需要。前端对应菜单通过后端动态路由下发，**不需要的前端菜单在后台 PMS 中隐藏即可**：

### 方法：后台菜单管理

1. 登录后台 → **权限管理 → 菜单管理**
2. 找到不需要的插件菜单（如"游戏管理"、"支付配置"等）
3. 点击 **编辑** → 将"是否隐藏"设为 **是**
4. 保存后刷新，前端菜单自动消失

> 闭插件菜单不会删除代码，随时可以重新显示。
> 如需彻底移除后端插件代码，参考 [pro/README.md](https://github.com/BryonGo/aicodcms/blob/main/pro/README.md)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建 | Vite |
| UI 组件 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP | Axios |
| 编辑器 | TipTap / CodeMirror |
| 图表 | ECharts |
| 样式 | TailwindCSS + SCSS |
| 国际化 | vue-i18n v10 |
| 测试 | Vitest + Playwright |

## 项目结构

```
aicodcms-vue/
├── public/                 # 静态资源
├── scripts/                # 脚本工具
├── src/
│   ├── api/                # API 接口封装
│   │   ├── addon/          #   插件模块 API
│   │   ├── cms/            #   内容管理 API
│   │   └── pms/            #   权限管理 API
│   ├── assets/             # 图片等资源
│   ├── components/         # 公共组件
│   │   ├── editor/         #   TipTap 编辑器
│   │   ├── tiptap/         #   TipTap 扩展节点
│   │   ├── DynamicSettingForm/  # 动态设置表单
│   │   ├── modulesData/    #   模型数据组件
│   │   └── ...
│   ├── composables/        # 组合式函数
│   ├── i18n/               # 国际化
│   │   ├── lang/           #   语言包
│   │   └── pages/          #   页面级翻译
│   ├── layout/             # 布局组件
│   ├── router/             # 路由配置（前后端双模式）
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   │   ├── addon/          #   插件模块页面
│   │   ├── cms/            #   内容管理页面
│   │   ├── fun/            #   功能页面
│   │   ├── home/           #   首页
│   │   ├── login/          #   登录
│   │   └── pms/            #   权限管理页面
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── e2e/                    # E2E 测试
├── .env                    # 环境变量（默认值）
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── vite.config.ts          # Vite 配置
├── vitest.config.ts        # 测试配置
├── tsconfig.json           # TypeScript 配置
├── playwright.config.ts    # Playwright 配置
└── package.json
```

## 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器 (默认端口 8888)
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 运行测试

```bash
# 单元测试
npm test

# E2E 测试
npm run test:e2e

# E2E 测试（UI 模式）
npm run test:e2e:ui
```

### 环境变量配置

开发环境下创建 `.env.development.local` 覆盖默认配置：

```env
# 后端 API 地址
VITE_API_URL = 'http://127.0.0.1:8201/'

# 开发端口
VITE_PORT = 8888

# 是否自动打开浏览器
VITE_OPEN = true

# 开启调试日志
VITE_APP_DEBUG = true
```

生产环境配置 `.env.production.local`：

```env
ENV = 'production'
VITE_API_URL = 'https://your-api-domain.com/'
VITE_PUBLIC_PATH = '/'
```

## 后端对接

本项目为 **后端控制路由** 模式（`themeConfig.isRequestRoutes = true`），路由菜单由后端 `getRouters` 接口动态下发。

API 请求统一通过 `/api/v1/` 前缀代理到后端。需要确保后端服务正常运行。

## 开发指南

### 新增页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/api/` 下创建对应 API 封装
3. 后端菜单管理中添加菜单项并分配权限
4. 刷新页面即可看到新菜单

### 国际化

- 公共翻译 key 放在 `src/i18n/lang/zh-cn.ts` 和 `src/i18n/lang/en.ts`
- 页面级翻译放在 `src/i18n/pages/{module}/zh-cn.ts` 和 `en.ts`
- 组件中使用 `$t('key')` 或 `useI18n().t('key')`

### 路径别名

- `@/` → `src/`

## License

MIT
