import { Memory } from 'mem0ai/oss';
import { env } from '@jarvis/config';

// Type definitions for mem0 responses
export interface MemoryItem {
  id: string;
  memory: string;
  metadata?: Record<string, unknown>;
  score?: number;
  created_at?: string;
  updated_at?: string;
}

// Initialize mem0 with Gemini as LLM provider and PostgreSQL storage
export const memory = new Memory({
  version: 'v1.1',
  llm: {
    provider: 'google_ai',
    config: {
      apiKey: env.GEMINI_API_KEY,
      model: 'gemini-2.5-flash-lite',
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
      dimension: 1536, // embedding-001 is 1536D
    },
  },
  historyStore: {
    provider: 'sqlite',
    config: {
      historyDbPath: './memory_history.db',
    },
  },
});

/**
 * Add memory from conversation message
 */
export async function addMemory(params: {
  userId: string;
  groupId: string;
  message: string;
  senderName?: string;
  groupName?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { userId, groupId, message, senderName, groupName, metadata } = params;

  const messages = [{ role: 'user' as const, content: message }];

  await memory.add(messages, {
    userId,
    agentId: `group_${groupId}`,
    metadata: {
      senderName,
      groupName,
      ...metadata,
    },
  });
}

/**
 * Retrieve relevant memories for query
 */
export async function searchMemories(params: {
  userId: string;
  groupId: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]> {
  const { userId, groupId, query, limit = 5 } = params;

  const results = await memory.search(query, {
    userId,
    agentId: `group_${groupId}`,
    limit,
  });

  // mem0 returns results array, map to our interface
  return Array.isArray(results) ? results : [];
}

/**
 * Get all memories for a user/group
 */
export async function getAllMemories(params: {
  userId: string;
  groupId: string;
  limit?: number;
}): Promise<MemoryItem[]> {
  const { userId, groupId, limit = 10 } = params;

  const memories = await memory.getAll({
    userId,
    agentId: `group_${groupId}`,
    limit,
  });

  // mem0 returns memories array, map to our interface
  return Array.isArray(memories) ? memories : [];
}

/**
 * Update existing memory
 */
export async function updateMemory(
  memoryId: string,
  data: string
): Promise<void> {
  await memory.update(memoryId, data);
}

/**
 * Delete memory by ID
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  await memory.delete(memoryId);
}
