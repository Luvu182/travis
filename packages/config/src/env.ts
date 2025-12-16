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

  // Lark (optional - can be added later)
  LARK_APP_ID: z.string().optional(),
  LARK_APP_SECRET: z.string().optional(),
  LARK_ENCRYPT_KEY: z.string().optional(),
  LARK_VERIFICATION_TOKEN: z.string().optional(),

  // LLM
  GEMINI_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),

  // Memory Service
  MEMORY_SERVICE_URL: z.string().url().default('http://localhost:8000'),

  // Database
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string().default('jarvis'),

  // Dashboard Auth (JWT)
  JWT_SECRET: z.string().min(32).default('change-me-in-production-min-32-chars'),
  JWT_REFRESH_SECRET: z.string().min(32).default('change-me-refresh-secret-32-chars'),
  DASHBOARD_URL: z.string().url().default('http://localhost:3001'),
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
