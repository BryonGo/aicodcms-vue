# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS builder

ARG VITE_API_URL=https://api.thdmid.com/
ENV VITE_API_URL=${VITE_API_URL}

WORKDIR /src
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

# 运行时的版本号（compose 传 CONSOLE_BUILD_VERSION=${AICODCMS_CONSOLE_TAG}）；
# entrypoint 脚本在容器启动时把它写进 /admin/version.json，供前端检测新版本。
ENV CONSOLE_BUILD_VERSION=dev
COPY docker/40-console-version.sh /docker-entrypoint.d/40-console-version.sh
RUN chmod +x /docker-entrypoint.d/40-console-version.sh

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist/ /usr/share/nginx/html/admin/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
