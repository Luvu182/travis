import { Hono } from 'hono';

export const larkWebhook = new Hono();

// Lark webhook will be implemented in Phase 06
larkWebhook.post('/', async (c) => {
  return c.json({ message: 'Lark webhook placeholder - Phase 06' });
});
