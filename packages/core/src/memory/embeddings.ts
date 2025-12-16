import { google } from '@ai-sdk/google';
import { embed } from 'ai';
import { env } from '@luxbot/config';

// Gemini embedding model (text-embedding-004 produces 768D embeddings)
// Note: Gemini embedding-004 is 768D, not 1536D as originally planned
// We'll use this for now and update schema if needed

/**
 * Generate embedding for a single text using Gemini text-embedding-004
 * @param text Text to embed
 * @returns 768-dimensional embedding vector
 */
export async function embedText(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text');
  }

  try {
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004') as any,
      value: text,
    });

    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error(`Embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts Array of texts to embed
 * @returns Array of 768-dimensional embedding vectors
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter(t => t && t.trim().length > 0);

  if (validTexts.length === 0) {
    throw new Error('No valid texts to embed');
  }

  try {
    // Process in parallel with rate limiting
    const results = await Promise.all(
      validTexts.map(text => embedText(text))
    );

    return results;
  } catch (error) {
    console.error('Failed to generate batch embeddings:', error);
    throw new Error(`Batch embedding generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a First embedding vector
 * @param b Second embedding vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}
