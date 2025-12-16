# J.A.R.V.I.S - Memory Layer API Documentation

**Last Updated:** 2025-12-16
**Phase:** 03 - mem0 OSS Self-Hosted Integration (REFACTORED)
**Type:** Memory Processing API Reference

## Overview

Memory layer uses **mem0 OSS (self-hosted)** via `mem0ai` package for complete data privacy and control. Delegates all memory operations (extraction, embedding, deduplication, storage, retrieval) to mem0's Memory class.

**Architecture:** mem0ai → Gemini 2.5-flash-lite (LLM) + embedding-001 (1536D) → PostgreSQL + pgvector (vector store) + SQLite (history)

## mem0 Client (`mem0-client.ts`)

### Configuration

```typescript
import { Memory } from 'mem0ai/oss';

export const memory = new Memory({
  version: 'v1.1',
  llm: {
    provider: 'google_ai',
    config: {
      apiKey: env.GEMINI_API_KEY,
      model: 'gemini-2.5-flash-lite', // NOT gemini-2.5
    },
  },
  embedder: {
    provider: 'google_ai',
    config: {
      apiKey: env.GEMINI_API_KEY,
      model: 'embedding-001', // 1536D embeddings
    },
  },
  vectorStore: {
    provider: 'pgvector',
    config: {
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT || '5432'),
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      collectionName: 'memories',
      dimension: 1536, // NOT 768
    },
  },
  historyStore: {
    provider: 'sqlite',
    config: {
      historyDbPath: './memory_history.db',
    },
  },
});
```

**Key Points:**
- LLM: Gemini 2.5-flash-lite (fast, cost-effective)
- Embeddings: embedding-001 with **1536D** vectors (NOT 768D)
- Vector Store: PostgreSQL + pgvector (self-hosted)
- History Store: SQLite (local file)
- Version: v1.1 (mem0 API version)

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

**Type Safety:**
- Proper interface (NO any/unknown)
- Runtime type guards: `Array.isArray(results) ? results : []`
- All functions return `Promise<MemoryItem[]>` or `Promise<void>`

---

### `addMemory(params)`

Add memory with automatic extraction, embedding, and deduplication.

**Signature:**
```typescript
function addMemory(params: {
  userId: string;
  groupId: string;
  message: string;
  senderName?: string;
  groupName?: string;
}): Promise<void>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | User identifier for mem0 context |
| `groupId` | string | Yes | Group identifier for mem0 context |
| `message` | string | Yes | Message content to extract from |
| `senderName` | string | No | Message sender name |
| `groupName` | string | No | Group/chat name |

**Usage:**
```typescript
import { addMemory } from '@travis/core';

await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Cần deploy hệ thống vào thứ 6 tuần này',
  senderName: 'Alice',
  groupName: 'Dev Team',
});
```

**What mem0 Does:**
1. Extracts information using Gemini 2.5-flash-lite
2. Generates 1536D embedding with embedding-001
3. Deduplicates against existing memories
4. Stores in PostgreSQL vector table
5. Logs to SQLite history

**Returns:** void (fire-and-forget)

---

### `searchMemories(params)`

Semantic search across stored memories.

**Signature:**
```typescript
function searchMemories(params: {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | - | User context for search |
| `groupId` | string | - | Group context for search |
| `query` | string | - | Search query text |
| `limit` | number | 5 | Max results |

**Returns:**
- Array of MemoryItem with similarity scores
- Empty array if no results

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

**What mem0 Does:**
1. Generates 1536D embedding from query
2. Cosine similarity search in pgvector
3. Filters by userId/groupId (agentId)
4. Returns top K results with scores

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

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | - | User context |
| `groupId` | string | - | Group context |
| `limit` | number | 10 | Max results |

**Returns:**
- Array of MemoryItem (all memories, not filtered by query)

**Usage:**
```typescript
const all = await getAllMemories({
  userId: 'user-123',
  groupId: 'group-456',
  limit: 20,
});
```

---

### `updateMemory(memoryId, newText)`

Update existing memory content.

**Signature:**
```typescript
function updateMemory(
  memoryId: string,
  newText: string
): Promise<void>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `memoryId` | string | Memory ID to update |
| `newText` | string | New memory content |

**Usage:**
```typescript
await updateMemory(
  'mem-id-123',
  'Updated: Deploy postponed to Monday'
);
```

**What mem0 Does:**
1. Updates memory text
2. Regenerates embedding
3. Updates vector in pgvector
4. Logs to history

---

### `deleteMemory(memoryId)`

Delete memory by ID.

**Signature:**
```typescript
function deleteMemory(memoryId: string): Promise<void>
```

**Usage:**
```typescript
await deleteMemory('mem-id-123');
```

---

## Extractor Module (`extractor.ts`)

Simplified delegation to mem0.add().

### `extractAndStore(params)`

Extract and store information from message.

**Signature:**
```typescript
function extractAndStore(params: {
  userId: string;
  groupId: string;
  message: string;
  senderName?: string;
  groupName?: string;
}): Promise<void>
```

**Implementation:**
```typescript
export async function extractAndStore(params) {
  await addMemory({
    userId,
    groupId,
    message,
    senderName,
    groupName,
  });
}
```

**What It Does:**
- Simple wrapper around `addMemory()`
- mem0 handles extraction internally
- No custom extraction logic needed

**Usage:**
```typescript
import { extractAndStore } from '@travis/core';

await extractAndStore({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Họp team vào lúc 2 giờ chiều thứ 3 để review sprint',
  senderName: 'Manager',
  groupName: 'Dev Team',
});
```

---

## Retriever Module (`retriever.ts`)

Wrapper for mem0 search operations.

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

**Implementation:**
```typescript
export async function searchRelevantMemories(params) {
  return await searchMemories(params);
}
```

**Usage:**
```typescript
const memories = await searchRelevantMemories({
  userId: 'user-123',
  groupId: 'group-456',
  query: 'upcoming deadlines',
  limit: 5,
});
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

**Usage:**
```typescript
const formatted = formatMemoriesForPrompt(memories);
console.log(formatted);
// Output:
// 1. Deploy hệ thống vào thứ 6 tuần này
// 2. Họp team lúc 2 giờ chiều thứ 3
// 3. Code review scheduled for tomorrow
```

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

**Purpose:**
- Stores raw messages for audit/debugging
- Does NOT handle memory extraction (mem0 does that)

**Usage:**
```typescript
import { storeMessage } from '@travis/core';

await storeMessage({
  platformMessageId: 'telegram-msg-123',
  groupId: 'group-uuid',
  userId: 'user-uuid',
  content: 'Message content here',
  replyToMessageId: 'msg-456',
  threadId: 'thread-789',
});
```

---

## Vietnamese Language Support

**mem0 Configuration:**
- LLM: Gemini 2.5-flash-lite (multilingual, Vietnamese-capable)
- Extraction: Handles Vietnamese text natively
- Embeddings: embedding-001 supports Vietnamese
- Search: Semantic search works with Vietnamese queries

**Examples:**
```typescript
// Vietnamese input
await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Cần deploy hệ thống vào thứ 6 tuần này',
});

// Vietnamese search
const results = await searchMemories({
  userId: 'user-123',
  groupId: 'group-456',
  query: 'khi nào deploy',
  limit: 5,
});
```

---

## Deduplication

**Automatic Deduplication:**
- mem0 handles deduplication internally
- Checks similarity against existing memories
- Merges or updates if duplicate detected
- No manual deduplication logic needed

**Example:**
```typescript
// Adding same memory twice
await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Deploy production environment on Friday',
});

await addMemory({
  userId: 'user-123',
  groupId: 'group-456',
  message: 'Deploy production environment on Friday',
});

// mem0 automatically deduplicates → only 1 memory stored
```

---

## Error Handling

### Common Patterns

**Empty Results:**
```typescript
const results = await searchMemories({
  userId: 'non-existent',
  groupId: 'non-existent',
  query: 'anything',
});

// Returns: [] (empty array)
```

**Type Safety:**
```typescript
// Runtime type guard
const results = await searchMemories(params);
// results is ALWAYS MemoryItem[] (never undefined/null)
```

**mem0 API Errors:**
- Throws on API failures
- Handle with try/catch
- Log errors to console.error

---

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| addMemory | 200-500ms | LLM extraction + embedding + storage |
| searchMemories | 150-300ms | Embedding + vector search |
| getAllMemories | 50-150ms | Direct database query |
| updateMemory | 200-400ms | Re-embedding + update |
| deleteMemory | 50-100ms | Database delete |

**Scalability:**
- pgvector supports HNSW indexing (future optimization)
- mem0 handles connection pooling
- SQLite history has no network overhead

---

## Integration Example

Complete workflow:

```typescript
import {
  extractAndStore,
  searchRelevantMemories,
  formatMemoriesForPrompt,
  storeMessage,
} from '@travis/core';

async function processMessage(
  message: string,
  context: { groupId: string; userId: string; messageId: string }
) {
  // 1. Store message for audit
  await storeMessage({
    platformMessageId: context.messageId,
    groupId: context.groupId,
    userId: context.userId,
    content: message,
  });

  // 2. Extract and store with mem0
  await extractAndStore({
    userId: context.userId,
    groupId: context.groupId,
    message,
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

## Environment Variables

Required in `.env`:

```bash
# Gemini API
GEMINI_API_KEY=xxx

# PostgreSQL (for mem0 pgvector)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=xxx
DB_NAME=luxbot

# Database URL (for Drizzle ORM)
DATABASE_URL=postgresql://user:pass@host/db
```

---

## Database Tables

**mem0 Manages:**
- `memories` table (created by mem0)
- Vector embeddings (1536D)
- Deduplication metadata

**Drizzle ORM Manages:**
- `groups` - Platform groups
- `users` - Platform users
- `messages` - Message audit trail
- `queryLogs` - Analytics

**REMOVED (Phase 03 Refactor):**
- `extractedInfo` table (replaced by mem0)
- `memories` table (replaced by mem0's own table)
- All custom vector search operations

---

## Migration from Custom Implementation

**Before (Custom):**
- embeddings.ts (manual Gemini API calls)
- extractor.ts (custom extraction with confidence filtering)
- storage.ts (manual vector storage)
- retriever.ts (custom similarity search)
- ~500 lines of code

**After (mem0):**
- mem0-client.ts (Memory class config)
- extractor.ts (delegation to mem0.add)
- storage.ts (message audit only)
- retriever.ts (wrapper for mem0.search)
- ~150 lines of code

**Benefits:**
- 70% code reduction
- Automatic deduplication
- Better extraction quality
- Maintained data privacy (self-hosted)
- No vendor lock-in

---

*Memory Layer API for Phase 03: mem0 OSS self-hosted with Gemini 2.5-flash-lite LLM + embedding-001 (1536D) + PostgreSQL + pgvector.*
