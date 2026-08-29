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

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /src/dist/ /usr/share/nginx/html/admin/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
