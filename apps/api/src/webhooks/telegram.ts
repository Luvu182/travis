import { Hono } from 'hono';

export const telegramWebhook = new Hono();

// Telegram webhook will be implemented in Phase 05
telegramWebhook.post('/', async (c) => {
  return c.json({ message: 'Telegram webhook placeholder - Phase 05' });
});
