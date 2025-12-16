# Travis - Codebase Summary

**Last Updated:** 2025-12-16
**Phase:** 04 - LLM Integration Completion
**Status:** LLM layer complete with Gemini 2.5-flash-lite primary + GPT-4o fallback, task-based routing, Vietnamese prompts, and streaming support

## Project Overview

Travis is a Vietnamese executive assistant chatbot with long-term memory capabilities, designed for multi-platform deployment (Telegram and Lark Suite). The system leverages AI-powered information extraction and semantic search through PostgreSQL vector embeddings.

## Architecture

```
Travis (Monorepo)
├── apps/
│   └── api/              # Hono API server (TypeScript)
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
| **Memory Framework** | mem0 + Vercel AI SDK | Latest |
| **Telegram SDK** | grammY | Latest |
| **Lark SDK** | @larksuiteoapi/node-sdk | Latest |
| **Language** | TypeScript | 5.0+ |

## Database Schema (Phase 02)

### Overview
6 core tables with relational integrity, automatic timestamps, and vector search capabilities:

### Enums

#### `platform_type`
Values: `'telegram'` | `'lark'`
Used by: `groups`, `users`

#### `info_type`
Values: `'task'` | `'decision'` | `'deadline'` | `'important'` | `'general'`
Used by: `extractedInfo`

### Core Tables

#### 1. `groups` - Multi-platform Chat Groups
Represents Telegram groups or Lark suites integrated with Travis.

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

**Relationships:** Parent of `extractedInfo` (cascade)

#### 4. `extractedInfo` - Structured Information Extraction
Tasks, decisions, deadlines, and important information extracted from messages via AI.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique record ID |
| `messageId` | UUID | FK → messages.id ON DELETE CASCADE | Source message |
| `groupId` | UUID | FK → groups.id ON DELETE CASCADE | Associated group |
| `infoType` | info_type | NOT NULL | Type: task/decision/deadline/important/general |
| `content` | text | NOT NULL | Full extracted content |
| `summary` | text | Optional | Short summary (e.g., task title) |
| `assigneeUserId` | UUID | FK → users.id | Assigned user (optional) |
| `dueDate` | timestamp | Optional | Deadline (for tasks/deadlines) |
| `status` | varchar(50) | Default: 'active' | Status: active/completed/archived |
| `embedding` | vector(1536) | Optional | Gemini embedding for semantic search |
| `createdAt` | timestamp | Default: NOW() | Extraction timestamp |
| `updatedAt` | timestamp | Default: NOW() | Last update timestamp |
| `metadata` | jsonb | Default: {} | Additional context |

**Indexes:**
- `idx_extracted_info_type` on `(infoType)` - Filter by type
- `idx_extracted_info_group_created` on `(groupId, createdAt)` - Time-based queries
- `idx_extracted_info_assignee` on `(assigneeUserId)` - Assigned tasks
- `idx_extracted_info_status` on `(status)` - Status filtering

**Vector Search:** Supports 1536-dimensional semantic similarity queries via pgvector

#### 5. `memories` - Long-term Memory Storage
Persistent facts, preferences, and context for mem0 and direct vector storage.

| Column | Type | Constraints | Purpose |
|--------|------|-----------|---------|
| `id` | UUID | PK, Default: Random | Unique memory ID |
| `userId` | varchar(255) | Optional | mem0 user context |
| `agentId` | varchar(255) | Optional | mem0 agent context |
| `groupId` | UUID | FK → groups.id | Associated group |
| `content` | text | NOT NULL | Memory content |
| `embedding` | vector(1536) | Optional | Gemini embedding |
| `memoryType` | varchar(50) | Optional | Type: fact/preference/context |
| `createdAt` | timestamp | Default: NOW() | Record creation time |
| `updatedAt` | timestamp | Default: NOW() | Last update time |
| `metadata` | jsonb | Default: {} | Additional data |

**Indexes:**
- `idx_memories_user` on `(userId)` - User memory retrieval
- `idx_memories_group` on `(groupId)` - Group memory retrieval
- `idx_memories_type` on `(memoryType)` - Memory type filtering

**Vector Search:** Supports semantic similarity search for memory retrieval

#### 6. `queryLogs` - Analytics & Debugging
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

### Relational Diagram

```
groups (1) ──── (M) users
  │
  ├─── (M) messages ──── (1) users
  │         │
  │         └─── (M) extractedInfo
  │
  ├─── (M) extractedInfo ──── (1) users (assignee)
  │
  ├─── (M) memories
  │
  └─── (M) queryLogs ──── (1) users
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

### 14 Core Operations

#### Group Operations
1. **`upsertGroup(data)`** - Insert or update group by platform + platformGroupId
2. **`getGroupByPlatformId(platform, platformGroupId)`** - Retrieve group by platform ID

#### User Operations
3. **`upsertUser(data)`** - Insert or update user by platform + platformUserId
4. **`getUserByPlatformId(platform, platformUserId)`** - Retrieve user by platform ID

#### Message Operations
5. **`saveMessage(data)`** - Save message with duplicate prevention
6. **`getRecentMessages(groupId, limit)`** - Get last N messages with sender info

#### Extracted Info Operations
7. **`saveExtractedInfo(data)`** - Save extracted task/decision/deadline
8. **`getExtractedInfoByGroup(groupId, options)`** - Retrieve by group with optional filtering

#### Memory Operations
9. **`saveMemory(data)`** - Store memory fact/preference/context
10. **`getRecentMemories(groupId, limit)`** - Retrieve recent memories

#### Query Log Operations
11. **`saveQueryLog(data)`** - Log user query for analytics

#### Vector Search Operations
12. **`searchByVector(embedding, options)`** - Semantic search in extractedInfo
    - Validates 1536D embeddings
    - Filters by group, type, similarity threshold
    - Returns ranked results with similarity scores

13. **`searchMemories(embedding, options)`** - Semantic search in memories
    - Validates 1536D embeddings
    - Filters by group
    - Returns ranked results

#### Analytics
14. **`getGroupStats(groupId)`** - Aggregate group statistics
    - Total messages
    - Task/decision/deadline counts
    - Total memories

### Embedding Validation

All vector operations enforce:
- **Dimension:** Exactly 1536 (Gemini embedding-001)
- **Type:** Array of numbers
- **NaN Check:** All elements must be valid numbers
- **Error Handling:** Throws descriptive errors on validation failure

### SQL Safety

Vector search operations use:
- Parameterized queries to prevent SQL injection
- Safe embedding conversion to PostgreSQL array format
- PostgreSQL distance operator `<=>` for cosine similarity

## Package Exports (`packages/db/src/index.ts`)

All exports re-exported from:
- `client.ts` - Database instance and connection functions
- `schema.ts` - TypeScript types and table definitions
- `operations.ts` - 14 CRUD and search operations

## Data Types

### TypeScript Inferred Types

```typescript
type Group = typeof groups.$inferSelect;
type NewGroup = typeof groups.$inferInsert;

type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

type Message = typeof messages.$inferSelect;
type NewMessage = typeof messages.$inferInsert;

type ExtractedInfo = typeof extractedInfo.$inferSelect;
type NewExtractedInfo = typeof extractedInfo.$inferInsert;

type Memory = typeof memories.$inferSelect;
type NewMemory = typeof memories.$inferInsert;

type QueryLog = typeof queryLogs.$inferSelect;
type NewQueryLog = typeof queryLogs.$inferInsert;
```

All types are fully type-safe with Drizzle ORM inference.

## Vector Search Implementation

### Embeddings Specification
- **Model:** Gemini embedding-001
- **Dimension:** 1536
- **Distance Metric:** Cosine similarity (PostgreSQL `<=>` operator)
- **Similarity Range:** 0.0 (dissimilar) to 1.0 (identical)

### Search Operations

#### extractedInfo Vector Search
```typescript
searchByVector(embedding, {
  groupId?: string;      // Optional group filter
  type?: InfoType;       // Optional type filter (task/decision/deadline/etc)
  limit?: number;        // Default: 10
  minSimilarity?: number; // Default: 0.5
})
```

Returns: `id`, `type`, `content`, `summary`, `dueDate`, `similarity` score

#### memories Vector Search
```typescript
searchMemories(embedding, {
  groupId?: string;      // Optional group filter
  limit?: number;        // Default: 10
})
```

Returns: `id`, `content`, `type`, `similarity` score

### Performance Considerations
- pgvector supports HNSW indexing (future optimization)
- Current implementation uses sequential scan
- Add vector index when similarity queries become bottleneck: `CREATE INDEX ON extracted_info USING hnsw (embedding vector_cosine_ops)`

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
| **Database Tables** | 6 |
| **Enums** | 2 |
| **Database Indexes** | 9 |
| **CRUD Operations** | 14 |
| **Vector-enabled Tables** | 2 |
| **Embedding Dimension** | 1536 |
| **Max Pool Connections** | 20 (prod) / 1 (dev) |
| **LLM Task Types** | 5 |
| **System Prompts** | 5 |
| **Test Suites** | 4 |
| **Test Coverage** | 33/33 PASS (100%) |

---

*Phase 04 complete: LLM layer integrated with task routing, fallback mechanism, Vietnamese prompts, streaming support, and 33/33 tests passing.*
