/**
 * Memory Client - HTTP client for Python mem0 service
 * Calls the FastAPI memory service which uses mem0 Python SDK with pgvector
 */
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

// Type for memory history entries
export interface MemoryHistoryEntry {
  id: string;
  memoryId: string;
  previousValue?: string;
  newValue?: string;
  action: 'ADD' | 'UPDATE' | 'DELETE';
  timestamp: string;
}

interface MemoryResponse {
  success: boolean;
  data?: unknown[];
  error?: string;
}

// Memory service URL - configurable via env
const MEMORY_SERVICE_URL = env.MEMORY_SERVICE_URL;

/**
 * Helper to make requests to memory service
 */
async function memoryRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: unknown
): Promise<T> {
  const url = `${MEMORY_SERVICE_URL}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Memory service error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** Context message for conversation history */
export interface ContextMessage {
  senderName: string;
  content: string;
  createdAt?: Date | null;
}

/**
 * Add memory from conversation message with context
 *
 * When contextMessages is provided, formats them as conversation history
 * for better extraction (e.g., understanding "file này" refers to previous context)
 *
 * Multi-tenant scoping:
 * - workspaceId: isolates memories between workspaces (primary tenant boundary)
 * - groupId: context within workspace
 * - userId: individual user within group
 */
export async function addMemory(params: {
  userId: string;
  groupId: string;
  workspaceId?: string;
  message: string;
  senderName?: string;
  groupName?: string;
  platform?: string;  // telegram, lark, web - for AI context
  sentAt?: Date;
  contextMessages?: ContextMessage[];  // Recent messages for context
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { userId, groupId, workspaceId, message, senderName, groupName, platform, sentAt, contextMessages } = params;

  // Format context messages as conversation if provided
  let messageToSend = message;
  if (contextMessages && contextMessages.length > 0) {
    // Format: [SenderName]: message content
    const formattedContext = contextMessages
      .map(m => `[${m.senderName || 'Unknown'}]: ${m.content}`)
      .join('\n');
    messageToSend = formattedContext;
  }

  const response = await memoryRequest<MemoryResponse>('/memories/add', 'POST', {
    user_id: userId,
    group_id: groupId,
    workspace_id: workspaceId,
    message: messageToSend,
    sender_name: senderName,
    group_name: groupName,
    platform,
    sent_at: sentAt?.toISOString(),
  });

  if (!response.success) {
    console.error('[Memory] Add failed:', response.error);
  }
}

/**
 * Retrieve relevant memories for query
 * Multi-tenant scoping via workspaceId
 */
export async function searchMemories(params: {
  userId: string;
  groupId: string;
  workspaceId?: string;
  query: string;
  limit?: number;
}): Promise<MemoryItem[]> {
  const { userId, groupId, workspaceId, query, limit = 5 } = params;

  const response = await memoryRequest<MemoryResponse>('/memories/search', 'POST', {
    user_id: userId,
    group_id: groupId,
    workspace_id: workspaceId,
    query,
    limit,
  });

  if (!response.success) {
    console.error('[Memory] Search failed:', response.error);
    return [];
  }

  return (response.data as MemoryItem[]) || [];
}

/**
 * Get all memories for a user/group
 * Multi-tenant scoping via workspaceId
 */
export async function getAllMemories(params: {
  userId: string;
  groupId: string;
  workspaceId?: string;
  limit?: number;
}): Promise<MemoryItem[]> {
  const { userId, groupId, workspaceId, limit = 10 } = params;

  const response = await memoryRequest<MemoryResponse>('/memories/all', 'POST', {
    user_id: userId,
    group_id: groupId,
    workspace_id: workspaceId,
    limit,
  });

  if (!response.success) {
    console.error('[Memory] GetAll failed:', response.error);
    return [];
  }

  return (response.data as MemoryItem[]) || [];
}

/**
 * Update existing memory
 */
export async function updateMemory(
  memoryId: string,
  data: string
): Promise<void> {
  const response = await memoryRequest<MemoryResponse>('/memories/update', 'POST', {
    memory_id: memoryId,
    data,
  });

  if (!response.success) {
    console.error('[Memory] Update failed:', response.error);
  }
}

/**
 * Delete memory by ID
 */
export async function deleteMemory(memoryId: string): Promise<void> {
  const response = await memoryRequest<MemoryResponse>('/memories/delete', 'POST', {
    memory_id: memoryId,
  });

  if (!response.success) {
    console.error('[Memory] Delete failed:', response.error);
  }
}

/**
 * Get memory history (audit trail) for a specific memory
 * Returns all changes made to the memory over time
 */
export async function getMemoryHistory(
  memoryId: string
): Promise<MemoryHistoryEntry[]> {
  const response = await memoryRequest<MemoryResponse>(
    `/memories/history/${memoryId}`,
    'GET'
  );

  if (!response.success) {
    console.error('[Memory] History failed:', response.error);
    return [];
  }

  return (response.data as MemoryHistoryEntry[]) || [];
}

/**
 * Delete all memories for a user/group
 * Multi-tenant scoping via workspaceId
 */
export async function deleteAllMemories(params: {
  userId: string;
  groupId: string;
  workspaceId?: string;
}): Promise<void> {
  const { userId, groupId, workspaceId } = params;

  const response = await memoryRequest<MemoryResponse>('/memories/delete-all', 'POST', {
    user_id: userId,
    group_id: groupId,
    workspace_id: workspaceId,
  });

  if (!response.success) {
    console.error('[Memory] DeleteAll failed:', response.error);
  }
}

interface HealthResponse {
  status: string;
  service: string;
  mem0: boolean;
}

/**
 * Check if memory service is available
 */
export async function isMemoryEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`${MEMORY_SERVICE_URL}/health`);
    const data = (await response.json()) as HealthResponse;
    return data.status === 'ok' && data.mem0 === true;
  } catch {
    return false;
  }
}

/**
 * Get memory service health status
 */
export async function getMemoryHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${MEMORY_SERVICE_URL}/health`);
    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}
