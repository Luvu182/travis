import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { env } from '@jarvis/config';

// GPT-4o for fallback
const gpt4o = openai('gpt-4o');

export interface GenerateOptions {
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Generate text response using GPT-4o
 * @param options Generation options
 * @returns Generated text
 */
export async function generate(options: GenerateOptions): Promise<string> {
  const { text } = await generateText({
    model: gpt4o as any,
    system: options.system,
    prompt: options.prompt,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
  });

  return text;
}

/**
 * Stream text response using GPT-4o
 * @param options Generation options
 * @yields Text chunks as they arrive
 */
export async function* stream(
  options: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const result = await streamText({
    model: gpt4o as any,
    system: options.system,
    prompt: options.prompt,
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 2048,
  });

  for await (const chunk of result.textStream) {
    yield chunk;
  }
}

/**
 * Generate structured output for extraction (OpenAI strength)
 * @param options Generation options
 * @param schema JSON schema for structured output
 * @returns Parsed structured output
 */
export async function generateStructured<T>(
  options: GenerateOptions,
  schema: Record<string, unknown>
): Promise<T> {
  const { text } = await generateText({
    model: gpt4o as any,
    system: `${options.system}\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(schema)}`,
    prompt: options.prompt,
    temperature: 0.1, // Low temp for structured
    maxTokens: options.maxTokens ?? 2048,
  });

  return JSON.parse(text) as T;
}
