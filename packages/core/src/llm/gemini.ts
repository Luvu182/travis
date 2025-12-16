import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { env } from '@jarvis/config';

// Gemini 2.5-flash-lite model
const gemini = google('gemini-2.5-flash-lite');

export interface GenerateOptions {
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate text response using Gemini 2.5-flash-lite
 * @param options Generation options
 * @returns Generated text
 */
export async function generate(options: GenerateOptions): Promise<string> {
  const { text } = await generateText({
    model: gemini as any,
    system: options.system,
    prompt: options.prompt,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
  });

  return text;
}

/**
 * Stream text response using Gemini 2.5-flash-lite
 * @param options Generation options
 * @yields Text chunks as they arrive
 */
export async function* stream(
  options: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const result = await streamText({
    model: gemini as any,
    system: options.system,
    prompt: options.prompt,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}
