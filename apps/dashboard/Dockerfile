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
COPY apps/dashboard/package.json ./apps/dashboard/

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/config ./packages/config
COPY apps/dashboard ./apps/dashboard

# Build args for Next.js env vars (build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build packages and dashboard
RUN pnpm --filter @jarvis/config build && \
    pnpm --filter @jarvis/dashboard build

# ==================== PRODUCTION STAGE ====================
FROM node:20-alpine AS runner

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.14.0 --activate

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 jarvis

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy workspace configuration
COPY --chown=jarvis:nodejs package.json pnpm-workspace.yaml ./

# Copy built dashboard
COPY --chown=jarvis:nodejs --from=builder /app/apps/dashboard/.next/standalone ./
COPY --chown=jarvis:nodejs --from=builder /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --chown=jarvis:nodejs --from=builder /app/apps/dashboard/public ./apps/dashboard/public

# Switch to non-root user
USER jarvis

# Expose dashboard port
EXPOSE 3001

# Environment variables
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js server
CMD ["node", "apps/dashboard/server.js"]
