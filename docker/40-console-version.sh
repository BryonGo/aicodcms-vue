#!/bin/sh
# 把当前镜像 tag 写成 /admin/version.json —— 控制台前端靠它检测"线上是不是发了新版本"。
#
# 为什么走运行时而不是构建期：镜像 tag 每次发布都变（形如 20260914151045-57daded），
# 由 compose 通过 CONSOLE_BUILD_VERSION 传进来（= AICODCMS_CONSOLE_TAG），
# 这样不需要在构建命令里额外传参，也不会出现"忘了传构建参数 → 版本永远 dev"的漂移。
#
# 必须容错：本脚本在 nginx 官方镜像的 entrypoint 阶段执行，非零退出会让容器起不来。
set -u
VERSION="${CONSOLE_BUILD_VERSION:-dev}"
TARGET_DIR="/usr/share/nginx/html/admin"
TARGET="$TARGET_DIR/version.json"
STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo '')"

[ -d "$TARGET_DIR" ] || mkdir -p "$TARGET_DIR" 2>/dev/null || true
printf '{"version":"%s","startedAt":"%s"}\n' "$VERSION" "$STARTED_AT" > "$TARGET" 2>/dev/null \
  || echo "[console-version] 写入 $TARGET 失败，前端将回落到构建期内置版本" >&2
echo "[console-version] version=$VERSION"
exit 0
