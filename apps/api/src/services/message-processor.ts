import { addMemory, generate } from '@jarvis/core';
import { executeQuery } from './query-handler.js';

// ==================== TYPES ====================

export interface ProcessMessageOptions {
  userId: string;
  groupId: string;
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

// ==================== METRICS ====================

const metrics: ProcessingMetrics = {
  totalProcessed: 0,
  totalFailed: 0,
  totalRetries: 0,
  avgLatencyMs: 0,
};

export function getProcessingMetrics(): ProcessingMetrics {
  return { ...metrics };
}

export function resetProcessingMetrics(): void {
  metrics.totalProcessed = 0;
  metrics.totalFailed = 0;
  metrics.totalRetries = 0;
  metrics.avgLatencyMs = 0;
  metrics.lastProcessedAt = undefined;
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

    // Update metrics
    updateMetrics(true, latencyMs, totalRetries);

    return {
      success: true,
      responseText: response.text,
      latencyMs,
      retryCount: totalRetries,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('[MessageProcessor] Processing failed after retries:', errorMessage);

    // Update metrics
    updateMetrics(false, latencyMs, totalRetries);

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

function updateMetrics(success: boolean, latencyMs: number, retries: number): void {
  if (success) {
    metrics.totalProcessed++;

    // Update running average
    const totalCount = metrics.totalProcessed;
    metrics.avgLatencyMs = ((metrics.avgLatencyMs * (totalCount - 1)) + latencyMs) / totalCount;
  } else {
    metrics.totalFailed++;
  }

  metrics.totalRetries += retries;
  metrics.lastProcessedAt = new Date();
}
