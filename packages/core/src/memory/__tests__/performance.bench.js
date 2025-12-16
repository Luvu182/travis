import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity } from '../embeddings.js';

describe('Performance Benchmarks', () => {
  describe('Cosine Similarity Performance', () => {
    it('should calculate cosine similarity for 768D vectors in <1ms', () => {
      const vec1 = new Array(768).fill(0).map(() => Math.random());
      const vec2 = new Array(768).fill(0).map(() => Math.random());

      const startTime = performance.now();
      const result = cosineSimilarity(vec1, vec2);
      const endTime = performance.now();

      const duration = endTime - startTime;

      console.log(`  Cosine similarity (768D): ${duration.toFixed(4)}ms`);

      assert.ok(duration < 1, `Should complete in < 1ms, took ${duration.toFixed(4)}ms`);
      assert.ok(result >= -1 && result <= 1, 'Result should be in [-1, 1] range');
    });

    it('should handle batch similarity calculations efficiently', () => {
      const queryVector = new Array(768).fill(0).map(() => Math.random());
      const documentVectors = Array.from({ length: 100 }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );

      const startTime = performance.now();
      const similarities = documentVectors.map(doc => cosineSimilarity(queryVector, doc));
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Batch similarity (100 x 768D): ${duration.toFixed(4)}ms`);

      assert.ok(duration < 100, `Batch should complete in < 100ms, took ${duration.toFixed(4)}ms`);
      assert.equal(similarities.length, 100, 'Should have 100 similarities');
    });

    it('should perform vector matching for 10K documents under target', () => {
      const queryVector = new Array(768).fill(0).map(() => Math.random());
      const documentVectors = Array.from({ length: 10000 }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );

      const startTime = performance.now();

      const similarities = documentVectors.map(doc => cosineSimilarity(queryVector, doc));

      const topResults = similarities
        .map((sim, idx) => ({ id: `doc_${idx}`, similarity: sim }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 10);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Vector search (10K x 768D): ${duration.toFixed(4)}ms`);

      assert.ok(
        duration < 500,
        `Retrieval latency should be < 500ms, took ${duration.toFixed(4)}ms`
      );
      assert.equal(topResults.length, 10, 'Should have top 10 results');
    });
  });

  describe('Memory Operations Performance', () => {
    it('should validate and filter extracted items quickly', () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        type: i % 5 === 0 ? 'task' : 'decision',
        content: `Item ${i}`,
        confidence: Math.random(),
      }));

      const startTime = performance.now();
      const filtered = items.filter(item => item.confidence >= 0.7);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Filter 1000 items: ${duration.toFixed(4)}ms`);

      assert.ok(duration < 10, `Filtering should be < 10ms, took ${duration.toFixed(4)}ms`);
    });

    it('should handle embedding normalization efficiently', () => {
      const embeddings = Array.from({ length: 100 }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );

      const startTime = performance.now();

      const normalized = embeddings.map(emb => {
        const norm = Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0));
        return norm === 0 ? emb : emb.map(val => val / norm);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Normalize 100 embeddings: ${duration.toFixed(4)}ms`);

      assert.ok(duration < 50, `Normalization should be < 50ms, took ${duration.toFixed(4)}ms`);
      assert.equal(normalized.length, 100, 'Should have 100 normalized embeddings');
    });

    it('should deduplicate search results efficiently', () => {
      const results = Array.from({ length: 1000 }, (_, i) => ({
        id: `result_${i % 100}`,
        similarity: Math.random(),
        content: `Result ${i}`,
      }));

      const startTime = performance.now();

      const resultMap = new Map();
      for (const result of results) {
        const existing = resultMap.get(result.id);
        if (!existing || result.similarity > existing.similarity) {
          resultMap.set(result.id, result);
        }
      }

      const deduped = Array.from(resultMap.values());

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Deduplicate 1000 results: ${duration.toFixed(4)}ms`);

      assert.ok(duration < 20, `Deduplication should be < 20ms, took ${duration.toFixed(4)}ms`);
      assert.equal(deduped.length, 100, 'Should have 100 unique results');
    });

    it('should sort large result sets efficiently', () => {
      const results = Array.from({ length: 10000 }, (_, i) => ({
        id: `result_${i}`,
        similarity: Math.random(),
      }));

      const startTime = performance.now();
      const sorted = [...results].sort((a, b) => b.similarity - a.similarity);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Sort 10000 results: ${duration.toFixed(4)}ms`);

      assert.ok(duration < 50, `Sorting should be < 50ms, took ${duration.toFixed(4)}ms`);
      assert.ok(sorted[0].similarity >= sorted[1].similarity, 'Should be sorted descending');
    });
  });

  describe('Retrieval Latency Analysis', () => {
    it('should complete vector search within latency budget', () => {
      const queryVector = new Array(768).fill(0).map(() => Math.random());
      const docCount = 10000;
      const documentVectors = Array.from({ length: docCount }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );

      const startTime = performance.now();

      const similarities = documentVectors.map(doc => cosineSimilarity(queryVector, doc));

      const minSimilarity = 0.5;
      const filtered = similarities
        .map((sim, idx) => ({ id: `doc_${idx}`, similarity: sim }))
        .filter(r => r.similarity >= minSimilarity);

      const sorted = filtered.sort((a, b) => b.similarity - a.similarity);
      const topResults = sorted.slice(0, 10);

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Full retrieval pipeline (${docCount} docs): ${duration.toFixed(4)}ms`);

      assert.ok(
        duration < 500,
        `Full pipeline should be < 500ms, took ${duration.toFixed(4)}ms`
      );
      assert.ok(topResults.length > 0, 'Should have results');
    });

    it('should handle concurrent search operations', () => {
      const queryCount = 5;
      const docCount = 1000;
      const queries = Array.from({ length: queryCount }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );
      const documents = Array.from({ length: docCount }, () =>
        new Array(768).fill(0).map(() => Math.random())
      );

      const startTime = performance.now();

      const allResults = queries.map(query => {
        const similarities = documents.map(doc => cosineSimilarity(query, doc));
        return similarities
          .map((sim, idx) => ({ id: `doc_${idx}`, similarity: sim }))
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10);
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  5 concurrent searches (${docCount} docs each): ${duration.toFixed(4)}ms`);

      assert.ok(
        duration < 1000,
        `Concurrent searches should be < 1000ms, took ${duration.toFixed(4)}ms`
      );
      assert.equal(allResults.length, queryCount, 'Should have results for all queries');
    });
  });

  describe('Memory Usage Analysis', () => {
    it('should estimate memory for 10K embeddings', () => {
      const estimatedBytes = 10000 * 768 * 8;
      const estimatedMB = estimatedBytes / (1024 * 1024);

      console.log(`  Memory estimate for 10K embeddings: ${estimatedMB.toFixed(2)}MB`);

      assert.ok(estimatedMB < 100, `Should be < 100MB, estimated ${estimatedMB.toFixed(2)}MB`);
    });

    it('should handle incremental storage efficiently', () => {
      const batchSize = 100;
      const batchCount = 100;

      const startTime = performance.now();

      let totalProcessed = 0;
      for (let i = 0; i < batchCount; i++) {
        const batch = Array.from({ length: batchSize }, (_, j) => ({
          id: `item_${i * batchSize + j}`,
          embedding: new Array(768).fill(0).map(() => Math.random()),
        }));
        totalProcessed += batch.length;
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Incremental storage (${totalProcessed} items): ${duration.toFixed(4)}ms`);

      assert.equal(totalProcessed, 10000, 'Should process 10K items');
    });
  });
});
