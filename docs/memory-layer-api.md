# J.A.R.V.I.S - Memory Layer API Documentation

**Last Updated:** 2025-12-17
**Phase:** 03 - mem0 Python SDK + FastAPI Service (REFACTORED)
**Type:** Memory Processing API Reference

## Overview

Memory layer uses **mem0 Python SDK** via a FastAPI service (`apps/memory-service/`). TypeScript code calls the Python service via HTTP.

**Architecture:**
```
TypeScript API → HTTP Client → Python FastAPI → mem0ai SDK → PostgreSQL + pgvector
```

## Python Memory Service (`apps/memory-service/main.py`)

### Configuration

```python
from mem0 import Memory

config = {
    "llm": {
        "provider": "gemini",
        "config": {
            "model": "gemini-2.5-flash-lite",
            "temperature": 0.1,
            "max_tokens": 2000,
        },
    },
    "embedder": {
        "provider": "gemini",
        "config": {
            "model": "gemini-embedding-001",  # 1536D
        },
    },
    "vector_store": {
        "provider": "pgvector",
        "config": {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", "5432")),
            "user": os.getenv("DB_USER", "postgres"),
            "password": os.getenv("DB_PASSWORD"),
            "dbname": os.getenv("DB_NAME", "jarvis"),
            "collection_name": "memories",
            "embedding_model_dims": 1536,
        },
    },
}

memory = Memory.from_config(config)
```

**Key Points:**
- LLM: Gemini 2.5-flash-lite (fast, cost-effective)
- Embeddings: gemini-embedding-001 with **1536D** vectors
- Vector Store: PostgreSQL + pgvector (self-hosted)
- Vietnamese date normalization built-in

---

### REST API Endpoints

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "memory-service",
  "mem0": true
}
```

---

#### `POST /memories/add`
Add memory with automatic extraction, embedding, and deduplication.

**Request:**
```json
{
  "user_id": "user-123",
  "group_id": "group-456",
  "message": "Cần deploy hệ thống vào thứ 6 tuần này",
  "sender_name": "Alice",
  "group_name": "Dev Team",
  "sent_at": "2025-12-17T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": []
}
```

**Features:**
- Vietnamese date normalization (ngày mai → absolute date)
- Automatic extraction using Gemini 2.5-flash-lite
- Automatic deduplication against existing memories
- Metadata stored: sender_name, group_name, sent_at, original_message

---

#### `POST /memories/search`
Semantic search across stored memories.

**Request:**
```json
{
  "user_id": "user-123",
  "group_id": "group-456",
  "query": "deployment deadline",
  "limit": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mem-uuid",
      "memory": "Deploy hệ thống vào thứ 6 tuần này",
      "score": 0.89,
      "metadata": {
        "sender_name": "Alice",
        "sent_at": "2025-12-17T10:00:00Z"
      }
    }
  ]
}
```

---

#### `POST /memories/all`
Retrieve all memories for user/group.

**Request:**
```json
{
  "user_id": "user-123",
  "group_id": "group-456",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

#### `POST /memories/update`
Update existing memory content.

**Request:**
```json
{
  "memory_id": "mem-uuid",
  "data": "Updated: Deploy postponed to Monday"
}
```

**Response:**
```json
{
  "success": true
}
```

---

#### `POST /memories/delete`
Delete memory by ID.

**Request:**
```json
{
  "memory_id": "mem-uuid"
}
```

---

#### `POST /memories/delete-all`
Delete all memories for user/group.

**Request:**
```json
{
  "user_id": "user-123",
  "group_id": "group-456"
}
```

---

#### `GET /memories/history/{memory_id}`
Get memory history (audit trail).

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

## TypeScript HTTP Client (`packages/core/src/memory/mem0-client.ts`)

HTTP client calling Python memory service.

### Configuration

```typescript
import { env } from '@jarvis/config';

const MEMORY_SERVICE_URL = env.MEMORY_SERVICE_URL;
// e.g., http://localhost:8000
```

---

### Type: `MemoryItem`

```typescript
export interface MemoryItem {
  id: string;
  memory: string;
  metadata?: Record<string, unknown>;
  score?: number;
  created_at?: string;
  updated_at?: string;
}
```

---

### `addMemory(params)`

Add memory via Python service.

**Signature:**
```typescript
function addMemory(params: {
  userId: string;
  groupId: string;
  message: string;
  senderName?: string;
  groupName?: string;
  sentAt?: Date;
  metadata?: Record<string, unknown>;
}): Promise<void>
```

**Usage:**
```typescript
import { addMemory } from '@jarvis/core';

await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Cần deploy hệ thống vào thứ 6 tuần này',
  senderName: 'Alice',
  groupName: 'Dev Team',
  sentAt: new Date(),
});
```

---

### `searchMemories(params)`

Semantic search via Python service.

**Signature:**
```typescript
function searchMemories(params: {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]>
```

**Usage:**
```typescript
const results = await searchMemories({
  userId: 'user-123',
  groupId: 'group-456',
  query: 'deployment deadline',
  limit: 5,
});

results.forEach(r => {
  console.log(`[${r.score}] ${r.memory}`);
});
```

---

### `getAllMemories(params)`

Retrieve all memories for user/group.

**Signature:**
```typescript
function getAllMemories(params: {
  userId: string;
  groupId: string;
  limit?: number;
}): Promise<MemoryItem[]>
```

---

### `updateMemory(memoryId, data)`

Update existing memory.

**Signature:**
```typescript
function updateMemory(
  memoryId: string,
  data: string
): Promise<void>
```

---

### `deleteMemory(memoryId)`

Delete memory by ID.

**Signature:**
```typescript
function deleteMemory(memoryId: string): Promise<void>
```

---

### `deleteAllMemories(params)`

Delete all memories for user/group.

**Signature:**
```typescript
function deleteAllMemories(params: {
  userId: string;
  groupId: string;
}): Promise<void>
```

---

### `getMemoryHistory(memoryId)`

Get memory audit trail.

**Signature:**
```typescript
function getMemoryHistory(
  memoryId: string
): Promise<MemoryHistoryEntry[]>
```

---

### `isMemoryEnabled()`

Check if memory service is available.

**Signature:**
```typescript
function isMemoryEnabled(): Promise<boolean>
```

---

### `getMemoryHealth()`

Get memory service health status.

**Signature:**
```typescript
function getMemoryHealth(): Promise<{
  status: string;
  service: string;
  mem0: boolean;
} | null>
```

---

## Retriever Module (`retriever.ts`)

Wrapper for mem0 HTTP client with formatting.

### `searchRelevantMemories(params)`

Search for relevant memories.

**Signature:**
```typescript
function searchRelevantMemories(params: {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]>
```

---

### `formatMemoriesForPrompt(memories)`

Format memories into prompt-friendly string.

**Signature:**
```typescript
function formatMemoriesForPrompt(
  memories: MemoryItem[]
): string
```

**Returns:**
- Numbered list of memories
- Vietnamese fallback: "Không có thông tin liên quan được lưu trữ."

---

## Storage Module (`storage.ts`)

Message audit trail only (NOT for memory).

### `storeMessage(params)`

Save message to database for audit trail.

**Signature:**
```typescript
function storeMessage(params: {
  platformMessageId: string;
  groupId: string;
  userId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
}): Promise<void>
```

---

## Vietnamese Language Support

**Python Service Features:**
- Date normalization: `ngày mai` → `ngày 18/12/2025`
- Date normalization: `hôm nay` → `ngày 17/12/2025`
- Date normalization: `hôm qua` → `ngày 16/12/2025`
- LLM: Gemini 2.5-flash-lite (multilingual, Vietnamese-capable)
- Search: Semantic search works with Vietnamese queries

**Examples:**
```typescript
// Vietnamese input
await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Mai họp team lúc 2 giờ chiều',
  sentAt: new Date('2025-12-17'),
});
// Stored as: "Ngày 18/12/2025 họp team lúc 2 giờ chiều"

// Vietnamese search
const results = await searchMemories({
  userId: 'user-123',
  groupId: 'group-456',
  query: 'khi nào họp',
  limit: 5,
});
```

---

## Running the Service

### Development

```bash
# Start Python memory service
cd apps/memory-service
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run service
GEMINI_API_KEY=xxx \
DB_HOST=localhost \
DB_PORT=5432 \
DB_USER=postgres \
DB_PASSWORD=xxx \
DB_NAME=jarvis \
python main.py
# Runs on http://localhost:8000
```

### Docker

```yaml
# docker-compose.yml
memory-service:
  build: ./apps/memory-service
  ports:
    - "8000:8000"
  environment:
    - GEMINI_API_KEY=${GEMINI_API_KEY}
    - DB_HOST=postgres
    - DB_PORT=5432
    - DB_USER=postgres
    - DB_PASSWORD=${DB_PASSWORD}
    - DB_NAME=jarvis
```

---

## Environment Variables

### Python Service
```bash
GEMINI_API_KEY=xxx
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=xxx
DB_NAME=jarvis
```

### TypeScript Client
```bash
MEMORY_SERVICE_URL=http://localhost:8000
```

---

## Error Handling

**HTTP Client:**
```typescript
const results = await searchMemories({
  userId: 'non-existent',
  groupId: 'non-existent',
  query: 'anything',
});
// Returns: [] (empty array on failure)
```

**Python Service:**
- Returns `{ success: false, error: "message" }` on errors
- Logs errors to console
- HTTP 503 if mem0 not initialized

---

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| addMemory | 200-500ms | LLM extraction + embedding + HTTP |
| searchMemories | 150-300ms | Embedding + vector search + HTTP |
| getAllMemories | 50-150ms | Direct database query + HTTP |
| updateMemory | 200-400ms | Re-embedding + update + HTTP |
| deleteMemory | 50-100ms | Database delete + HTTP |

---

## Integration Example

Complete workflow:

```typescript
import {
  addMemory,
  searchRelevantMemories,
  formatMemoriesForPrompt,
  storeMessage,
  isMemoryEnabled,
} from '@jarvis/core';

async function processMessage(
  message: string,
  context: { groupId: string; userId: string; messageId: string }
) {
  // 0. Check if memory service is available
  if (!(await isMemoryEnabled())) {
    console.warn('Memory service unavailable');
    return { memories: [], context_str: '' };
  }

  // 1. Store message for audit
  await storeMessage({
    platformMessageId: context.messageId,
    groupId: context.groupId,
    userId: context.userId,
    content: message,
  });

  // 2. Add to memory via Python service
  await addMemory({
    userId: context.userId,
    groupId: context.groupId,
    message,
    sentAt: new Date(),
  });

  // 3. Search for context
  const memories = await searchRelevantMemories({
    userId: context.userId,
    groupId: context.groupId,
    query: message,
    limit: 5,
  });

  // 4. Format for LLM prompt
  const context_str = formatMemoriesForPrompt(memories);

  return { memories, context_str };
}
```

---

## Database Tables

**mem0 Manages (via pgvector):**
- `memories` collection in pgvector
- Vector embeddings (1536D)
- Deduplication metadata

**Drizzle ORM Manages:**
- `groups` - Platform groups
- `users` - Platform users
- `messages` - Message audit trail
- `queryLogs` - Analytics

---

*Memory Layer API for Phase 03: Python FastAPI service with mem0ai SDK + TypeScript HTTP client.*
