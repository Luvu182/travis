# Database Operations Quick Reference

**Project:** Vietnamese Executive Assistant Chatbot | **Phase:** 02 Complete

---

## Connection & Setup

```typescript
// packages/db/src/client.ts
import { db } from '@travis/db';

// Connection is lazy-loaded on first use
// Automatically pools connections (dev: 1, prod: 20)
```

---

## Core Operations

### Group Management
```typescript
import { upsertGroup, getGroupStats } from '@travis/db';

// Create or update group
const group = await upsertGroup({
  platform: 'telegram',           // 'telegram' | 'lark'
  platformGroupId: 'group_123',   // External platform ID
  name: 'Engineering Team',       // Optional
});

// Get group statistics
const stats = await getGroupStats(groupId);
// Returns: { totalMessages, totalTasks, totalDecisions, totalDeadlines, totalMemories }
```

### User Management
```typescript
import { upsertUser } from '@travis/db';

// Create or update user
const user = await upsertUser({
  platform: 'telegram',
  platformUserId: 'user_456',
  username: 'john_doe',           // Optional
  displayName: 'John Doe',        // Optional
});
```

### Message Operations
```typescript
import { saveMessage, getRecentMessages } from '@travis/db';

// Save a message
const message = await saveMessage({
  groupId: 'uuid...',
  userId: 'uuid...',
  platformMessageId: 'msg_789',
  content: 'Important announcement',
  replyToMessageId: 'msg_788',    // Optional
  threadId: 'thread_1',           // Optional
});

// Get recent messages
const messages = await getRecentMessages(groupId, limit = 5);
// Returns: Array with id, platformMessageId, content, senderName, createdAt
```

### Extracted Information
```typescript
import { saveExtractedInfo, getExtractedInfoByGroup } from '@travis/db';

// Save extracted task/decision/deadline
const info = await saveExtractedInfo({
  messageId: 'uuid...',
  groupId: 'uuid...',
  infoType: 'task',               // 'task' | 'decision' | 'deadline' | 'important' | 'general'
  content: 'Complete report by Friday',
  summary: 'Q4 report',           // Optional
  assigneeUserId: 'uuid...',      // Optional
  dueDate: new Date('2025-12-20'),// Optional
  status: 'active',               // Default: 'active'
  embedding: [0.1, 0.2, ...],     // 1536-dim vector (or null)
});

// Get extracted info by group
const tasks = await getExtractedInfoByGroup(groupId, {
  type: 'task',                   // Optional filter
  status: 'active',               // Optional filter
  limit: 20,                      // Default: 20
});
```

### Memory Operations
```typescript
import { saveMemory, getRecentMemories } from '@travis/db';

// Save memory
const memory = await saveMemory({
  userId: 'user_uuid',            // mem0 user context
  agentId: 'agent_uuid',          // mem0 agent context
  groupId: 'group_uuid',
  content: 'User prefers async updates',
  embedding: [0.1, 0.2, ...],     // 1536-dim vector
  memoryType: 'preference',       // 'fact' | 'preference' | 'context'
});

// Get recent memories
const memories = await getRecentMemories(groupId, limit = 10);
```

### Vector Search
```typescript
import { searchByVector, searchMemories } from '@travis/db';

// Search extracted info by vector similarity
const results = await searchByVector([0.1, 0.2, ..., 1536 dims], {
  groupId: 'uuid...',             // Optional: filter by group
  type: 'task',                   // Optional: filter by type
  limit: 10,                      // Default: 10
  minSimilarity: 0.5,             // Default: 0.5 (0-1 scale)
});
// Returns: Array of { id, type, content, summary, dueDate, similarity }

// Search memories by vector similarity
const memoryResults = await searchMemories([0.1, 0.2, ...], {
  groupId: 'uuid...',             // Optional filter
  limit: 10,                      // Default: 10
});
// Returns: Array of { id, content, type, similarity }
```

---

## Type Definitions

```typescript
// All types auto-generated from schema
import type {
  Group, NewGroup,
  User, NewUser,
  Message, NewMessage,
  ExtractedInfo, NewExtractedInfo,
  Memory, NewMemory,
  QueryLog, NewQueryLog,
} from '@travis/db';
```

---

## Common Patterns

### Upsert Group & Users
```typescript
const group = await upsertGroup({
  platform: 'telegram',
  platformGroupId,
});

const user = await upsertUser({
  platform: 'telegram',
  platformUserId,
  displayName,
});
```

### Save & Extract Info
```typescript
// 1. Save raw message
const message = await saveMessage({
  groupId: group.id,
  userId: user.id,
  platformMessageId,
  content,
});

// 2. Extract & save info (from LLM output)
if (message) {
  await saveExtractedInfo({
    messageId: message.id,
    groupId: group.id,
    infoType: 'task',
    content: extractedTask,
    embedding: await generateEmbedding(extractedTask),
  });
}
```

### Memory Lifecycle
```typescript
// 1. Generate embedding from content
const embedding = await generateEmbedding(content);

// 2. Save to memory
const memory = await saveMemory({
  groupId,
  userId,
  content,
  embedding,
  memoryType: 'fact',
});

// 3. Later: Search similar memories
const similar = await searchByVector(queryEmbedding, { groupId, limit: 5 });
```

---

## Performance Tips

1. **Vector Searches:** Provide `groupId` to limit scope and improve performance
2. **Recent Queries:** Use `getRecentMessages()` instead of full table scans
3. **Filtering:** Use `type` and `status` parameters to filter early
4. **Batch Operations:** Group multiple inserts when possible
5. **Connection Pool:** Don't need to manage connections; automatically pooled

---

## Error Handling

```typescript
try {
  const info = await saveExtractedInfo(data);
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    console.error('Duplicate entry detected');
  } else if (error.code === '23503') {
    // Foreign key violation
    console.error('Invalid reference');
  } else {
    console.error('Database error:', error.message);
  }
}
```

---

## Vector Dimension Notes

- **Dimension:** 1536 (for Gemini embedding-001)
- **Validation:** Enforced at schema level
- **Search:** Cosine similarity (1 - distance)
- **Indexing:** IVFFlat for <1M vectors

---

## Environment

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/travis
NODE_ENV=production  # 20-connection pool
# or
NODE_ENV=development # 1-connection for dev
```

---

## Deployment

All operations are production-ready. Schema is enforced by Drizzle with automatic migrations.

```bash
# Setup
pnpm db:generate
pnpm db:push

# Check schema
pnpm db:studio

# In production
pnpm db:migrate
```

---

**Last Updated:** 2025-12-16
