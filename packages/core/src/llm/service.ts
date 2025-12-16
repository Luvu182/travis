import { generateText, streamText } from 'ai';
import { selectModel, getFallback, getModelName, type TaskType } from './provider.js';

export interface LLMRequest {
  task: TaskType;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  usedFallback: boolean;
  latencyMs: number;
}

/**
 * Generate text with automatic fallback
 * @param request LLM request parameters
 * @returns Generated response with metadata
 */
export async function generate(request: LLMRequest): Promise<LLMResponse> {
  const startTime = Date.now();
  const primaryModel = selectModel(request.task);
  let usedFallback = false;

  try {
    const { text } = await generateText({
      model: primaryModel as any,
      system: request.system,
      prompt: request.prompt,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
    });

    return {
      text,
      model: getModelName(primaryModel),
      usedFallback: false,
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    console.warn(`Primary model failed, using fallback:`, error);
    usedFallback = true;

    const fallbackModel = getFallback(primaryModel);
    const { text } = await generateText({
      model: fallbackModel as any,
      system: request.system,
      prompt: request.prompt,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
    });

    return {
      text,
      model: getModelName(fallbackModel),
      usedFallback: true,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Stream text with automatic fallback
 * @param request LLM request parameters
 * @yields Text chunks as they arrive
 */
export async function* stream(
  request: LLMRequest
): AsyncGenerator<string, void, unknown> {
  const primaryModel = selectModel(request.task);

  try {
    const result = await streamText({
      model: primaryModel as any,
      system: request.system,
      prompt: request.prompt,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  } catch (error) {
    console.warn(`Primary model stream failed, using fallback:`, error);
    const fallbackModel = getFallback(primaryModel);

    const result = await streamText({
      model: fallbackModel as any,
      system: request.system,
      prompt: request.prompt,
      temperature: request.temperature ?? 0.7,
      maxTokens: request.maxTokens ?? 2048,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  }
}
