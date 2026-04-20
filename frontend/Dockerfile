# ============================================================
# Mundial2026Over9000 — Frontend Dockerfile
# Multi-stage: build React app, serve with Nginx
# ============================================================

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /build

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /build/dist /usr/share/nginx/html

# Create non-root user and adjust permissions
RUN addgroup -S mundial && adduser -S mundial -G mundial && \
    chown -R mundial:mundial /usr/share/nginx/html && \
    chown -R mundial:mundial /var/cache/nginx && \
    chown -R mundial:mundial /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R mundial:mundial /var/run/nginx.pid

# Install curl for healthcheck
RUN apk add --no-cache curl

USER mundial

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
