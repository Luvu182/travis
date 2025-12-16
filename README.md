# J.A.R.V.I.S - Vietnamese Executive Assistant with Long-Term Memory

AI-powered executive assistant chatbot with long-term memory using mem0, designed for Telegram and Lark Suite group chats. Features intelligent information extraction, real-time dashboard, and multi-platform support with hybrid LLM architecture.

## Features

- **Long-term memory** - mem0 with PostgreSQL pgvector for semantic search
- **Multi-platform** - Telegram and Lark Suite support with feature parity
- **Intelligent extraction** - Tasks, decisions, deadlines from conversations
- **Vietnamese optimized** - Date normalization and language-specific prompts
- **Hybrid LLM** - Gemini 2.5-flash-lite primary, GPT-4o-mini fallback
- **Admin dashboard** - Next.js 15 with real-time metrics and chat interface
- **Production-grade** - Rate limiting, authentication, error handling

## Tech Stack

### Backend
- **API**: Hono (TypeScript, lightweight web framework)
- **Database**: PostgreSQL 15+ with pgvector extension
- **ORM**: Drizzle ORM (type-safe queries)
- **Memory**: mem0 with Python FastAPI service
- **LLM**: Google Gemini 2.5-flash-lite, OpenAI GPT-4o-mini
- **Embeddings**: Gemini embedding-001 (1536D vectors)

### Frontend
- **Dashboard**: Next.js 15 + React 19
- **UI**: Tailwind CSS + Shadcn/ui + RemixIcon
- **State**: Zustand
- **Auth**: NextAuth v5 with JWT
- **Charts**: Chart.js

### Infrastructure
- **Monorepo**: Turborepo + pnpm workspaces
- **Container**: Docker + docker-compose
- **Webhooks**: Telegram (grammY), Lark Suite (@larksuiteoapi/node-sdk)

## Project Structure

```
jarvis/
├── apps/
│   ├── api/              # Hono REST API (8 routes + 2 webhooks)
│   ├── dashboard/        # Next.js 15 admin UI (7 pages)
│   └── memory-service/   # Python FastAPI mem0 wrapper
├── packages/
│   ├── config/           # Zod-validated environment
│   ├── db/               # Drizzle ORM + operations
│   └── core/             # LLM + memory layers
├── docker/               # PostgreSQL + pgvector setup
└── docs/                 # Project documentation
```

## Quick Start (5 steps)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with:
# - TELEGRAM_BOT_TOKEN (from @BotFather)
# - LARK_APP_ID, LARK_APP_SECRET (Lark Suite app)
# - GEMINI_API_KEY (Google AI API)
# - OPENAI_API_KEY (OpenAI API)
# - DATABASE_URL (PostgreSQL connection)
# - WEBHOOK_DOMAIN (your public domain)
```

### 3. Start PostgreSQL
```bash
docker compose -f docker/docker-compose.dev.yml up -d
# Verify: psql $DATABASE_URL -c "SELECT 1"
```

### 4. Setup database
```bash
pnpm db:push
```

### 5. Start all services
```bash
pnpm dev
# API runs on http://localhost:3000
# Dashboard runs on http://localhost:3001
# Memory service runs on http://localhost:8000
```

## Development Commands

```bash
# Install & build
pnpm install
pnpm build
pnpm typecheck
pnpm lint

# Development
pnpm dev                          # Start all services
pnpm --filter @jarvis/api dev     # API only
pnpm --filter @jarvis/dashboard dev # Dashboard only

# Database
pnpm db:push                       # Push schema to DB
pnpm db:generate                   # Generate migrations
pnpm db:migrate                    # Run migrations
pnpm db:studio                     # Open Drizzle Studio

# Docker
docker compose -f docker/docker-compose.dev.yml up -d    # Start services
docker compose -f docker/docker-compose.dev.yml down     # Stop services
```

## API Endpoints

### Public
- `GET /health` - Health check (API + database status)

### Webhooks
- `POST /webhook/telegram` - Telegram message handler
- `POST /webhook/lark` - Lark Suite message handler

### API (Rate limited: 100 req/15min)
- `POST /api/chat` - Chat with context
- `POST /api/extract` - Extract structured data
- `POST /api/search` - Semantic search
- `POST /api/query` - Query with LLM

### Dashboard API (JWT authenticated)
- `GET /api/dashboard/metrics` - System statistics
- `POST /api/auth/login` - JWT login
- `POST /api/auth/logout` - Session logout

## Dashboard Pages

- **Login** - JWT authentication via NextAuth v5
- **Chat** - Real-time chat with SSE updates
- **Conversations** - Message history
- **Memory** - Memory inspection and management
- **Performance** - System metrics and charts
- **Settings** - Configuration management

## Environment Variables

Required in `.env`:

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/jarvis

# LLMs
GEMINI_API_KEY=your-google-key
OPENAI_API_KEY=your-openai-key

# Platforms
TELEGRAM_BOT_TOKEN=your-telegram-token
LARK_APP_ID=your-lark-id
LARK_APP_SECRET=your-lark-secret

# Deployment
NODE_ENV=development|production
WEBHOOK_DOMAIN=https://your-domain.com
PORT=3000
MEMORY_SERVICE_URL=http://localhost:8000

# Dashboard
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

## Architecture Overview

```
Telegram/Lark → Webhook → API → Core (LLM + Memory) → Database
                            ↓
                        Dashboard (Next.js)
                            ↑
                        Admin UI (SSE updates)
```

### Data Flow
1. Platform webhook sends message
2. API validates and stores message
3. Memory service extracts information via mem0
4. LLM layer generates response
5. Dashboard displays in real-time

## File Organization

- **API**: 8 routes + 2 webhooks + 3 middleware + 2 services
- **Dashboard**: 7 pages + auth + components + stores
- **Memory**: Python FastAPI with mem0ai SDK + TypeScript HTTP client
- **Database**: Drizzle ORM with 4 tables + vector search
- **Config**: Zod-validated environment management

## Key Features Explained

### Memory Layer
- mem0 Python service manages long-term memory
- Automatic Vietnamese date normalization
- 1536D Gemini embeddings for semantic search
- Deduplication via mem0

### LLM Integration
- **Primary**: Gemini 2.5-flash-lite (cost-effective, fast)
- **Fallback**: GPT-4o-mini (automatic on error)
- **Tasks**: chat, extraction, summarization, query, translation
- **Vietnamese prompts**: Optimized for local context

### Dashboard
- Real-time metrics via Server-Sent Events (SSE)
- JWT authentication
- Dark/light mode support
- Responsive design

## Performance Metrics

- API response: < 3 seconds (99th percentile)
- Vector search: < 100ms for 10K+ records
- Dashboard metrics: < 500ms
- Database connections: 20 max (production)
- Rate limit: 100 req/15min per user+group

## Documentation

- `docs/project-overview-pdr.md` - Requirements & phases
- `docs/code-standards.md` - Coding conventions
- `docs/system-architecture.md` - System design
- `docs/codebase-summary.md` - Technical overview
- `docs/api-docs.md` - API specification
- `repomix-output.xml` - Complete codebase snapshot (103k tokens)

## Getting Help

- Check `.env.example` for required configuration
- Review `docs/` for detailed documentation
- See `CLAUDE.md` for development rules and workflows
- Use `pnpm db:studio` to inspect database

## License

Private project - All rights reserved
