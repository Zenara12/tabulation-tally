# ============================================================
# Tabulation System — Multi-stage Production Dockerfile
# Node 22 LTS Alpine · Nuxt 4 / Nitro node-server preset
# ============================================================

# ---- Stage 1: Builder ----------------------------------------
FROM node:22-alpine AS builder

# Required for Prisma client generation (native tooling)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy manifests first so Docker layer cache is reused when only
# source files change (not dependencies).
COPY package.json package-lock.json ./
COPY prisma.config.ts ./
COPY prisma/ ./prisma/

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --no-audit --no-fund

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Build Nuxt — emits a standalone .output/ directory
RUN npm run build


# ---- Stage 2: Runner -----------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache curl

WORKDIR /app

# Copy only what the server needs at runtime
COPY --from=builder /app/.output        ./.output
COPY --from=builder /app/prisma         ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules   ./node_modules
COPY --from=builder /app/package.json   ./package.json

# Copy the entrypoint script
COPY docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Run as a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Healthcheck — probes the /api/health endpoint which also pings the DB
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./entrypoint.sh"]
