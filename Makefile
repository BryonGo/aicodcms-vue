# ── 开发常用 ──

.PHONY: help
help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "── 开发 ──"
	@echo "  dev         启动开发服务器（vp dev）"
	@echo "  build       构建生产包（vp build）"
	@echo "  preview     预览构建结果（vp preview）"
	@echo ""
	@echo "── 代码检查 ──"
	@echo "  check       TypeScript 类型检查（vp check）"
	@echo "  fmt         格式化代码（vp fmt）"
	@echo ""
	@echo "── 测试 ──"
	@echo "  test        运行单元测试"
	@echo "  test:i18n   检查 i18n key 完整性"
	@echo "  test:usei18n 检查 useI18n 导入"
	@echo "  test:e2e    运行 E2E 测试"
	@echo ""
	@echo "── 依赖 ──"
	@echo "  install     安装依赖"
	@echo "  clean       清理 node_modules 和 dist"

# ── 开发 ──

.PHONY: dev
dev:
	npm run dev

.PHONY: build
build:
	npm run build

.PHONY: preview
preview:
	npm run preview

# ── 代码检查 ──

.PHONY: check
check:
	npm run check

.PHONY: fmt
fmt:
	npm run fmt

# ── 测试 ──

.PHONY: test
test:
	npm run test

.PHONY: test:i18n
test:i18n:
	npm run test:i18n

.PHONY: test:usei18n
test:usei18n:
	npm run test:usei18n

.PHONY: test:e2e
test:e2e:
	npm run test:e2e

.PHONY: test:e2e:ui
test:e2e:ui:
	npm run test:e2e:ui

.PHONY: test:e2e:report
test:e2e:report:
	npm run test:e2e:report

# ── 依赖 ──

.PHONY: install
install:
	npm install

.PHONY: clean
clean:
	npx --yes rimraf node_modules dist
