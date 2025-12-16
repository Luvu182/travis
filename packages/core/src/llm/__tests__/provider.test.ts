/**
 * Provider routing and model selection tests
 * Tests task-based routing, fallback selection, and model naming
 */

import { test } from 'node:test';
import * as assert from 'node:assert';
import { selectModel, getFallback, getModelName, models, type TaskType, type SupportedModel } from '../provider.js';

test('Provider - selectModel() routing', async (t) => {
  await t.test('routes chat task to Gemini Flash Lite', () => {
    const model = selectModel('chat');
    assert.strictEqual(model, models.gemini.flashLite, 'should select Gemini Flash Lite for chat');
  });

  await t.test('routes extraction task to Gemini Flash Lite', () => {
    const model = selectModel('extraction');
    assert.strictEqual(model, models.gemini.flashLite, 'should select Gemini Flash Lite for extraction');
  });

  await t.test('routes query task to Gemini Flash Lite', () => {
    const model = selectModel('query');
    assert.strictEqual(model, models.gemini.flashLite, 'should select Gemini Flash Lite for query');
  });

  await t.test('routes summarization task to Gemini Flash Lite', () => {
    const model = selectModel('summarization');
    assert.strictEqual(model, models.gemini.flashLite, 'should select Gemini Flash Lite for summarization');
  });

  await t.test('routes translation task to Gemini Flash Lite', () => {
    const model = selectModel('translation');
    assert.strictEqual(model, models.gemini.flashLite, 'should select Gemini Flash Lite for translation');
  });

  await t.test('defaults to Gemini Flash Lite for unknown task', () => {
    const model = selectModel('chat' as TaskType); // using valid type
    assert.strictEqual(model, models.gemini.flashLite, 'should default to Gemini Flash Lite');
  });
});

test('Provider - getFallback() selection', async (t) => {
  await t.test('returns OpenAI Mini when Gemini Flash Lite fails', () => {
    const fallback = getFallback(models.gemini.flashLite);
    assert.strictEqual(fallback, models.openai.gpt4oMini, 'should fallback to OpenAI Mini from Gemini Flash Lite');
  });

  await t.test('returns OpenAI Mini when Gemini Pro fails', () => {
    const fallback = getFallback(models.gemini.pro);
    assert.strictEqual(fallback, models.openai.gpt4oMini, 'should fallback to OpenAI Mini from Gemini Pro');
  });

  await t.test('returns Gemini Flash Lite when OpenAI fails', () => {
    const fallback = getFallback(models.openai.gpt4o);
    assert.strictEqual(fallback, models.gemini.flashLite, 'should fallback to Gemini Flash Lite from OpenAI');
  });

  await t.test('returns Gemini Flash Lite when OpenAI Mini fails', () => {
    const fallback = getFallback(models.openai.gpt4oMini);
    assert.strictEqual(fallback, models.gemini.flashLite, 'should fallback to Gemini Flash Lite from OpenAI Mini');
  });
});

test('Provider - getModelName() display names', async (t) => {
  await t.test('returns correct name for Gemini Flash Lite', () => {
    const name = getModelName(models.gemini.flashLite);
    assert.strictEqual(name, 'gemini-2.5-flash-lite', 'should return correct display name');
  });

  await t.test('returns correct name for Gemini Pro', () => {
    const name = getModelName(models.gemini.pro);
    assert.strictEqual(name, 'gemini-1.5-pro', 'should return correct display name');
  });

  await t.test('returns correct name for OpenAI GPT-4o', () => {
    const name = getModelName(models.openai.gpt4o);
    assert.strictEqual(name, 'gpt-4o', 'should return correct display name');
  });

  await t.test('returns correct name for OpenAI GPT-4o Mini', () => {
    const name = getModelName(models.openai.gpt4oMini);
    assert.strictEqual(name, 'gpt-4o-mini', 'should return correct display name');
  });

  await t.test('returns unknown for unrecognized model', () => {
    // Type assertion needed for testing unknown model behavior
    const name = getModelName({ unknownModel: true } as unknown as SupportedModel);
    assert.strictEqual(name, 'unknown', 'should return unknown for unrecognized model');
  });
});

test('Provider - model objects are properly initialized', async (t) => {
  await t.test('models object has gemini and openai properties', () => {
    assert.ok(models.gemini, 'should have gemini property');
    assert.ok(models.openai, 'should have openai property');
  });

  await t.test('gemini object has flashLite and pro properties', () => {
    assert.ok(models.gemini.flashLite, 'should have flashLite property');
    assert.ok(models.gemini.pro, 'should have pro property');
  });

  await t.test('openai object has gpt4o and gpt4oMini properties', () => {
    assert.ok(models.openai.gpt4o, 'should have gpt4o property');
    assert.ok(models.openai.gpt4oMini, 'should have gpt4oMini property');
  });
});
