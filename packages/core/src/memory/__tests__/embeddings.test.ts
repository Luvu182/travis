import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity } from '../embeddings.js';

describe('Embeddings - cosineSimilarity', () => {
  it('should calculate cosine similarity between identical vectors', () => {
    const vec = [1, 0, 0];
    const similarity = cosineSimilarity(vec, vec);
    assert.equal(similarity, 1.0, 'Identical vectors should have similarity of 1.0');
  });

  it('should calculate cosine similarity between perpendicular vectors', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [0, 1, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    assert.equal(similarity, 0, 'Perpendicular vectors should have similarity of 0');
  });

  it('should calculate cosine similarity between opposite vectors', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [-1, 0, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    assert.equal(similarity, -1, 'Opposite vectors should have similarity of -1');
  });

  it('should calculate cosine similarity between normalized vectors', () => {
    const vec1 = [1, 1, 0];
    const vec2 = [1, 1, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    assert.equal(similarity, 1.0, 'Identical vectors should have similarity of 1.0');
  });

  it('should handle high-dimensional vectors correctly', () => {
    // Create 768-dimensional vectors (like Gemini embeddings)
    const vec1 = new Array(768).fill(0);
    vec1[0] = 1;

    const vec2 = new Array(768).fill(0);
    vec2[0] = 1;

    const similarity = cosineSimilarity(vec1, vec2);
    assert.equal(similarity, 1.0, 'Identical 768D vectors should have similarity of 1.0');
  });

  it('should throw on dimension mismatch', () => {
    const vec1 = [1, 0, 0];
    const vec2 = [1, 0];
    assert.throws(
      () => cosineSimilarity(vec1, vec2),
      /Embedding dimensions must match/,
      'Should throw error on dimension mismatch'
    );
  });

  it('should handle zero vectors', () => {
    const vec1 = [0, 0, 0];
    const vec2 = [0, 0, 0];
    const similarity = cosineSimilarity(vec1, vec2);
    assert.equal(similarity, 0, 'Zero vectors should return 0');
  });

  it('should calculate partial similarity correctly', () => {
    const vec1 = [3, 4]; // magnitude 5
    const vec2 = [4, 3]; // magnitude 5
    const similarity = cosineSimilarity(vec1, vec2);
    // dot product: 3*4 + 4*3 = 24, magnitudes: 5*5 = 25, similarity = 24/25 = 0.96
    assert.ok(Math.abs(similarity - 0.96) < 0.001, 'Similarity calculation should be correct');
  });
});
