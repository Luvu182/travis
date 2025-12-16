import { addMemory, generate } from '@jarvis/core';
import { executeQuery } from './query-handler.js';

// ==================== TYPES ====================

export interface ProcessMessageOptions {
  userId: string;
  groupId: string;
  workspaceId?: string;  // Multi-tenant workspace isolation
  message: string;
  senderName?: string;
  groupName?: string;
}

export interface ProcessMessageResult {
  success: boolean;
  responseText?: string;
  error?: string;
  latencyMs: number;
  retryCount: number;
}

interface ProcessingMetrics {
  totalProcessed: number;
  totalFailed: number;
  totalRetries: number;
  avgLatencyMs: number;
  lastProcessedAt?: Date;
}

interface WorkspaceMetrics extends ProcessingMetrics {
  workspaceId: string;
}

// ==================== METRICS ====================

// Global metrics (all workspaces combined)
const globalMetrics: ProcessingMetrics = {
  totalProcessed: 0,
  totalFailed: 0,
  totalRetries: 0,
  avgLatencyMs: 0,
};

// Per-workspace metrics
const workspaceMetricsMap = new Map<string, ProcessingMetrics>();

// Legacy key for messages without workspaceId
const LEGACY_WORKSPACE_KEY = '__legacy__';

export function getProcessingMetrics(): ProcessingMetrics {
  return { ...globalMetrics };
}

export function getWorkspaceMetrics(workspaceId: string): ProcessingMetrics | null {
  const metrics = workspaceMetricsMap.get(workspaceId);
  return metrics ? { ...metrics } : null;
}

export function getAllWorkspaceMetrics(): WorkspaceMetrics[] {
  const result: WorkspaceMetrics[] = [];
  for (const [workspaceId, metrics] of workspaceMetricsMap) {
    result.push({ ...metrics, workspaceId });
  }
  return result;
}

export function resetProcessingMetrics(): void {
  globalMetrics.totalProcessed = 0;
  globalMetrics.totalFailed = 0;
  globalMetrics.totalRetries = 0;
  globalMetrics.avgLatencyMs = 0;
  globalMetrics.lastProcessedAt = undefined;
}

export function resetWorkspaceMetrics(workspaceId: string): boolean {
  return workspaceMetricsMap.delete(workspaceId);
}

export function resetAllWorkspaceMetrics(): void {
  workspaceMetricsMap.clear();
}

// ==================== RETRY LOGIC ====================

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000; // 1 second

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialBackoff: number = INITIAL_BACKOFF_MS
): Promise<{ result: T; retries: number }> {
  let lastError: Error | undefined;
  let retries = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return { result, retries };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retries = attempt;

      if (attempt < maxRetries) {
        const backoffMs = initialBackoff * Math.pow(2, attempt);
        console.warn(
          `[MessageProcessor] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${backoffMs}ms:`,
          lastError.message
        );
        await sleep(backoffMs);
      }
    }
  }

  throw lastError || new Error('Unknown error during retry');
}

// ==================== CORE PROCESSOR ====================

/**
 * Process a message asynchronously with retry logic
 *
 * Flow:
 * 1. Extract and store information via mem0 (with retry)
 * 2. Search for relevant memories (with retry)
 * 3. Generate LLM response with memory context (with retry)
 *
 * @param options - Message processing options
 * @returns Processing result with response text and metrics
 */
export async function processMessage(options: ProcessMessageOptions): Promise<ProcessMessageResult> {
  const startTime = Date.now();
  let totalRetries = 0;

  try {
    // Step 1: Extract and store information via mem0 (automatic extraction)
    const { retries: extractRetries } = await retryWithBackoff(async () => {
      return await addMemory({
        userId: options.userId,
        groupId: options.groupId,
        workspaceId: options.workspaceId,
        message: options.message,
        senderName: options.senderName,
        groupName: options.groupName,
      });
    });
    totalRetries += extractRetries;

    // Step 2: Execute query with advanced ranking and filtering
    const { result: queryResult, retries: searchRetries } = await retryWithBackoff(async () => {
      return await executeQuery({
        userId: options.userId,
        groupId: options.groupId,
        workspaceId: options.workspaceId,
        query: options.message,
        limit: 5,
        minScore: 0.3, // Filter low-relevance memories
      });
    });
    totalRetries += searchRetries;

    if (!queryResult.success) {
      throw new Error(queryResult.error || 'Query execution failed');
    }

    // Step 3: Use formatted context from query handler
    const memoryContext = queryResult.formattedContext;

    const systemPrompt = `Bạn là J.A.R.V.I.S, trợ lý ảo thông minh hỗ trợ tiếng Việt.

**Thông tin đã lưu trữ:**
${memoryContext}

**Hướng dẫn:**
- Sử dụng thông tin đã lưu để đưa ra câu trả lời chính xác
- Nếu không có thông tin liên quan, trả lời dựa trên kiến thức chung
- Trả lời ngắn gọn, súc tích, tự nhiên
- Sử dụng tiếng Việt
`;

    const { result: response, retries: llmRetries } = await retryWithBackoff(async () => {
      return await generate({
        task: 'query',
        system: systemPrompt,
        prompt: options.message,
        temperature: 0.7,
        maxTokens: 500,
      });
    });
    totalRetries += llmRetries;

    const latencyMs = Date.now() - startTime;

    // Update metrics (global + workspace)
    updateMetrics(true, latencyMs, totalRetries, options.workspaceId);

    // Log with workspace context for observability
    console.log(
      `[MessageProcessor] OK | ws=${options.workspaceId || 'legacy'} grp=${options.groupId} usr=${options.userId} lat=${latencyMs}ms ret=${totalRetries}`
    );

    return {
      success: true,
      responseText: response.text,
      latencyMs,
      retryCount: totalRetries,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Log error with workspace context
    console.error(
      `[MessageProcessor] FAIL | ws=${options.workspaceId || 'legacy'} grp=${options.groupId} usr=${options.userId} lat=${latencyMs}ms ret=${totalRetries} err=${errorMessage}`
    );

    // Update metrics (global + workspace)
    updateMetrics(false, latencyMs, totalRetries, options.workspaceId);

    return {
      success: false,
      error: errorMessage,
      latencyMs,
      retryCount: totalRetries,
    };
  }
}

/**
 * Process a message asynchronously (fire-and-forget)
 * Returns immediately with a promise that resolves when processing completes
 *
 * Use this for non-blocking webhook responses
 *
 * @param options - Message processing options
 * @returns Promise that resolves when processing completes
 */
export function processMessageAsync(options: ProcessMessageOptions): Promise<ProcessMessageResult> {
  // Fire-and-forget with error logging
  const promise = processMessage(options);

  promise.catch((error) => {
    console.error('[MessageProcessor] Async processing error:', error);
  });

  return promise;
}

// ==================== METRICS HELPERS ====================

function updateMetrics(success: boolean, latencyMs: number, retries: number, workspaceId?: string): void {
  const wsKey = workspaceId || LEGACY_WORKSPACE_KEY;

  // Update global metrics
  updateSingleMetrics(globalMetrics, success, latencyMs, retries);

  // Update workspace-specific metrics
  let wsMetrics = workspaceMetricsMap.get(wsKey);
  if (!wsMetrics) {
    wsMetrics = {
      totalProcessed: 0,
      totalFailed: 0,
      totalRetries: 0,
      avgLatencyMs: 0,
    };
    workspaceMetricsMap.set(wsKey, wsMetrics);
  }
  updateSingleMetrics(wsMetrics, success, latencyMs, retries);
}

function updateSingleMetrics(metrics: ProcessingMetrics, success: boolean, latencyMs: number, retries: number): void {
  if (success) {
    metrics.totalProcessed++;
    const totalCount = metrics.totalProcessed;
    metrics.avgLatencyMs = ((metrics.avgLatencyMs * (totalCount - 1)) + latencyMs) / totalCount;
  } else {
    metrics.totalFailed++;
  }
  metrics.totalRetries += retries;
  metrics.lastProcessedAt = new Date();
}
