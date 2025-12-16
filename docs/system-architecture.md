# LuxBot - System Architecture

**Last Updated:** 2025-12-16
**Phase:** 03 - Memory Layer Implementation
**Document Version:** 1.1

## Architecture Overview

LuxBot is a modular, horizontally-scalable system designed for multi-platform chatbot deployment with persistent long-term memory capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                    External Platforms                        │
│         Telegram          │          Lark Suite              │
└────────────┬──────────────┴──────────────┬────────────────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Layer    │
                    │   (Hono)       │
                    ├────────────────┤
                    │ Webhook Routes │
                    │ Health Checks  │
                    │ Bot Handlers   │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼───┐      ┌────────▼────────┐   ┌─────▼─────┐
   │  Core  │      │  Database       │   │  Config   │
   │  Layer │      │  (Drizzle ORM)  │   │  Manager  │
   │        │      │  + pgvector     │   │           │
   ├────────┤      ├─────────────────┤   ├───────────┤
   │ mem0   │      │ 6 Tables        │   │ .env      │
   │ Gemini │      │ 14 Operations   │   │ Validation│
   │ OpenAI │      │ Vector Search   │   │           │
   └────────┘      └────────────────┘   └───────────┘
```

## Components

### 1. API Layer (`apps/api`)

**Role:** HTTP interface for webhooks and health checks

**Technology:** Hono (lightweight TypeScript web framework)

**Endpoints:**
- `GET /health` - Health check (API + database status)
- `POST /webhook/telegram` - Telegram message webhook
- `POST /webhook/lark` - Lark Suite message webhook

**Responsibilities:**
- Receive platform webhooks
- Parse platform-specific message formats
- Delegate to Core layer for processing
- Store messages and extracted info via Database layer
- Return webhook response

**Scaling:** Stateless, horizontally scalable

### 2. Core Layer (`packages/core`)

**Role:** AI-powered information extraction and memory management

**Components:**

#### 2.1 Memory Layer (Phase 03)
**Components:**

a) **Embeddings (embeddings.ts)**
- Model: Gemini text-embedding-004
- Output: 768-dimensional vectors
- Methods:
  - `embedText(text)` - Single embedding generation
  - `embedBatch(texts)` - Batch processing with parallelization
  - `cosineSimilarity(a, b)` - Vector similarity calculation
- Error handling: Validates non-empty text, throws on generation failure

b) **Information Extraction (extractor.ts)**
- Model: Gemini 2.0-flash-exp (Vietnamese-optimized)
- Confidence filtering: ≥0.7 threshold
- Classification types:
  - `task` - Work assignments
  - `decision` - Agreements/choices
  - `deadline` - Time-bound items
  - `important` - Critical info
  - `general` - Other insights
- Methods:
  - `extractInfo(message, context)` - Single message extraction
  - `extractBatch(messages)` - Batch extraction with parallelization
  - `normalizeDueDate(dateStr)` - ISO date validation/conversion
- Vietnamese extraction prompt optimized for group chats

c) **Storage Layer (storage.ts)**
- Methods:
  - `storeExtractedInfo(messageId, groupId, items)` - Save with embeddings
  - `storeMemory(groupId, userId, content, type)` - Long-term memory storage
  - `storeBatch(batch)` - Batch processing with sequential execution
- Features:
  - Auto-generates embeddings during storage
  - Metadata preservation (confidence, assignee)
  - Due date normalization
  - Async-safe with proper error handling

d) **Retrieval Layer (retriever.ts)**
- Methods:
  - `searchExtractedInfo(query, options)` - Semantic search with filters
  - `searchMemory(query, options)` - Memory semantic search
  - `getRecentExtractedInfo(groupId, limit)` - Temporal retrieval
  - `searchTasksByAssignee(groupId, assignee)` - Task filtering
  - `searchUpcomingDeadlines(groupId)` - Deadline retrieval
  - `multiSearch(queries, options)` - Multi-query with deduplication
- Features:
  - pgvector-based cosine similarity search
  - Configurable similarity threshold (default: 0.5)
  - Result deduplication across multiple queries
  - Sorted by similarity score

#### 2.2 LLM Processing
- **Primary:** Google Gemini 2.0-flash-exp
  - Low-latency responses
  - Embedding generation (768D via text-embedding-004)
  - Vietnamese-optimized extraction

- **Fallback:** OpenAI GPT-4 (future)
  - Used if Gemini fails
  - Same processing capabilities

#### 2.3 Information Extraction Pipeline
Extracts structured data from unstructured messages:

**Process:**
1. Receive raw message with optional context
2. Call LLM for extraction with confidence scoring
3. Filter results (confidence ≥0.7)
4. Generate embedding (768D)
5. Store with metadata in database
6. Enable semantic search retrieval

**Output:** ExtractedInfo records with embeddings and confidence scores

### 3. Database Layer (`packages/db`)

**Role:** Persistent data storage with vector search

**Core Components:**

#### 3.1 Schema (Drizzle ORM)
- 6 core tables
- 2 enumerated types
- 9 indexes
- Type-safe TypeScript integration

**Tables:**
1. `groups` - Platform chat groups/suites
2. `users` - Individual users
3. `messages` - Raw message audit trail
4. `extractedInfo` - Structured information (vector-enabled)
5. `memories` - Long-term memory storage (vector-enabled)
6. `queryLogs` - Analytics/debugging

#### 3.2 Client (postgres.js)
- Lazy connection initialization
- Mutex-based race condition prevention
- Configurable connection pooling
  - Dev: 1 connection
  - Prod: 20 connections
- Health check function
- Graceful shutdown

#### 3.3 Operations (14 CRUD + Search)

**Groups (2 ops):**
- upsertGroup
- getGroupByPlatformId

**Users (2 ops):**
- upsertUser
- getUserByPlatformId

**Messages (2 ops):**
- saveMessage
- getRecentMessages

**Extracted Info (2 ops):**
- saveExtractedInfo
- getExtractedInfoByGroup

**Memories (2 ops):**
- saveMemory
- getRecentMemories

**Query Logs (1 op):**
- saveQueryLog

**Vector Search (2 ops):**
- searchByVector (extractedInfo with filters)
- searchMemories (memory semantic search)

**Analytics (1 op):**
- getGroupStats

#### 3.4 Vector Search
- **Embeddings:** 768-dimensional Gemini text-embedding-004 vectors
- **Storage:** PostgreSQL pgvector extension
- **Distance Metric:** Cosine similarity (1 - dot_product)
- **Indexes:** Planned HNSW optimization (Phase 05)
- **Use Cases:**
  - Semantic search on extracted information
  - Memory retrieval for context generation
  - Task/deadline discovery by semantic similarity

### 4. Configuration Layer (`packages/config`)

**Role:** Environment validation and configuration management

**Responsibilities:**
- Validate required environment variables
- Provide type-safe config objects
- Early error reporting
- Runtime validation

**Key Variables:**
- `DATABASE_URL` - PostgreSQL connection
- `TELEGRAM_BOT_TOKEN` - Telegram Bot API
- `LARK_APP_ID`, `LARK_APP_SECRET` - Lark Suite
- `GEMINI_API_KEY` - Google Gemini API
- `OPENAI_API_KEY` - OpenAI API
- `NODE_ENV` - Environment (dev/prod)
- `WEBHOOK_DOMAIN` - Public domain

## Data Flow

### Message Processing Flow

```
Platform Message
    │
    ▼
Webhook Endpoint (API)
    │
    ├─▶ User Lookup/Upsert
    │   └─▶ Database: upsertUser()
    │
    ├─▶ Message Save
    │   └─▶ Database: saveMessage()
    │
    ├─▶ Information Extraction (Core)
    │   ├─▶ Generate Embedding (Gemini)
    │   ├─▶ LLM Analysis
    │   └─▶ Parse Response
    │
    ├─▶ Save Extracted Info
    │   └─▶ Database: saveExtractedInfo() + vector
    │
    ├─▶ Memory Retrieval
    │   ├─▶ Generate Query Embedding
    │   └─▶ Database: searchMemories()
    │
    ├─▶ Generate Response
    │   ├─▶ Use Retrieved Memories
    │   ├─▶ LLM Generation
    │   └─▶ Vietnamese localization
    │
    └─▶ Return to Platform
```

### Vector Search Flow

```
User Query
    │
    ├─▶ Generate Embedding (Gemini)
    │
    ├─▶ Search Database
    │   ├─▶ searchByVector(embedding) for tasks
    │   ├─▶ searchMemories(embedding) for context
    │   └─▶ getGroupStats() for summary
    │
    ├─▶ Rank Results by Similarity
    │   └─▶ Cosine distance scoring
    │
    ├─▶ Prepare Context
    │   └─▶ Top K results + group stats
    │
    └─▶ Pass to LLM for Response Generation
```

## Deployment Architecture

### Development Environment

```
┌────────────────────────────┐
│  Developer Machine         │
│  ┌──────────────────────┐  │
│  │  Node.js + pnpm      │  │
│  │  ├─ apps/api         │  │
│  │  ├─ packages/db      │  │
│  │  ├─ packages/core    │  │
│  │  └─ packages/config  │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ Docker Compose       │  │
│  │ ├─ PostgreSQL 15     │  │
│  │ └─ pgvector 0.5      │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

**Setup:**
```bash
docker compose -f docker/docker-compose.dev.yml up -d
pnpm install
pnpm db:push
pnpm dev
```

### Production Deployment

```
┌─────────────────────────────────────────────────────┐
│           VPS (Self-hosted)                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  Node.js Process (Hono API)                  │  │
│  │  ├─ Bot Handlers                            │  │
│  │  ├─ Webhook Endpoints                       │  │
│  │  └─ Health Checks                           │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  PostgreSQL 15 (Data Persistence)           │  │
│  │  ├─ pgvector Extension                      │  │
│  │  ├─ 6 Core Tables                           │  │
│  │  └─ Automated Backups                       │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Monitoring & Logging                       │  │
│  │  ├─ Query Logs Table                        │  │
│  │  ├─ Error Tracking                          │  │
│  │  └─ Performance Metrics                     │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Characteristics:**
- **Stateless API:** Multiple instances possible
- **Database Pooling:** 20 connections per instance
- **Vector Caching:** Future optimization via Redis
- **Backup Strategy:** PostgreSQL WAL archiving

## Technology Integration Points

### Telegram Integration
- **SDK:** grammY
- **Data:** Messages, user IDs, group IDs
- **Storage:** `groups.metadata`, `users.metadata`
- **Flow:** Webhook → saveMessage → extractedInfo → Response

### Lark Suite Integration
- **SDK:** @larksuiteoapi/node-sdk
- **Data:** Messages, user IDs, suite IDs
- **Storage:** `groups.metadata`, `users.metadata`
- **Flow:** Webhook → saveMessage → extractedInfo → Response

### Gemini API
- **Models:**
  - `gemini-2.0-flash-exp` - LLM for extraction (low-latency)
  - `text-embedding-004` - Embeddings (768D output)
- **Operations:**
  - Information extraction from messages (Vietnamese-optimized)
  - Response generation
  - Embedding generation for vector search (768D)
  - Confidence scoring for extraction confidence ≥0.7
- **Fallback:** OpenAI GPT-4 (future)

### PostgreSQL + pgvector
- **Tables:** 6 core + 1 audit
- **Vector Ops:** Cosine similarity search
- **Extensions:** pgvector for semantic search
- **Pooling:** 20 max connections (production)

## Scalability Considerations

### Horizontal Scaling
- **Stateless API:** Deploy multiple instances behind load balancer
- **Database:** Single PostgreSQL (vertical scaling) or connection pooling
- **Future:** Read replicas for query scaling

### Vertical Scaling (Database)
- **Connection Pool:** Increased from 20 to 50+ connections
- **Memory:** PostgreSQL shared_buffers optimization
- **Indexes:** Add HNSW indexes for vector search
- **Partitioning:** Time-based partitioning for large tables

### Performance Optimizations
1. **Vector Search:** Add HNSW index (O(log n) vs O(n))
2. **Message Queries:** Composite indexes on (groupId, createdAt)
3. **Caching:** Redis for frequently accessed memories
4. **Batch Operations:** Bulk upsert for high-volume scenarios
5. **Connection Pooling:** PgBouncer for many-to-many connections

## Security Architecture

### API Layer
- Webhook signature verification (platform-specific)
- Rate limiting (future: per-group, per-user)
- Input validation (sanitization for XSS/SQL injection)

### Database Layer
- PostgreSQL role-based access control
- SSL/TLS connection encryption
- Connection pooling isolation
- Parameterized queries (SQL injection protection)

### API Keys & Secrets
- Environment variable management
- Config validation on startup
- No secrets in logs or metrics

### Data Privacy
- Encryption at rest (PostgreSQL extensions)
- Encryption in transit (HTTPS webhooks, TLS DB)
- GDPR-ready: Soft deletes + audit trail (future)

## Monitoring & Observability

### Health Checks
- API: `GET /health` returns status
- Database: Connectivity verified at startup
- Webhooks: Logged per message

### Analytics (`query_logs` table)
- User queries
- Response latency
- Memory usage tracking
- Failure rates

### Metrics to Track
- Message processing latency
- Vector search latency
- Database connection pool utilization
- API response times
- LLM API latency (Gemini vs OpenAI)

## Error Handling Strategy

### Graceful Degradation
1. Gemini API failure → fallback to OpenAI
2. Vector search failure → use keyword search
3. Memory retrieval failure → continue without context
4. Database connection failure → return error response

### Logging
- ERROR: API errors, database failures
- WARN: Slower operations, API fallbacks
- INFO: Normal operation, request summaries
- DEBUG: Detailed flow information

## Disaster Recovery

### Backup Strategy
- PostgreSQL WAL archiving (continuous)
- Daily full backups
- Point-in-time recovery capability
- Test restores monthly

### Failover
- Database failover: Manual or automated replica (future)
- API failover: Load balancer health checks
- Webhook retry: Platform-provided retry mechanism

## Phase Completion Status

### Phase 03 (Memory Layer) - COMPLETED
- Embeddings layer with 768D Gemini text-embedding-004
- Vietnamese-optimized extraction with confidence filtering (≥0.7)
- Storage layer with automatic embedding generation
- Retrieval layer with multi-search and deduplication
- Vector search with pgvector cosine similarity

### Phase 04 (API Integration) - UPCOMING
- HTTP endpoints for memory queries
- Webhook memory context injection
- Response generation with memory augmentation

### Phase 05 (Production Hardening)
- HNSW vector indexes
- Query result caching (Redis)
- Soft deletes and audit logging
- Rate limiting and throttling

### Phase 06 (Advanced Features)
- Multi-language support optimization
- Custom embeddings model training
- Conversation context windows
- Scheduled task notifications

## Configuration Reference

### Environment Variables (Required)
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Telegram
TELEGRAM_BOT_TOKEN=xxx

# Lark Suite
LARK_APP_ID=xxx
LARK_APP_SECRET=xxx

# LLMs
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# Deployment
NODE_ENV=production|development
WEBHOOK_DOMAIN=https://luxbot.example.com
```

### Database Configuration
```typescript
// Development
max: 1            // Single connection
idle_timeout: 30  // 30 seconds
connect_timeout: 10

// Production
max: 20           // 20 connections
idle_timeout: 30  // 30 seconds
connect_timeout: 10
```

## Glossary

| Term | Definition |
|------|-----------|
| **Embedding** | 768-dimensional vector from Gemini text-embedding-004, semantic meaning |
| **Vector Search** | Cosine similarity search across embeddings (0.0-1.0 scores) |
| **pgvector** | PostgreSQL extension for vector operations |
| **Confidence** | Extraction confidence score (0.0-1.0), filtered ≥0.7 |
| **Lazy Init** | Database connection only created on first use |
| **Mutex** | Mutual exclusion to prevent race conditions |
| **mem0** | Long-term memory framework for AI agents |
| **Gemini 2.0-flash** | Google's fast LLM for extraction |
| **text-embedding-004** | Google's 768D embedding model |
| **Drizzle ORM** | TypeScript-first ORM with type inference |
| **Hono** | Lightweight, fast web framework |
| **WAL** | Write-Ahead Logging (PostgreSQL backup) |
| **HNSW** | Hierarchical Navigable Small World (vector index) |
| **Deduplication** | Result combination with highest similarity score retention |

---

*Complete system architecture for Phase 03: Memory Layer with embeddings, extraction, storage, and retrieval components.*
