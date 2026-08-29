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
	@echo ""
	@echo "── Docker ──"
	@echo "  docker-image  构建 Console 生产镜像"
	@echo "  docker-verify 检查镜像内容与 Nginx 配置"
	@echo "  docker-push   推送版本标签及 latest"

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

# ── Docker ──

DOCKER_IMAGE    ?= bryongo/aicodcms-console
DOCKER_TAG      ?= $(shell git log -1 --format="%cd-%h" --date=format:"%Y%m%d%H%M%S" 2>/dev/null || echo "dev")
DOCKER_PLATFORM ?= linux/amd64
VITE_API_URL    ?= https://api.thdmid.com/

.PHONY: docker-image
docker-image:
	@echo "=== 构建 Console: $(DOCKER_IMAGE):$(DOCKER_TAG) ($(DOCKER_PLATFORM)) ==="
	@docker buildx build --load --platform $(DOCKER_PLATFORM) \
		--build-arg VITE_API_URL=$(VITE_API_URL) \
		--label org.opencontainers.image.revision=$$(git rev-parse HEAD) \
		-t $(DOCKER_IMAGE):$(DOCKER_TAG) .

.PHONY: docker-verify
docker-verify:
	@docker image inspect $(DOCKER_IMAGE):$(DOCKER_TAG) --format '{{.Os}}/{{.Architecture}}' | grep -Fx 'linux/amd64'
	@docker run --rm --entrypoint /bin/sh $(DOCKER_IMAGE):$(DOCKER_TAG) -ec \
		'test -f /usr/share/nginx/html/admin/index.html; nginx -t'
	@echo "✓ Console 镜像检查通过"

.PHONY: docker-push
docker-push: docker-verify
	@docker tag $(DOCKER_IMAGE):$(DOCKER_TAG) $(DOCKER_IMAGE):latest
	@docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
	@docker push $(DOCKER_IMAGE):latest
	@echo "✓ Console 已推送: $(DOCKER_TAG) / latest"
