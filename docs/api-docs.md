# J.A.R.V.I.S - Core API Documentation

**Last Updated:** 2025-12-16
**Phase:** 03 - Memory Layer Implementation
**Type:** Memory & Database Operations API Reference

## Overview

Complete API reference for:
1. **Memory Layer** (`@jarvis/core/memory`) - Embeddings, extraction, storage, retrieval
2. **Database Operations** (`@jarvis/db`) - CRUD operations with vector search

See separate document: [memory-layer-api.md](./memory-layer-api.md) for detailed memory API reference.

This document focuses on database operations. For memory layer details, see the dedicated memory API doc.

## Import

```typescript
import {
  // Client
  db,
  checkDatabaseConnection,
  closeDatabaseConnection,

  // Types
  Group, NewGroup,
  User, NewUser,
  Message, NewMessage,
  ExtractedInfo, NewExtractedInfo,
  Memory, NewMemory,
  QueryLog, NewQueryLog,

  // Operations
  upsertGroup,
  getGroupByPlatformId,
  upsertUser,
  getUserByPlatformId,
  saveMessage,
  getRecentMessages,
  saveExtractedInfo,
  getExtractedInfoByGroup,
  saveMemory,
  getRecentMemories,
  saveQueryLog,
  searchByVector,
  searchMemories,
  getGroupStats,
} from '@jarvis/db';
```

## Client Operations

### `checkDatabaseConnection()`

Verify database connectivity and health.

**Signature:**
```typescript
function checkDatabaseConnection(): Promise<boolean>
```

**Returns:**
- `true` if connection successful
- `false` if connection failed

**Usage:**
```typescript
const isHealthy = await checkDatabaseConnection();
if (!isHealthy) {
  console.error('Database connection failed');
  process.exit(1);
}
```

**Error Handling:**
- Errors are logged to console.error
- Function never throws, returns boolean

---

### `closeDatabaseConnection()`

Gracefully close database connection (for shutdown).

**Signature:**
```typescript
function closeDatabaseConnection(): Promise<void>
```

**Usage:**
```typescript
process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
```

**Notes:**
- Call during application shutdown
- Safe to call multiple times
- Clears lazy-loaded connection state

---

## Group Operations

### `upsertGroup(data)`

Insert new group or update existing by platform + platformGroupId.

**Signature:**
```typescript
function upsertGroup(data: {
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  name?: string;
  metadata?: Record<string, unknown>;
}): Promise<Group>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | 'telegram' \| 'lark' | Yes | Platform identifier |
| `platformGroupId` | string | Yes | External group ID from platform |
| `name` | string | No | Display name (optional) |
| `metadata` | object | No | Platform-specific data (e.g., group settings) |

**Returns:**
```typescript
type Group = {
  id: string;                    // UUID
  platform: 'telegram' | 'lark';
  platformGroupId: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Usage:**
```typescript
const group = await upsertGroup({
  platform: 'telegram',
  platformGroupId: '-1001234567890',
  name: 'Engineering Team',
  metadata: { isPrivate: true, memberCount: 15 }
});

console.log(group.id); // UUID of group
```

**Behavior:**
- If group exists (by platform + platformGroupId): updates non-conflicting fields
- If group new: creates with provided data
- Uses COALESCE to preserve existing values on update

---

### `getGroupByPlatformId(platform, platformGroupId)`

Retrieve group by platform identifier.

**Signature:**
```typescript
function getGroupByPlatformId(
  platform: 'telegram' | 'lark',
  platformGroupId: string
): Promise<Group | null>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | 'telegram' \| 'lark' | Yes | Platform identifier |
| `platformGroupId` | string | Yes | External group ID |

**Returns:**
- `Group` object if found
- `null` if not found

**Usage:**
```typescript
const group = await getGroupByPlatformId('telegram', '-1001234567890');

if (!group) {
  console.log('Group not found, create with upsertGroup()');
} else {
  console.log(`Group name: ${group.name}`);
}
```

**Performance:**
- Uses unique index `idx_groups_platform_group`
- O(log n) lookup time

---

## User Operations

### `upsertUser(data)`

Insert new user or update existing by platform + platformUserId.

**Signature:**
```typescript
function upsertUser(data: {
  platform: 'telegram' | 'lark';
  platformUserId: string;
  username?: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
}): Promise<User>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | 'telegram' \| 'lark' | Yes | Platform identifier |
| `platformUserId` | string | Yes | External user ID from platform |
| `username` | string | No | Username/handle (optional) |
| `displayName` | string | No | Display name (optional) |
| `metadata` | object | No | Platform-specific user data |

**Returns:**
```typescript
type User = {
  id: string;                    // UUID
  platform: 'telegram' | 'lark';
  platformUserId: string;
  username?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Usage:**
```typescript
const user = await upsertUser({
  platform: 'telegram',
  platformUserId: '123456789',
  username: 'john_doe',
  displayName: 'John Doe',
  metadata: { isBot: false, languageCode: 'vi' }
});

console.log(user.id); // UUID of user
```

**Behavior:**
- Updates displayName and username if provided
- Merges metadata objects on update
- Sets updatedAt to current time

---

### `getUserByPlatformId(platform, platformUserId)`

Retrieve user by platform identifier.

**Signature:**
```typescript
function getUserByPlatformId(
  platform: 'telegram' | 'lark',
  platformUserId: string
): Promise<User | null>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | 'telegram' \| 'lark' | Yes | Platform identifier |
| `platformUserId` | string | Yes | External user ID |

**Returns:**
- `User` object if found
- `null` if not found

**Usage:**
```typescript
const user = await getUserByPlatformId('telegram', '123456789');

if (!user) {
  // Create new user
  const newUser = await upsertUser({
    platform: 'telegram',
    platformUserId: '123456789',
    displayName: 'Jane Doe'
  });
} else {
  console.log(`User: ${user.displayName}`);
}
```

**Performance:**
- Uses unique index `idx_users_platform_user`
- O(log n) lookup time

---

## Message Operations

### `saveMessage(data)`

Save message to audit trail with duplicate prevention.

**Signature:**
```typescript
function saveMessage(data: {
  groupId: string;              // UUID
  userId: string;               // UUID
  platformMessageId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
  metadata?: Record<string, unknown>;
}): Promise<Message | null>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `groupId` | UUID | Yes | Group UUID (from upsertGroup) |
| `userId` | UUID | Yes | User UUID (from upsertUser) |
| `platformMessageId` | string | Yes | External message ID |
| `content` | string | Yes | Message text content |
| `replyToMessageId` | string | No | Message being replied to |
| `threadId` | string | No | Thread/conversation ID |
| `metadata` | object | No | Platform metadata |

**Returns:**
```typescript
type Message = {
  id: string;                    // UUID
  groupId: string;
  userId: string;
  platformMessageId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Usage:**
```typescript
const message = await saveMessage({
  groupId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  userId: 'f1e2d3c4-b5a6-7890-dcba-ef1234567890',
  platformMessageId: 'tg_msg_12345',
  content: 'We need to finish the project by Friday',
  metadata: { edited: false }
});

if (!message) {
  console.log('Duplicate message, skipped');
}
```

**Behavior:**
- Returns `null` if duplicate detected (onConflictDoNothing)
- Uses unique index on (groupId, platformMessageId)
- Never overwrites existing messages

---

### `getRecentMessages(groupId, limit?)`

Retrieve recent messages from a group.

**Signature:**
```typescript
function getRecentMessages(
  groupId: string,              // UUID
  limit?: number                // Default: 5
): Promise<Message[]>
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `groupId` | UUID | Yes | - | Group UUID |
| `limit` | number | No | 5 | Max results to return |

**Returns:**
```typescript
type Message = {
  id: string;
  platformMessageId: string;
  content: string;
  senderName?: string;          // User displayName
  createdAt: Date;
}
```

**Usage:**
```typescript
const recentMessages = await getRecentMessages(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  10
);

recentMessages.forEach(msg => {
  console.log(`${msg.senderName}: ${msg.content}`);
});
```

**Performance:**
- Uses index on (groupId, createdAt)
- Orders by createdAt DESC (newest first)
- O(log n + k) where k = limit

---

## Extracted Info Operations

### `saveExtractedInfo(data)`

Save extracted structured information (tasks, decisions, deadlines).

**Signature:**
```typescript
function saveExtractedInfo(data: NewExtractedInfo): Promise<ExtractedInfo>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | UUID | No | Source message UUID |
| `groupId` | UUID | Yes | Group UUID |
| `infoType` | enum | Yes | task \| decision \| deadline \| important \| general |
| `content` | string | Yes | Full extracted content |
| `summary` | string | No | Short summary (< 200 chars) |
| `assigneeUserId` | UUID | No | Assigned user UUID |
| `dueDate` | Date | No | Due date/deadline |
| `status` | string | No | active \| completed \| archived (default: active) |
| `embedding` | number[] | No | 1536D vector from Gemini |
| `metadata` | object | No | Additional context |

**Returns:**
```typescript
type ExtractedInfo = {
  id: string;
  messageId?: string;
  groupId: string;
  infoType: 'task' | 'decision' | 'deadline' | 'important' | 'general';
  content: string;
  summary?: string;
  assigneeUserId?: string;
  dueDate?: Date;
  status: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Usage:**
```typescript
const taskEmbedding = await generateEmbedding('implement feature X');

const extracted = await saveExtractedInfo({
  messageId: 'msg-uuid',
  groupId: 'group-uuid',
  infoType: 'task',
  content: 'Implement feature X for dashboard',
  summary: 'Dashboard feature X',
  assigneeUserId: 'user-uuid',
  dueDate: new Date('2025-12-25'),
  status: 'active',
  embedding: taskEmbedding,
  metadata: { priority: 'high' }
});

console.log(extracted.id);
```

**Best Practices:**
- Always provide `embedding` for vector search capability
- Use appropriate `infoType` for filtering
- Keep `summary` under 200 characters
- Set `status` to 'active' for new items

---

### `getExtractedInfoByGroup(groupId, options?)`

Retrieve extracted information filtered by group and type.

**Signature:**
```typescript
function getExtractedInfoByGroup(
  groupId: string,              // UUID
  options?: {
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    status?: string;
    limit?: number;              // Default: 20
  }
): Promise<ExtractedInfo[]>
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `groupId` | UUID | Yes | - | Group UUID |
| `type` | enum | No | - | Filter by info type |
| `status` | string | No | - | Filter by status |
| `limit` | number | No | 20 | Max results |

**Returns:**
- Array of ExtractedInfo objects ordered by createdAt DESC

**Usage:**
```typescript
// Get all active tasks
const tasks = await getExtractedInfoByGroup(
  'group-uuid',
  {
    type: 'task',
    status: 'active',
    limit: 50
  }
);

console.log(`Found ${tasks.length} active tasks`);

// Get all decisions
const decisions = await getExtractedInfoByGroup(
  'group-uuid',
  { type: 'decision' }
);
```

**Performance:**
- Uses composite index on (groupId, createdAt)
- Additional indexes on (infoType, status)
- O(log n + k) complexity

---

## Memory Operations

### `saveMemory(data)`

Store long-term memory (facts, preferences, context).

**Signature:**
```typescript
function saveMemory(data: NewMemory): Promise<Memory>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | mem0 user context (e.g., 'telegram:123') |
| `agentId` | string | No | mem0 agent context |
| `groupId` | UUID | No | Group UUID for group-scoped memory |
| `content` | string | Yes | Memory content |
| `embedding` | number[] | No | 1536D vector for search |
| `memoryType` | string | No | fact \| preference \| context |
| `metadata` | object | No | Additional data |

**Returns:**
```typescript
type Memory = {
  id: string;
  userId?: string;
  agentId?: string;
  groupId?: string;
  content: string;
  embedding?: number[];
  memoryType?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}
```

**Usage:**
```typescript
const memory = await saveMemory({
  groupId: 'group-uuid',
  userId: 'telegram:123456789',
  content: 'John prefers morning standup at 9 AM',
  memoryType: 'preference',
  embedding: await generateEmbedding('morning standup time preference'),
  metadata: { source: 'message-extraction' }
});

console.log(`Memory saved: ${memory.id}`);
```

**Best Practices:**
- Provide `embedding` for semantic search
- Categorize with `memoryType`
- Include `userId` for user-specific memories
- Include `groupId` for group context

---

### `getRecentMemories(groupId, limit?)`

Retrieve recent memories for a group.

**Signature:**
```typescript
function getRecentMemories(
  groupId: string,              // UUID
  limit?: number                // Default: 10
): Promise<Memory[]>
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `groupId` | UUID | Yes | - | Group UUID |
| `limit` | number | No | 10 | Max results |

**Returns:**
- Array of Memory objects ordered by createdAt DESC

**Usage:**
```typescript
const memories = await getRecentMemories('group-uuid', 20);

memories.forEach(mem => {
  console.log(`[${mem.memoryType}] ${mem.content}`);
});
```

**Performance:**
- Uses index on (groupId, createdAt)
- O(log n + k) lookup

---

## Query Log Operations

### `saveQueryLog(data)`

Log user queries for analytics and debugging.

**Signature:**
```typescript
function saveQueryLog(data: NewQueryLog): Promise<QueryLog>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `groupId` | UUID | No | Group UUID |
| `userId` | UUID | No | User UUID |
| `queryText` | string | Yes | User question/prompt |
| `responseText` | string | No | Bot response |
| `memoriesUsed` | UUID[] | No | Memory IDs referenced |
| `latencyMs` | number | No | Response time in milliseconds |

**Returns:**
```typescript
type QueryLog = {
  id: string;
  groupId?: string;
  userId?: string;
  queryText: string;
  responseText?: string;
  memoriesUsed?: string[];
  latencyMs?: number;
  createdAt: Date;
}
```

**Usage:**
```typescript
const startTime = Date.now();
const response = await generateResponse(query);
const latencyMs = Date.now() - startTime;

await saveQueryLog({
  groupId: 'group-uuid',
  userId: 'user-uuid',
  queryText: query,
  responseText: response,
  memoriesUsed: [mem1.id, mem2.id],
  latencyMs
});
```

---

## Vector Search Operations

### `searchByVector(embedding, options?)`

Semantic search across extracted information using cosine similarity.

**Signature:**
```typescript
function searchByVector(
  embedding: number[],          // 1536D array
  options?: {
    groupId?: string;           // UUID
    type?: 'task' | 'decision' | 'deadline' | 'important' | 'general';
    limit?: number;              // Default: 10
    minSimilarity?: number;       // Default: 0.5 (0.0-1.0)
  }
): Promise<SearchResult[]>
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `embedding` | number[] | Yes | - | 1536-dimensional vector |
| `groupId` | UUID | No | - | Filter by group (null = all) |
| `type` | enum | No | - | Filter by info type |
| `limit` | number | No | 10 | Max results |
| `minSimilarity` | number | No | 0.5 | Similarity threshold (0.0-1.0) |

**Returns:**
```typescript
type SearchResult = {
  id: string;
  type: InfoType;
  content: string;
  summary?: string;
  dueDate?: Date;
  similarity: number;             // 0.0-1.0
}
```

**Usage:**
```typescript
const queryEmbedding = await generateEmbedding('when is project deadline?');

const results = await searchByVector(queryEmbedding, {
  groupId: 'group-uuid',
  type: 'deadline',
  limit: 5,
  minSimilarity: 0.6
});

results.forEach(result => {
  console.log(`[${result.similarity.toFixed(2)}] ${result.summary}`);
});
```

**Embedding Validation:**
- Must be array of exactly 1536 numbers
- All values must be valid numbers (not NaN)
- Throws error on invalid input

**Returns empty array if:**
- No results exceed minSimilarity threshold
- No records have embeddings in selected group/type

**Performance:**
- Sequential scan (O(n)) currently
- Future HNSW index: O(log n)
- Latency: 10-100ms depending on table size

---

### `searchMemories(embedding, options?)`

Semantic search across stored memories using cosine similarity.

**Signature:**
```typescript
function searchMemories(
  embedding: number[],          // 1536D array
  options?: {
    groupId?: string;           // UUID
    limit?: number;              // Default: 10
  }
): Promise<MemorySearchResult[]>
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `embedding` | number[] | Yes | - | 1536-dimensional vector |
| `groupId` | UUID | No | - | Filter by group |
| `limit` | number | No | 10 | Max results |

**Returns:**
```typescript
type MemorySearchResult = {
  id: string;
  content: string;
  type?: string;                  // fact, preference, context
  similarity: number;              // 0.0-1.0
}
```

**Usage:**
```typescript
const contextEmbedding = await generateEmbedding('team preferences and settings');

const memories = await searchMemories(contextEmbedding, {
  groupId: 'group-uuid',
  limit: 10
});

const context = memories
  .map(m => `- ${m.content}`)
  .join('\n');

const response = await llm.generate(userQuery, { context });
```

**Embedding Validation:**
- Must be array of exactly 1536 numbers
- All values must be valid numbers (not NaN)
- Throws error on invalid input

**Performance:**
- Sequential scan (O(n)) currently
- Future HNSW index: O(log n)
- Latency: 10-100ms depending on table size

---

## Analytics Operations

### `getGroupStats(groupId)`

Aggregate statistics for a group.

**Signature:**
```typescript
function getGroupStats(groupId: string): Promise<GroupStats>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `groupId` | UUID | Yes | Group UUID |

**Returns:**
```typescript
type GroupStats = {
  totalMessages: number;
  totalTasks: number;
  totalDecisions: number;
  totalDeadlines: number;
  totalMemories: number;
}
```

**Usage:**
```typescript
const stats = await getGroupStats('group-uuid');

console.log(`Group Statistics:
  Messages: ${stats.totalMessages}
  Tasks: ${stats.totalTasks}
  Decisions: ${stats.totalDecisions}
  Deadlines: ${stats.totalDeadlines}
  Memories: ${stats.totalMemories}
`);
```

**Performance:**
- Multiple COUNT aggregations
- Uses indexes on (groupId, infoType)
- Latency: 10-50ms

---

## Error Handling

### Validation Errors

```typescript
// Vector search with invalid embedding
try {
  await searchByVector([1, 2, 3]); // Only 3 elements
} catch (error) {
  console.error(error.message);
  // Error: Invalid embedding: must be array of 1536 numbers
}

// Vector with NaN values
try {
  const embedding = new Array(1536).fill(NaN);
  await searchByVector(embedding);
} catch (error) {
  console.error(error.message);
  // Error: Invalid embedding: all elements must be valid numbers
}
```

### Database Errors

```typescript
// Connection failure
try {
  const group = await getGroupByPlatformId('telegram', 'id');
} catch (error) {
  console.error('Database operation failed:', error);
  // Handle gracefully: fallback, retry, etc.
}
```

### Best Practices

1. **Always check for null returns:**
   ```typescript
   const user = await getUserByPlatformId(platform, userId);
   if (!user) {
     // User doesn't exist, create with upsertUser()
   }
   ```

2. **Validate embeddings before search:**
   ```typescript
   if (!embedding || embedding.length !== 1536) {
     console.error('Invalid embedding');
     return;
   }
   ```

3. **Handle timeouts:**
   ```typescript
   const result = await Promise.race([
     searchByVector(embedding),
     new Promise((_, reject) =>
       setTimeout(() => reject(new Error('Timeout')), 5000)
     )
   ]);
   ```

---

## Type Reference

### Enums

#### InfoType
```typescript
type InfoType = 'task' | 'decision' | 'deadline' | 'important' | 'general'
```

#### Platform
```typescript
type Platform = 'telegram' | 'lark'
```

### Complete Type Definitions

```typescript
// Groups
type Group = {
  id: string;
  platform: Platform;
  platformGroupId: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Users
type User = {
  id: string;
  platform: Platform;
  platformUserId: string;
  username?: string;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Messages
type Message = {
  id: string;
  groupId: string;
  userId?: string;
  platformMessageId: string;
  content: string;
  replyToMessageId?: string;
  threadId?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// Extracted Info
type ExtractedInfo = {
  id: string;
  messageId?: string;
  groupId: string;
  infoType: InfoType;
  content: string;
  summary?: string;
  assigneeUserId?: string;
  dueDate?: Date;
  status: string;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Memories
type Memory = {
  id: string;
  userId?: string;
  agentId?: string;
  groupId?: string;
  content: string;
  embedding?: number[];
  memoryType?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Query Log
type QueryLog = {
  id: string;
  groupId?: string;
  userId?: string;
  queryText: string;
  responseText?: string;
  memoriesUsed?: string[];
  latencyMs?: number;
  createdAt: Date;
}
```

---

## Example Usage Flow

```typescript
import {
  upsertGroup,
  upsertUser,
  saveMessage,
  saveExtractedInfo,
  searchMemories,
  getGroupStats,
} from '@jarvis/db';

// 1. Create/update group
const group = await upsertGroup({
  platform: 'telegram',
  platformGroupId: '-1001234567890',
  name: 'Engineering Team'
});

// 2. Create/update user
const user = await upsertUser({
  platform: 'telegram',
  platformUserId: '123456789',
  displayName: 'John Doe'
});

// 3. Save message
const message = await saveMessage({
  groupId: group.id,
  userId: user.id,
  platformMessageId: 'msg_001',
  content: 'We need to ship feature X by Friday'
});

// 4. Extract and save info
const embedding = await generateEmbedding('feature shipping deadline');
const extracted = await saveExtractedInfo({
  messageId: message.id,
  groupId: group.id,
  infoType: 'deadline',
  content: 'Ship feature X',
  summary: 'Feature X deadline',
  dueDate: new Date('2025-12-19'),
  embedding
});

// 5. Search memories for context
const contextEmbedding = await generateEmbedding('project status');
const memories = await searchMemories(contextEmbedding, {
  groupId: group.id,
  limit: 5
});

// 6. Get group statistics
const stats = await getGroupStats(group.id);
console.log(stats);
// { totalMessages: 1, totalTasks: 0, totalDecisions: 0, totalDeadlines: 1, totalMemories: 5 }
```

---

## Memory Layer Quick Reference

For complete memory layer API, see [memory-layer-api.md](./memory-layer-api.md).

### Embeddings
```typescript
import { embedText, embedBatch, cosineSimilarity } from '@jarvis/core';

const embedding = await embedText('text content');           // 768D vector
const embeddings = await embedBatch(['text1', 'text2']);    // Batch
const similarity = cosineSimilarity(embedding1, embedding2); // 0.0-1.0
```

### Extraction
```typescript
import { extractInfo, extractBatch, normalizeDueDate } from '@jarvis/core';

const items = await extractInfo(message, context);           // Vietnamese extraction
const batches = await extractBatch(messages);                // Batch
const isoDate = normalizeDueDate('25/12/2025');             // ISO format
```

### Storage
```typescript
import { storeExtractedInfo, storeMemory, storeBatch } from '@jarvis/core';

await storeExtractedInfo({ messageId, groupId, items });     // Save with embeddings
await storeMemory({ groupId, userId, content, memoryType }); // Long-term memory
await storeBatch([...]);                                      // Batch storage
```

### Retrieval
```typescript
import { searchExtractedInfo, searchMemory, multiSearch } from '@jarvis/core';

const results = await searchExtractedInfo(query, options);      // Semantic search
const memories = await searchMemory(query, options);            // Memory search
const combined = await multiSearch(queries, options);           // Multi-query
const tasks = await searchTasksByAssignee(groupId, assignee);   // Task search
const deadlines = await searchUpcomingDeadlines(groupId);       // Deadline search
```

---

*Core & Database API Reference for Phase 03: Memory Layer Integration*
