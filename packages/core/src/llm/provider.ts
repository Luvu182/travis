import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { env } from '@jarvis/config';
import type { LanguageModelV1 } from 'ai';

// Model configurations using gemini-2.5-flash-lite and embedding-001
export const models = {
  gemini: {
    flashLite: google('gemini-2.5-flash-lite'),
    pro: google('gemini-1.5-pro'),
  },
  openai: {
    gpt4o: openai('gpt-4o'),
    gpt4oMini: openai('gpt-4o-mini'),
  },
} as const;

// Task types for routing
export type TaskType =
  | 'chat' // General conversation
  | 'extraction' // Info extraction (tasks, decisions)
  | 'summarization' // Text summarization
  | 'query' // Memory query response
  | 'translation'; // Vietnamese↔English

/**
 * Select appropriate model based on task type
 * @param task Task type
 * @returns Selected language model
 */
export function selectModel(task: TaskType): any {
  switch (task) {
    case 'extraction':
      // Gemini 2.5-flash-lite handles extraction well
      return models.gemini.flashLite;
    case 'chat':
    case 'query':
    case 'summarization':
      // Gemini cheaper for routine tasks
      return models.gemini.flashLite;
    case 'translation':
      return models.gemini.flashLite;
    default:
      return models.gemini.flashLite;
  }
}

/**
 * Get fallback model when primary fails
 * @param primary Primary model that failed
 * @returns Fallback model
 */
export function getFallback(primary: any): any {
  // If Gemini fails, use OpenAI
  if (
    primary === models.gemini.flashLite ||
    primary === models.gemini.pro
  ) {
    return models.openai.gpt4oMini;
  }
  // If OpenAI fails, use Gemini
  return models.gemini.flashLite;
}

/**
 * Get model display name
 * @param model Language model
 * @returns Human-readable model name
 */
export function getModelName(model: any): string {
  if (model === models.gemini.flashLite) return 'gemini-2.5-flash-lite';
  if (model === models.gemini.pro) return 'gemini-1.5-pro';
  if (model === models.openai.gpt4o) return 'gpt-4o';
  if (model === models.openai.gpt4oMini) return 'gpt-4o-mini';
  return 'unknown';
}
