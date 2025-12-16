# ==================== BUILD STAGE ====================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy all package.json files for dependency installation
COPY packages/config/package.json ./packages/config/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/api ./apps/api

# Build packages and API
RUN pnpm --filter @jarvis/config build && \
    pnpm --filter @jarvis/db build && \
    pnpm --filter @jarvis/core build && \
    pnpm --filter @jarvis/api build

# ==================== PRODUCTION STAGE ====================
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 jarvis

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY --chown=jarvis:nodejs package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY --chown=jarvis:nodejs turbo.json ./

# Copy package.json files
COPY --chown=jarvis:nodejs packages/config/package.json ./packages/config/
COPY --chown=jarvis:nodejs packages/core/package.json ./packages/core/
COPY --chown=jarvis:nodejs packages/db/package.json ./packages/db/
COPY --chown=jarvis:nodejs apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts from builder
COPY --chown=jarvis:nodejs --from=builder /app/packages/config/dist ./packages/config/dist
COPY --chown=jarvis:nodejs --from=builder /app/packages/db/dist ./packages/db/dist
COPY --chown=jarvis:nodejs --from=builder /app/packages/db/drizzle.config.ts ./packages/db/
COPY --chown=jarvis:nodejs --from=builder /app/packages/db/src/schema.ts ./packages/db/src/
COPY --chown=jarvis:nodejs --from=builder /app/packages/core/dist ./packages/core/dist
COPY --chown=jarvis:nodejs --from=builder /app/apps/api/dist ./apps/api/dist

# Switch to non-root user
USER jarvis

# Expose API port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start API server
CMD ["node", "apps/api/dist/index.js"]
