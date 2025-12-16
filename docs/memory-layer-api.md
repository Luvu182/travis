# LuxBot - Memory Layer API Documentation

**Last Updated:** 2025-12-16
**Phase:** 03 - Memory Layer Implementation
**Type:** Memory Processing API Reference

## Overview

Complete API reference for memory layer components (`@luxbot/core/memory`). Handles embeddings generation, information extraction, storage, and semantic retrieval with Vietnamese language optimization.

## Embeddings Module

Generates and processes vector embeddings using Google Gemini text-embedding-004 (768-dimensional).

### `embedText(text)`

Generate embedding for single text.

**Signature:**
```typescript
function embedText(text: string): Promise<number[]>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to embed (non-empty) |

**Returns:**
- Array of 768 numbers representing semantic meaning

**Usage:**
```typescript
import { embedText } from '@luxbot/core';

const embedding = await embedText('Important deadline for Q1 planning');
console.log(embedding.length); // 768
```

**Error Handling:**
- Throws on empty text
- Throws on Gemini API failure
- Logs error details to console.error

---

### `embedBatch(texts)`

Generate embeddings for multiple texts in parallel.

**Signature:**
```typescript
function embedBatch(texts: string[]): Promise<number[][]>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `texts` | string[] | Yes | Array of texts to embed |

**Returns:**
- Array of 768-dimensional embedding arrays (same length as input)

**Behavior:**
- Filters empty texts automatically
- Parallelizes requests for efficiency
- Returns results in same order as input

**Usage:**
```typescript
const messages = [
  'Schedule team meeting',
  'Update project status',
  'Review code changes'
];

const embeddings = await embedBatch(messages);
console.log(embeddings.length); // 3
console.log(embeddings[0].length); // 768
```

**Performance:**
- Parallel requests via Promise.all
- Rate-limited by Gemini API

---

### `cosineSimilarity(a, b)`

Calculate cosine similarity between two embeddings.

**Signature:**
```typescript
function cosineSimilarity(a: number[], b: number[]): number
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `a` | number[] | Yes | First 768D embedding |
| `b` | number[] | Yes | Second 768D embedding |

**Returns:**
- Similarity score between 0.0 (dissimilar) and 1.0 (identical)

**Usage:**
```typescript
const similarity = cosineSimilarity(embedding1, embedding2);
console.log(`Similarity: ${(similarity * 100).toFixed(1)}%`);
// Output: Similarity: 87.3%
```

**Error Handling:**
- Throws if dimension mismatch
- Returns 0 if denominator is zero

---

## Extraction Module

Extracts structured information from messages using Gemini 2.0-flash-exp with Vietnamese language optimization.

### Schema: `ExtractedInfo`

```typescript
interface ExtractedInfo {
  items: ExtractedItem[];
}

interface ExtractedItem {
  type: 'task' | 'decision' | 'deadline' | 'important' | 'general';
  content: string;
  summary?: string;
  assignee?: string;
  dueDate?: string;     // ISO format
  confidence: number;    // 0.0-1.0
}
```

---

### `extractInfo(message, context?)`

Extract important information from single message.

**Signature:**
```typescript
function extractInfo(
  message: string,
  context?: {
    senderName?: string;
    groupName?: string;
    recentMessages?: string[];
  }
): Promise<ExtractedItem[]>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | Message content to extract from |
| `context` | object | No | Optional context for extraction |
| `context.senderName` | string | No | Name of message sender |
| `context.groupName` | string | No | Name of group/chat |
| `context.recentMessages` | string[] | No | Previous 2-5 messages for context |

**Returns:**
- Array of ExtractedItem with confidence ≥0.7
- Empty array if no extractable info

**Usage:**
```typescript
import { extractInfo } from '@luxbot/core';

const items = await extractInfo(
  'Bạn nào hoàn thành file report đến ngày 25/12?',
  {
    senderName: 'Quản lý dự án',
    groupName: 'Dev Team',
    recentMessages: ['Bắt đầu Q1 planning session', 'Cần chuẩn bị slide']
  }
);

// Returns:
// [
//   {
//     type: 'deadline',
//     content: 'Hoàn thành file report đến ngày 25/12',
//     summary: 'Report deadline 25/12',
//     confidence: 0.92
//   }
// ]
```

**Classification Logic:**
- **task:** Contains verbs + assignee (e.g., "Hoàn thành...", "Chuẩn bị...")
- **decision:** Group decisions/agreements (e.g., "Quyết định...", "Thống nhất...")
- **deadline:** Time-bound items (e.g., "Hạn...", "Ngày...", "Tối đa...")
- **important:** Critical info without time/assignee
- **general:** Other information worth noting

**Confidence Filtering:**
- Only returns items with confidence ≥0.7
- Excluded items logged to console
- Empty result on extraction failure

---

### `extractBatch(messages)`

Batch extract information from multiple messages.

**Signature:**
```typescript
function extractBatch(
  messages: Array<{
    content: string;
    context?: {
      senderName?: string;
      groupName?: string;
      recentMessages?: string[];
    };
  }>
): Promise<ExtractedItem[][]>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messages` | Array | Yes | Array of message + context pairs |

**Returns:**
- Array of ExtractedItem arrays (same length as input)
- Each element corresponds to one message

**Usage:**
```typescript
const results = await extractBatch([
  {
    content: 'Demo sản phẩm vào thứ 5',
    context: { senderName: 'Admin', groupName: 'Dev' }
  },
  {
    content: 'Giám đốc phê duyệt budget Q2',
    context: { senderName: 'CFO', groupName: 'Leadership' }
  }
]);

console.log(results.length); // 2
console.log(results[0][0]?.type); // 'deadline' or 'task'
```

**Performance:**
- Parallel processing via Promise.all
- Returns immediately on batch extraction failure

---

### `normalizeDueDate(dateStr?)`

Validate and normalize date string to ISO format.

**Signature:**
```typescript
function normalizeDueDate(dateStr: string | undefined): string | null
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateStr` | string | No | Date string in any format |

**Returns:**
- ISO 8601 string if valid (e.g., '2025-12-25T00:00:00.000Z')
- `null` if invalid or undefined

**Usage:**
```typescript
normalizeDueDate('2025-12-25');           // '2025-12-25T00:00:00.000Z'
normalizeDueDate('Dec 25, 2025');         // '2025-12-25T00:00:00.000Z'
normalizeDueDate('25/12/2025');           // '2025-12-25T00:00:00.000Z'
normalizeDueDate('invalid');              // null
normalizeDueDate(undefined);              // null
```

**Formats Accepted:**
- ISO 8601: '2025-12-25', '2025-12-25T10:30:00'
- US: '12/25/2025', 'Dec 25, 2025'
- EU: '25.12.2025'
- Timestamps: Unix timestamps

---

## Storage Module

Stores extracted information and memories with automatic embedding generation.

### `storeExtractedInfo(params)`

Save extracted information to database with embeddings.

**Signature:**
```typescript
function storeExtractedInfo(params: {
  messageId: string;
  groupId: string;
  items: ExtractedItem[];
}): Promise<void>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | UUID | Yes | Source message UUID |
| `groupId` | UUID | Yes | Group UUID |
| `items` | ExtractedItem[] | Yes | Extracted items with confidence ≥0.7 |

**Process:**
1. For each item:
   - Generate 768D embedding from content
   - Normalize due date to ISO format
   - Store with metadata (confidence, assignee)
   - Save to extractedInfo table

**Usage:**
```typescript
import { storeExtractedInfo, extractInfo } from '@luxbot/core';

const items = await extractInfo(message, context);

await storeExtractedInfo({
  messageId: 'msg-uuid-123',
  groupId: 'group-uuid-456',
  items
});
```

**Error Handling:**
- Returns early if items array empty
- Throws on embedding generation failure
- Logs error to console.error

---

### `storeMemory(params)`

Save long-term memory (fact, preference, context).

**Signature:**
```typescript
function storeMemory(params: {
  groupId: string;
  userId?: string;
  content: string;
  memoryType: 'fact' | 'event' | 'preference' | 'context';
  metadata?: Record<string, unknown>;
}): Promise<void>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `groupId` | UUID | Yes | Group UUID for scoping |
| `userId` | UUID | No | User UUID for user-scoped memories |
| `content` | string | Yes | Memory content |
| `memoryType` | enum | Yes | Type of memory |
| `metadata` | object | No | Additional context |

**Memory Types:**
- **fact:** Static information (e.g., "Team meets every Monday 10 AM")
- **event:** Historical events (e.g., "Product launched Dec 15")
- **preference:** User/group preferences (e.g., "Prefers async updates")
- **context:** Operational context (e.g., "Currently working on V2.0")

**Usage:**
```typescript
import { storeMemory } from '@luxbot/core';

await storeMemory({
  groupId: 'group-uuid',
  userId: 'user-uuid',
  content: 'Quang prefers morning meetings at 9 AM Vietnamese time',
  memoryType: 'preference',
  metadata: { timezone: 'Vietnam/Ho_Chi_Minh' }
});
```

**Process:**
1. Validate non-empty content
2. Generate 768D embedding from content
3. Store with metadata in memories table

---

### `storeBatch(batch)`

Batch store extracted information.

**Signature:**
```typescript
function storeBatch(
  batch: Array<{
    messageId: string;
    groupId: string;
    items: ExtractedItem[];
  }>
): Promise<void>
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batch` | Array | Yes | Array of storage params |

**Behavior:**
- Sequential processing (not parallel) to avoid overwhelming DB
- Stops on first error

**Usage:**
```typescript
const batch = extractionResults.map((items, idx) => ({
  messageId: messageIds[idx],
  groupId: 'group-uuid',
  items
}));

await storeBatch(batch);
```

---

## Retrieval Module

Retrieves stored information using semantic search with pgvector.

### Interface: `MemorySearchResult`

```typescript
interface MemorySearchResult {
  id: string;
  type: string;
  content: string;
  summary?: string;
  dueDate?: Date;
  similarity: number;  // 0.0-1.0
}
```

---

### `searchExtractedInfo(query, options?)`

Semantic search across extracted information.

**Signature:**
```typescript
function searchExtractedInfo(
  query: string,
  options: {
    groupId?: string;
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;      // Default: 10
    minSimilarity?: number; // Default: 0.5
  } = {}
): Promise<MemorySearchResult[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | - | Search query text |
| `options.groupId` | UUID | undefined | Filter by group |
| `options.type` | enum | undefined | Filter by info type |
| `options.limit` | number | 10 | Max results |
| `options.minSimilarity` | number | 0.5 | Similarity threshold (0.0-1.0) |

**Returns:**
- Array of MemorySearchResult sorted by similarity (descending)
- Empty array if no results above minSimilarity

**Process:**
1. Generate 768D embedding from query
2. Search extractedInfo table with cosine similarity
3. Apply type/group filters if specified
4. Return top K results

**Usage:**
```typescript
import { searchExtractedInfo } from '@luxbot/core';

const results = await searchExtractedInfo(
  'khi nào deadline sản phẩm V2?',
  {
    groupId: 'group-uuid',
    type: 'deadline',
    limit: 5,
    minSimilarity: 0.6
  }
);

results.forEach(r => {
  console.log(`[${(r.similarity * 100).toFixed(0)}%] ${r.summary || r.content}`);
});
// Output:
// [89%] Product V2 deadline
// [76%] V2 features timeline
```

**Query Performance:**
- Vector embedding: ~50-100ms
- Cosine search: ~10-100ms (scales with data)
- Total: ~100-200ms

---

### `searchMemory(query, options?)`

Semantic search across stored memories.

**Signature:**
```typescript
function searchMemory(
  query: string,
  options: {
    groupId?: string;
    limit?: number;  // Default: 10
  } = {}
): Promise<Array<{
  id: string;
  content: string;
  type: string;
  similarity: number;
}>>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | - | Search query text |
| `options.groupId` | UUID | undefined | Filter by group |
| `options.limit` | number | 10 | Max results |

**Returns:**
- Array of memory results with similarity scores

**Usage:**
```typescript
const memories = await searchMemory(
  'team preferences and meeting times',
  { groupId: 'group-uuid', limit: 10 }
);

// Returns memories about team schedules, preferences, etc.
```

---

### `getRecentExtractedInfo(groupId, limit?)`

Retrieve most recent extracted information.

**Signature:**
```typescript
function getRecentExtractedInfo(
  groupId: string,
  limit?: number  // Default: 5
): Promise<MemorySearchResult[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `groupId` | UUID | - | Group UUID |
| `limit` | number | 5 | Number of recent items |

**Returns:**
- Array of recent MemorySearchResult (similarity = 1.0)

**Usage:**
```typescript
const recent = await getRecentExtractedInfo('group-uuid', 10);

recent.forEach(r => {
  console.log(`[${r.type}] ${r.summary}`);
});
```

---

### `searchTasksByAssignee(groupId, assignee, options?)`

Search for tasks assigned to specific person.

**Signature:**
```typescript
function searchTasksByAssignee(
  groupId: string,
  assignee: string,
  options?: {
    limit?: number;
    minSimilarity?: number;
  }
): Promise<MemorySearchResult[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `groupId` | UUID | - | Group UUID |
| `assignee` | string | - | Assignee name |
| `options.limit` | number | 10 | Max results |
| `options.minSimilarity` | number | 0.5 | Similarity threshold |

**Behavior:**
- Internally searches for "nhiệm vụ của {assignee}" (Vietnamese)
- Filters by type='task'

**Usage:**
```typescript
const quangTasks = await searchTasksByAssignee(
  'group-uuid',
  'Quang'
);

console.log(`Tasks for Quang: ${quangTasks.length}`);
```

---

### `searchUpcomingDeadlines(groupId, options?)`

Search for upcoming deadline items.

**Signature:**
```typescript
function searchUpcomingDeadlines(
  groupId: string,
  options?: {
    limit?: number;
    minSimilarity?: number;
  }
): Promise<MemorySearchResult[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `groupId` | UUID | - | Group UUID |
| `options.limit` | number | 10 | Max results |
| `options.minSimilarity` | number | 0.5 | Similarity threshold |

**Behavior:**
- Searches for "deadline thời hạn sắp tới" (Vietnamese)
- Filters by type='deadline'

**Usage:**
```typescript
const deadlines = await searchUpcomingDeadlines('group-uuid');

deadlines.forEach(d => {
  console.log(`Due: ${d.dueDate?.toLocaleDateString()} - ${d.summary}`);
});
```

---

### `multiSearch(queries, options?)`

Multi-query search with deduplication.

**Signature:**
```typescript
function multiSearch(
  queries: string[],
  options?: {
    groupId?: string;
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;
    minSimilarity?: number;
  }
): Promise<MemorySearchResult[]>
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `queries` | string[] | - | Array of search queries |
| `options.groupId` | UUID | undefined | Filter by group |
| `options.type` | enum | undefined | Filter by type |
| `options.limit` | number | 10 | Final result limit |
| `options.minSimilarity` | number | 0.5 | Similarity threshold |

**Deduplication Strategy:**
- Searches all queries in parallel
- Combines results by ID
- Keeps highest similarity score per ID
- Sorts final results by similarity

**Usage:**
```typescript
const results = await multiSearch(
  [
    'deadline sản phẩm',
    'thời hạn hoàn thành',
    'khi nào xong'
  ],
  { groupId: 'group-uuid', type: 'deadline', limit: 5 }
);

// Returns top 5 unique deadline results across all queries
```

**Performance:**
- 3 parallel searches + dedup: ~300-600ms
- Better coverage than single query

---

## Error Handling

### Common Errors

```typescript
// Empty text
try {
  await embedText('');
} catch (error) {
  // Error: Cannot embed empty text
}

// Invalid extraction input
try {
  await extractInfo('', {});
} catch (error) {
  // Returns [] (empty array on failure)
}

// Storage failure
try {
  await storeExtractedInfo({
    messageId: 'bad-id',
    groupId: 'bad-id',
    items: []
  });
} catch (error) {
  // Error: Storage failed: [detailed error]
}
```

### Best Practices

1. **Always validate before storage:**
```typescript
const items = await extractInfo(message);
if (items.length > 0) {
  await storeExtractedInfo({ messageId, groupId, items });
}
```

2. **Check search results:**
```typescript
const results = await searchExtractedInfo(query, { groupId });
if (results.length === 0) {
  console.log('No relevant information found');
}
```

3. **Handle empty extractions gracefully:**
```typescript
const items = await extractInfo(message) || [];
// items is always an array
```

---

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| embedText | 50-150ms | Gemini API roundtrip |
| embedBatch (10) | 100-300ms | Parallel processing |
| extractInfo | 200-500ms | LLM + JSON parsing |
| extractBatch (5) | 300-1000ms | Parallel LLM calls |
| searchExtractedInfo | 150-300ms | Embedding + vector search |
| searchMemory | 150-300ms | Vector search on memories |
| multiSearch (3 queries) | 300-600ms | Parallel + dedup |

---

## Integration Example

Complete workflow for message processing:

```typescript
import {
  extractInfo,
  storeExtractedInfo,
  searchMemory,
  embedText
} from '@luxbot/core';

async function processMessage(
  message: string,
  context: { groupId: string; messageId: string; senderName: string }
) {
  // 1. Extract information
  const items = await extractInfo(message, {
    senderName: context.senderName,
    groupName: 'Engineering'
  });

  // 2. Store if relevant
  if (items.length > 0) {
    await storeExtractedInfo({
      messageId: context.messageId,
      groupId: context.groupId,
      items
    });
  }

  // 3. Search for context
  const contextMemories = await searchMemory(message, {
    groupId: context.groupId,
    limit: 5
  });

  // 4. Prepare response context
  const responseContext = {
    extracted: items,
    memories: contextMemories,
    relevantInfo: items.length > 0
  };

  return responseContext;
}
```

---

*Memory Layer API for Phase 03: Information extraction, storage, and semantic retrieval.*
