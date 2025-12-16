import { z } from 'zod';
// Note: .env is loaded by each app's entry point before importing this module

const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // Webhook
  WEBHOOK_DOMAIN: z.string().url(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),

  // Lark
  LARK_APP_ID: z.string(),
  LARK_APP_SECRET: z.string(),
  LARK_ENCRYPT_KEY: z.string().optional(),
  LARK_VERIFICATION_TOKEN: z.string().optional(),

  // LLM
  GEMINI_API_KEY: z.string(),
  OPENAI_API_KEY: z.string(),

  // mem0
  MEM0_API_KEY: z.string().optional(),

  // Database
  DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

// Lazy load env to allow dotenv.config() to run first
let _env: Env | null = null;

function getEnv(): Env {
  if (!_env) {
    _env = envSchema.parse(process.env);
  }
  return _env;
}

export const env = new Proxy({} as Env, {
  get: (target, prop) => {
    return getEnv()[prop as keyof Env];
  }
});
