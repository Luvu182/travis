# J.A.R.V.I.S - Codebase Summary

**Last Updated:** 2025-12-16
**Phase:** 03 - Memory Layer REFACTORED (mem0 OSS) + Phase 04 Complete
**Status:** mem0 self-hosted integration complete with 70% code reduction, LLM layer complete with Gemini 2.5-flash-lite primary + GPT-4o fallback

## Project Overview

J.A.R.V.I.S is a Vietnamese executive assistant chatbot with long-term memory capabilities, designed for multi-platform deployment (Telegram and Lark Suite). The system leverages AI-powered information extraction and semantic search through PostgreSQL vector embeddings.

## Architecture

```
J.A.R.V.I.S (Monorepo)
├── apps/
│   ├── api/              # Hono API server (TypeScript)
│   └── dashboard/        # Next.js admin UI (Phase 01 - Complete)
├── packages/
│   ├── config/           # Environment validation & config mgmt
│   ├── db/               # Database layer (Drizzle ORM + pgvector)
│   └── core/             # AI & memory logic
│       ├── memory/       # Embeddings, extraction, storage, retrieval
│       └── llm/          # LLM service with task routing & fallback
└── docker/               # PostgreSQL + pgvector setup
```

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Package Manager** | pnpm | Latest |
| **Monorepo** | Turborepo | Latest |
| **API Framework** | Hono | TypeScript |
| **Database** | PostgreSQL | 15+ |
| **Vector Extension** | pgvector | 0.5+ |
| **ORM** | Drizzle ORM | Latest |
| **Embeddings** | Gemini embedding-001 | 1536D vectors |
| **LLM Primary** | Google Gemini 2.5-flash-lite | Latest |
| **LLM Fallback** | OpenAI GPT-4o-mini | Latest |
| **Memory Framework** | mem0ai (self-hosted) + Vercel AI SDK | Latest |
| **Telegram SDK** | grammY | Latest |
| **Lark SDK** | @larksuiteoapi/node-sdk | Latest |
| **Language** | TypeScript | 5.0+ |
| **Dashboard UI** | Next.js 15 + React 19 | Latest |
| **Component Library** | Shadcn/ui | Latest |
| **Icon Library** | RemixIcon React | Latest |
| **Theme Management** | next-themes | Latest |
| **State Management** | Zustand | 5.0+ |
| **Styling** | Tailwind CSS 3.4 | Latest |
| **Chart Library** | Chart.js + react-chartjs-2 | Latest |
| **Auth** | Jose (JWT) | 5.2+ |

## Dashboard App (Phase 01 - Complete)

### Overview
Next.js-based admin UI for J.A.R.V.I.S system. Provides group management, message monitoring, memory inspection, and analytics visualization with dark/light theme support.

### Configuration Files
- **next.config.ts** - Standalone output, strict mode, transpilePackages: ['@jarvis/config']
- **tailwind.config.ts** - HSL-based CSS variables, dark mode class strategy, chart colors
- **postcss.config.mjs** - Tailwind CSS processor
- **tsconfig.json** - ES2020 target, bundler resolution, path alias: @/* → ./src/*
- **components.json** - Shadcn/ui configuration

### Project Structure
```
apps/dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with theme provider
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # CSS variables (colors, radius)
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard main view
│   │       └── layout.tsx      # Dashboard layout (sidebar/nav)
│   ├── components/
│   │   └── theme-provider.tsx  # Theme context provider
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc)
│   └── stores/                 # Zustand stores
├── package.json                # Dependencies & scripts
├── tailwind.config.ts          # Tailwind configuration
├── postcss.config.mjs          # PostCSS pipeline
├── next.config.ts              # Next.js configuration
└── tsconfig.json               # TypeScript configuration
```

### Key Features
- **Theme Support:** Dark/light mode with next-themes
- **Responsive Layout:** Tailwind CSS responsive utilities
- **Analytics Dashboards:** Chart.js integration via react-chartjs-2
- **State Management:** Zustand for client-side state
- **JWT Authentication:** Jose library for token handling
- **UI Components:** Shadcn/ui library (Tailwind-based)

### Scripts
- `dev` - Start dev server on port 3001
- `build` - Production build
- `start` - Start production server
- `lint` - ESLint validation

### Dev Server
```bash
pnpm --filter @jarvis/dashboard dev  # Runs on http://localhost:3001
```

## Database Schema (Phase 02)

### Overview (Phase 03 Refactored)
4 core tables (extractedInfo + memories REMOVED, managed by mem0):

### Enums

#### `platform_type`
Values: `'telegram'` | `'lark'`
Used by: `groups`, `users`

#### `info_type` (REMOVED - Phase 03 refactor)
**Deprecated:** extractedInfo table removed, mem0 manages memory types internally

### Core Tables

#### 1. `groups` - Multi-platform Chat Groups
Represents Telegram groups or Lark suites integrated with J.A.R.V.I.S.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique group identifier |
| `platform` | platform_type | NOT NULL | Telegram or Lark |
| `platformGroupId` | varchar(255) | NOT NULL | External platform ID |
| `name` | varchar(255) | Optional | Display name |
| `createdAt` | timestamp | Default: NOW() | Record creation time |
| `updatedAt` | timestamp | Default: NOW() | Last modification time |
| `metadata` | jsonb | Default: {} | Platform-specific data |

**Unique Index:** `idx_groups_platform_group` on `(platform, platformGroupId)`
**Relationships:** Parent of `users` (many), `messages` (many), `extractedInfo` (many), `memories` (many)

#### 2. `users` - Platform Users
Individual users across Telegram or Lark platforms.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique user identifier |
| `platform` | platform_type | NOT NULL | Telegram or Lark |
| `platformUserId` | varchar(255) | NOT NULL | External user ID |
| `username` | varchar(255) | Optional | Username/handle |
| `displayName` | varchar(255) | Optional | Display name |
| `createdAt` | timestamp | Default: NOW() | Record creation time |
| `updatedAt` | timestamp | Default: NOW() | Last modification time |
| `metadata` | jsonb | Default: {} | Platform-specific data |

**Unique Index:** `idx_users_platform_user` on `(platform, platformUserId)`
**Relationships:** Referenced by `messages` (many), `extractedInfo` (assignee), `queryLogs` (many)

#### 3. `messages` - Raw Message Log
Complete audit trail of all platform messages.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique message identifier |
| `groupId` | UUID | FK → groups.id ON DELETE CASCADE | Associated group |
| `userId` | UUID | FK → users.id ON DELETE SET NULL | Message sender |
| `platformMessageId` | varchar(255) | NOT NULL | External message ID |
| `content` | text | NOT NULL | Raw message text |
| `replyToMessageId` | varchar(255) | Optional | Message thread reference |
| `threadId` | varchar(255) | Optional | Conversation thread ID |
| `createdAt` | timestamp | Default: NOW() | Message timestamp |
| `metadata` | jsonb | Default: {} | Platform metadata |

**Unique Index:** `idx_messages_group_platform` on `(groupId, platformMessageId)`
**Additional Indexes:**
- `idx_messages_group_created` on `(groupId, createdAt)` - Chronological queries
- `idx_messages_user` on `(userId)` - User message history

**Relationships:** None (extractedInfo table removed)

**NOTE:** extractedInfo and memories tables REMOVED (Phase 03 refactor) - mem0 OSS manages own tables internally.

#### 4. `queryLogs` - Analytics & Debugging
Complete query history for performance monitoring and debugging.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique log ID |
| `groupId` | UUID | FK → groups.id | Associated group |
| `userId` | UUID | FK → users.id | Query user |
| `queryText` | text | NOT NULL | User question/prompt |
| `responseText` | text | Optional | Bot response |
| `memoriesUsed` | UUID[] | Optional | Referenced memory IDs |
| `latencyMs` | integer | Optional | Response latency |
| `createdAt` | timestamp | Default: NOW() | Query timestamp |

**Relationships:** Analytics table, no cascade deletes

### Relational Diagram (Simplified)

```
groups (1) ──── (M) users
  │
  ├─── (M) messages ──── (1) users
  │
  └─── (M) queryLogs ──── (1) users

NOTE: extractedInfo & memories removed → managed by mem0 OSS
```

## Database Client (`packages/db/src/client.ts`)

### Connection Management

**Lazy Initialization Pattern:**
- Database connection only established on first use
- Prevents unnecessary connections in serverless environments
- Mutex-based synchronization prevents race conditions

**Connection Pooling:**
- **Development:** 1 connection (single-threaded testing)
- **Production:** 20 max connections (scaled for concurrent requests)
- **Idle Timeout:** 30 seconds
- **Connect Timeout:** 10 seconds

**Exports:**
- `db` - Lazy-loaded Drizzle ORM instance (Proxy-based)
- `checkDatabaseConnection()` - Health check function
- `closeDatabaseConnection()` - Graceful shutdown

### Configuration

```typescript
// Development: minimal pool
max: 1

// Production: scaled pool
max: 20
```

## CRUD Operations (`packages/db/src/operations.ts`)

### 7 Core Operations (Simplified after Phase 03 refactor)

#### Group Operations
1. **`upsertGroup(data)`** - Insert or update group by platform + platformGroupId
2. **`getGroupByPlatformId(platform, platformGroupId)`** - Retrieve group by platform ID

#### User Operations
3. **`upsertUser(data)`** - Insert or update user by platform + platformUserId
4. **`getUserByPlatformId(platform, platformUserId)`** - Retrieve user by platform ID

#### Message Operations
5. **`saveMessage(data)`** - Save message with duplicate prevention
6. **`getRecentMessages(groupId, limit)`** - Get last N messages with sender info

#### Query Log Operations
7. **`saveQueryLog(data)`** - Log user query for analytics

**REMOVED (Phase 03 refactor - mem0 handles):**
- saveExtractedInfo, getExtractedInfoByGroup
- saveMemory, getRecentMemories
- searchByVector, searchMemories
- getGroupStats

**Memory Operations:** Now handled by mem0 OSS (see `@jarvis/core/memory`)

## Package Exports (`packages/db/src/index.ts`)

All exports re-exported from:
- `client.ts` - Database instance and connection functions
- `schema.ts` - TypeScript types and table definitions
- `operations.ts` - 7 CRUD operations (simplified)

## Data Types (Phase 03 Refactored)

### TypeScript Inferred Types

```typescript
type Group = typeof groups.$inferSelect;
type NewGroup = typeof groups.$inferInsert;

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

type Message = typeof messages.$inferSelect;
type NewMessage = typeof messages.$inferInsert;

type QueryLog = typeof queryLogs.$inferSelect;
type NewQueryLog = typeof queryLogs.$inferInsert;
```

**REMOVED:** ExtractedInfo, NewExtractedInfo, Memory, NewMemory (mem0 manages internally)

All types are fully type-safe with Drizzle ORM inference.

## Vector Search Implementation (Phase 03 Refactored)

**NOTE:** Vector search delegated to mem0 OSS (no custom implementation)

### mem0 Vector Search
- **Embeddings:** Gemini embedding-001 (1536D, NOT 768D)
- **Storage:** PostgreSQL + pgvector (managed by mem0)
- **Distance Metric:** Cosine similarity
- **Deduplication:** Automatic via mem0

### Memory Operations (via `@jarvis/core/memory`)

```typescript
// Add memory (with auto extraction & deduplication)
await addMemory({
  userId,
  groupId,
  message,
  senderName?,
  groupName?
});

// Search memories
const results = await searchMemories({
  userId,
  groupId,
  query,
  limit: 5
});

// Returns: MemoryItem[] with id, memory, score, metadata
```

**All vector operations handled by mem0 internally - no manual embedding/search logic needed.**

## Integration Points

### With `packages/core`
- Receives embeddings from LLM processing
- Calls search operations for memory retrieval
- Stores extracted information (tasks, decisions, etc.)

### With `apps/api`
- Exposes CRUD operations via HTTP endpoints
- Provides health check status
- Handles webhook data storage

### With External APIs
- **Telegram:** Stores group/user IDs, messages, metadata
- **Lark Suite:** Stores group/user IDs, messages, metadata
- **Gemini:** Receives embeddings (1536D vectors)

## Development Workflow

### Database Commands
```bash
# Install dependencies
pnpm install

# Push schema to database (Drizzle)
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Interactive database studio
pnpm db:studio
```

### PostgreSQL Setup
```bash
# Start PostgreSQL with pgvector
docker compose -f docker/docker-compose.dev.yml up -d

# Verify connection
psql $DATABASE_URL -c "SELECT 1"

# Verify pgvector
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT version();"
```

## Database Connection String Format

```
postgresql://user:password@host:5432/database?sslmode=require
```

Environment variable: `DATABASE_URL`

## Testing Vector Search

```typescript
// Example: Search tasks by semantic similarity
const taskEmbedding = await embedModel.embed("need to prepare presentation");
const results = await searchByVector(taskEmbedding, {
  type: 'task',
  groupId: 'xxx-xxx-xxx',
  limit: 5,
  minSimilarity: 0.6
});
```

## Limitations & Future Improvements

### Current Limitations
- No vector indexes (sequential scan only)
- No soft deletes (uses cascading deletes)
- No audit trail on data modifications
- Memory type filtering is basic string matching

### Planned Improvements
- Add HNSW vector indexes for O(log n) search
- Implement soft deletes for compliance
- Add audit logging for modifications
- Implement background job for embedding generation
- Add compression for old messages

## File Structure

```
packages/db/
├── src/
│   ├── index.ts           # Package exports
│   ├── schema.ts          # Drizzle table definitions (150 lines)
│   ├── client.ts          # Database connection (65 lines)
│   └── operations.ts      # 14 CRUD + search operations (307 lines)
├── package.json
└── drizzle.config.ts      # Drizzle configuration
```

## LLM Layer (`packages/core/src/llm`)

### Overview
Task-based LLM routing with automatic fallback, Vietnamese system prompts, streaming support via AsyncGenerator.

### Components

#### 1. Provider (`provider.ts`)
**Models:**
- **Primary:** Gemini 2.5-flash-lite (all tasks via Vercel AI SDK)
- **Fallback:** GPT-4o-mini (used when Gemini fails)

**Task Types (5):**
- `chat` - General conversation with Vietnamese context
- `extraction` - Info extraction (tasks, decisions, deadlines)
- `summarization` - Conversation summaries
- `query` - Memory-based Q&A responses
- `translation` - Vietnamese ↔ English translation

**Functions:**
- `selectModel(task)` - Routes task to appropriate model
- `getFallback(primary)` - Selects fallback (Gemini ↔ OpenAI)
- `getModelName(model)` - Returns human-readable model name

#### 2. Service (`service.ts`)
**Interfaces:**
- `LLMRequest` - Task type, system prompt, prompt, temperature, maxTokens
- `LLMResponse` - Text, model name, fallback flag, latency in ms

**Functions:**
- `generate(request)` - Synchronous text generation with automatic fallback
  - Catches primary model errors
  - Falls back to GPT-4o-mini
  - Returns latency metrics
  - Type-safe response structure

- `stream(request)` - AsyncGenerator-based streaming with fallback
  - Yields text chunks as they arrive
  - Automatic fallback on stream failure
  - Supports long-running responses

#### 3. System Prompts (`prompts.ts`)
**Vietnamese System Prompts (5):**
1. **assistant** - General chatbot persona with memory & task tracking
2. **queryResponse** - Q&A based on stored information
3. **extraction** - Structured info extraction (tasks/decisions/deadlines)
4. **summarization** - Conversation summarization with action items
5. **translation** - Professional Vietnamese ↔ English translation

**Functions:**
- `getSystemPrompt(task)` - Retrieves prompt for specific task

### Architecture
```
Request (task + prompt)
    │
    ├─▶ selectModel(task) → Gemini 2.5-flash-lite
    │
    ├─▶ generateText / streamText (Vercel AI SDK)
    │
    ├─▶ [On Error] getFallback() → GPT-4o-mini
    │
    └─▶ Response {text, model, usedFallback, latencyMs}
```

### Test Coverage
**4 Test Files, 33 Tests Passing:**
- `service.integration.test.ts` - Fallback behavior, Vietnamese responses, streaming
- `provider.test.ts` - Model selection & fallback routing
- `prompts.test.ts` - System prompt validation
- `fallback.test.ts` - Error handling & recovery

**Test Categories:**
- Integration tests (chat, query, extraction, summarization tasks)
- Streaming validation (chunk accumulation, content preservation)
- Latency benchmarking (<10s per request, <5s average)
- Error handling (empty prompts, missing API keys)
- Response structure validation

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Applications** | 2 (api + dashboard) |
| **Packages** | 3 (config, db, core) |
| **Database Tables** | 4 (extractedInfo + memories removed) |
| **Enums** | 1 (info_type removed) |
| **CRUD Operations** | 7 (simplified, mem0 handles memory) |
| **Embedding Dimension** | 1536 (mem0 embedding-001) |
| **Max Pool Connections** | 20 (prod) / 1 (dev) |
| **LLM Task Types** | 5 |
| **System Prompts** | 5 |
| **Test Suites** | 4 (LLM layer) |
| **Test Coverage** | 33/33 PASS (100%) |
| **Code Reduction (Phase 03)** | 70% (~500 lines → ~150 lines) |
| **Dashboard Components** | Shadcn/ui + custom (planned) |
| **Codebase Files** | ~150+ files (repomix snapshot available) |

---

*Phase 01 (Dashboard): Project setup complete with Next.js 15, Tailwind CSS, Shadcn/ui, Zustand state management*
*Phase 03 REFACTORED: mem0 OSS self-hosted with 70% code reduction, Gemini 2.5-flash-lite LLM + embedding-001 (1536D)*
*Phase 04 complete: LLM layer integrated with task routing, fallback mechanism, Vietnamese prompts, streaming support, and 33/33 tests passing.*
