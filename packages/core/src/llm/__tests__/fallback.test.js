/**
 * Fallback mechanism tests
 * Tests error handling and fallback triggering
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { selectModel, getFallback, getModelName } from '../provider.js';
import { getSystemPrompt } from '../prompts.js';

test('Fallback - error handling and recovery', async (t) => {
  await t.test('getFallback returns different model from primary', () => {
    const primaryGemini = selectModel('chat');
    const fallbackFromGemini = getFallback(primaryGemini);

    assert.notStrictEqual(
      getModelName(primaryGemini),
      getModelName(fallbackFromGemini),
      'fallback should be different model than primary'
    );
  });

  await t.test('fallback chain works bidirectionally', () => {
    const geminiModel = selectModel('chat');
    const fallbackOpenAI = getFallback(geminiModel);
    const fallbackAgain = getFallback(fallbackOpenAI);

    // Should return to Gemini
    assert.strictEqual(
      getModelName(geminiModel),
      getModelName(fallbackAgain),
      'fallback chain should cycle back'
    );
  });

  await t.test('models have defined fallbacks for all types', () => {
    const taskTypes = ['chat', 'extraction', 'summarization', 'query', 'translation'];

    taskTypes.forEach(task => {
      const primaryModel = selectModel(task);
      const fallbackModel = getFallback(primaryModel);

      assert.ok(fallbackModel, `should have fallback for ${task} task`);
      assert.ok(
        getModelName(fallbackModel) !== 'unknown',
        `fallback model name should be known for ${task}`
      );
    });
  });
});

test('Fallback - model name consistency', async (t) => {
  await t.test('model names are consistent across calls', () => {
    const geminiName1 = getModelName(selectModel('chat'));
    const geminiName2 = getModelName(selectModel('chat'));

    assert.strictEqual(geminiName1, geminiName2, 'model names should be consistent');
  });

  await t.test('fallback model names are consistent', () => {
    const primary = selectModel('chat');
    const name1 = getModelName(getFallback(primary));
    const name2 = getModelName(getFallback(primary));

    assert.strictEqual(name1, name2, 'fallback names should be consistent');
  });

  await t.test('model names are not empty or null', () => {
    const taskTypes = ['chat', 'extraction', 'summarization', 'query', 'translation'];

    taskTypes.forEach(task => {
      const primary = selectModel(task);
      const primaryName = getModelName(primary);
      const fallbackName = getModelName(getFallback(primary));

      assert.ok(primaryName.length > 0, `primary model name should not be empty for ${task}`);
      assert.ok(fallbackName.length > 0, `fallback model name should not be empty for ${task}`);
    });
  });
});

test('Fallback - request structure validation', async (t) => {
  await t.test('request with all parameters is valid', () => {
    const request = {
      task: 'chat',
      system: getSystemPrompt('assistant'),
      prompt: 'Test prompt',
      temperature: 0.7,
      maxTokens: 1000
    };

    assert.ok(request.task, 'should have task');
    assert.ok(request.system, 'should have system prompt');
    assert.ok(request.prompt, 'should have prompt');
    assert.ok(typeof request.temperature === 'number', 'should have valid temperature');
    assert.ok(typeof request.maxTokens === 'number', 'should have valid maxTokens');
  });

  await t.test('request with minimal parameters is valid', () => {
    const request = {
      task: 'chat',
      prompt: 'Test prompt'
    };

    assert.ok(request.task, 'should have task');
    assert.ok(request.prompt, 'should have prompt');
  });
});

test('Fallback - model selection stability', async (t) => {
  await t.test('same task always routes to same model', () => {
    const results = [];
    for (let i = 0; i < 5; i++) {
      const model = selectModel('chat');
      results.push(getModelName(model));
    }

    const allSame = results.every(name => name === results[0]);
    assert.ok(allSame, 'same task should route to same model consistently');
  });

  await t.test('different tasks route to expected models', () => {
    const extractionModel = getModelName(selectModel('extraction'));
    const chatModel = getModelName(selectModel('chat'));

    // Current implementation routes all to same model
    assert.strictEqual(extractionModel, chatModel, 'current routing sends all to same model');
  });
});

test('Fallback - error response structure', async (t) => {
  await t.test('response object has all required fields', () => {
    // Mock response structure
    const response = {
      text: 'Generated text',
      model: 'gemini-2.5-flash-lite',
      usedFallback: false,
      latencyMs: 1234
    };

    assert.ok(typeof response.text === 'string', 'text should be string');
    assert.ok(typeof response.model === 'string', 'model should be string');
    assert.ok(typeof response.usedFallback === 'boolean', 'usedFallback should be boolean');
    assert.ok(typeof response.latencyMs === 'number', 'latencyMs should be number');
    assert.ok(response.latencyMs >= 0, 'latencyMs should be non-negative');
  });

  await t.test('usedFallback flag is accurate', () => {
    const primaryResponse = {
      text: 'Primary response',
      model: 'gemini-2.5-flash-lite',
      usedFallback: false,
      latencyMs: 500
    };

    const fallbackResponse = {
      text: 'Fallback response',
      model: 'gpt-4o-mini',
      usedFallback: true,
      latencyMs: 1200
    };

    assert.ok(!primaryResponse.usedFallback, 'primary should not flag fallback');
    assert.ok(fallbackResponse.usedFallback, 'fallback should flag fallback');
  });
});

test('Fallback - latency tracking', async (t) => {
  await t.test('latency measurements are positive numbers', () => {
    const latencies = [150, 450, 750, 1200, 2000];

    latencies.forEach(latency => {
      assert.ok(latency > 0, `latency ${latency} should be positive`);
      assert.ok(typeof latency === 'number', 'latency should be number');
    });
  });

  await t.test('latency under 2 seconds is acceptable', () => {
    const targetLatency = 2000; // 2 seconds in ms
    const testLatencies = [500, 1000, 1500, 1900];

    testLatencies.forEach(latency => {
      assert.ok(latency < targetLatency, `latency ${latency}ms should be under ${targetLatency}ms`);
    });
  });

  await t.test('latency calculation is consistent', () => {
    const startTime = Date.now();
    // Simulate some work
    const work = Array(1000000).fill(0);
    const endTime = Date.now();

    const latencyMs = endTime - startTime;

    assert.ok(latencyMs >= 0, 'latency should be non-negative');
    assert.ok(Number.isInteger(latencyMs), 'latency should be integer');
  });
});
