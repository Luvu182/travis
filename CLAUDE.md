# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

J.A.R.V.I.S is a Vietnamese Executive Assistant chatbot with long-term memory using mem0, supporting Telegram and Lark Suite group chats.

**Tech Stack:** Hono (TypeScript), PostgreSQL + pgvector, Drizzle ORM, mem0, Gemini Flash (primary) + OpenAI (fallback), grammY (Telegram), Turborepo + pnpm workspaces, Next.js 16 (dashboard)

## Commands

```bash
# Development
pnpm install           # Install all dependencies
pnpm dev               # Start all services (turbo)
pnpm build             # Build all packages
pnpm typecheck         # Type check all packages
pnpm lint              # Lint all packages

# Database
pnpm db:generate       # Generate Drizzle migrations
pnpm db:migrate        # Run migrations
pnpm db:push           # Push schema to DB (dev)
pnpm db:studio         # Open Drizzle Studio

# Docker
docker compose up -d   # Start all services (postgres, api, memory, dashboard)

# Single package commands
pnpm --filter @jarvis/api dev       # Run API only
pnpm --filter @jarvis/dashboard dev # Run dashboard only
pnpm --filter @jarvis/core test     # Run core tests
```

## Architecture

```
jarvis/
├── apps/
│   ├── api/              # Hono API server (port 3000)
│   │   ├── routes/       # API endpoints (health, chat, extract, search, query, metrics, auth, dashboard-metrics)
│   │   ├── webhooks/     # Telegram & Lark webhook handlers
│   │   ├── middleware/   # Rate limiting, error handling, dashboard auth
│   │   └── services/     # Query handler, message processor
│   ├── dashboard/        # Next.js 16 admin dashboard (port 3001)
│   │   └── app/          # App Router with NextAuth v5
│   └── memory-service/   # Python FastAPI mem0 service (port 8000)
├── packages/
│   ├── config/           # Zod-validated env config (@jarvis/config)
│   ├── db/               # Drizzle ORM schema & client (@jarvis/db)
│   │   ├── schema.ts     # All table definitions
│   │   ├── client.ts     # Database connection
│   │   └── operations.ts # CRUD operations
│   └── core/             # AI & memory logic (@jarvis/core)
│       ├── llm/          # Gemini/OpenAI providers with fallback
│       └── memory/       # mem0 client, retriever, storage
└── docker/               # PostgreSQL + pgvector setup
```

**Data Flow:** Webhook → API → Message Processor → LLM (with memory context from mem0) → Response

**Key Tables:** `groups`, `users`, `messages`, `query_logs`, `adminUsers` (auth), `webConversations`, `webMessages`, `metricsHistory`

## Workflows

Read these before implementation:
- Development rules: `.claude/workflows/development-rules.md`
- Primary workflow: `.claude/workflows/primary-workflow.md`
- Documentation management: `.claude/workflows/documentation-management.md`
- Other workflows: `.claude/workflows/*`

## Documentation

All docs in `./docs/`:
- `project-overview-pdr.md` - Product requirements
- `code-standards.md` - Code conventions
- `system-architecture.md` - Architecture details
- `memory-architecture.md` - Memory use case & architecture
- `deployment-guide.md` - Deployment instructions

## Memory Architecture (QUAN TRỌNG)

### Shared Memory trong Group Chat
- Bot add vào group → members trao đổi → bot trích xuất → lưu memory
- **ADD memory**: Lưu `user_id` vào metadata để track AI nói gì
- **SEARCH memory**: Get ALL trong group, **KHÔNG filter by user_id**
- **Lý do**: Shared context - thông tin 1 người nói, cả nhóm cần access

### Workspace Layer (TODO)
- Mỗi workspace chứa nhiều groups (Telegram, Lark)
- Bot search across ALL groups trong workspace
- Hiện tại chưa implement

Chi tiết: `docs/memory-architecture.md`

## Important Rules

- Follow YAGNI, KISS, DRY principles
- Keep files under 200 lines
- Use kebab-case file naming
- Run `code-reviewer` agent after implementations
- Date format from `$CK_PLAN_DATE_FORMAT` env var for plan naming
- Reports go in `plans/reports/`, plans in `plans/`