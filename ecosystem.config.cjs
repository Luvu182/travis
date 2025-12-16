/**
 * PM2 Ecosystem Configuration for Jarvis
 *
 * Best Practice Setup:
 * - Use dotenv to load .env at config time
 * - Pass env vars explicitly to each app
 * - Standalone Next.js for dashboard (production optimized)
 * - tsx runtime for API (development friendly, TypeScript native)
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 restart jarvis-api jarvis-dashboard
 *   pm2 logs
 *   pm2 monit
 */

const path = require('path');
const fs = require('fs');

// Load .env manually for PM2 config
const envPath = path.join(__dirname, '.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const LOGS_DIR = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

module.exports = {
  apps: [
    // ===================
    // API Server (Port 3000)
    // Built with: pnpm --filter @jarvis/api build
    // ===================
    {
      name: 'jarvis-api',
      cwd: path.join(__dirname, 'apps/api'),
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: envVars.PORT || 3000,
        // Database
        DATABASE_URL: envVars.DATABASE_URL,
        DB_HOST: envVars.DB_HOST || 'localhost',
        DB_PORT: envVars.DB_PORT || '5432',
        DB_USER: envVars.DB_USER || 'postgres',
        DB_PASSWORD: envVars.DB_PASSWORD,
        DB_NAME: envVars.DB_NAME || 'jarvis',
        // LLM
        GEMINI_API_KEY: envVars.GEMINI_API_KEY,
        OPENAI_API_KEY: envVars.OPENAI_API_KEY || '',
        // Webhook
        WEBHOOK_DOMAIN: envVars.WEBHOOK_DOMAIN,
        // Telegram
        TELEGRAM_BOT_TOKEN: envVars.TELEGRAM_BOT_TOKEN,
        TELEGRAM_WEBHOOK_SECRET: envVars.TELEGRAM_WEBHOOK_SECRET,
        // Lark
        LARK_APP_ID: envVars.LARK_APP_ID,
        LARK_APP_SECRET: envVars.LARK_APP_SECRET,
        LARK_ENCRYPT_KEY: envVars.LARK_ENCRYPT_KEY,
        LARK_VERIFICATION_TOKEN: envVars.LARK_VERIFICATION_TOKEN,
        // Memory
        MEMORY_SERVICE_URL: envVars.MEMORY_SERVICE_URL,
        // Auth
        AUTH_SECRET: envVars.AUTH_SECRET,
        // Dashboard (for CORS)
        DASHBOARD_URL: envVars.DASHBOARD_URL,
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      // Logs
      error_file: path.join(LOGS_DIR, 'api-error.log'),
      out_file: path.join(LOGS_DIR, 'api-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },

    // ===================
    // Dashboard (Port 3001) - Next.js standalone
    // ===================
    {
      name: 'jarvis-dashboard',
      cwd: path.join(__dirname, 'apps/dashboard/.next/standalone'),
      script: 'apps/dashboard/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: envVars.DASHBOARD_PORT || 3001,
        HOSTNAME: '0.0.0.0',
        // NextAuth configuration
        AUTH_SECRET: envVars.AUTH_SECRET,
        AUTH_TRUST_HOST: 'true',
        NEXTAUTH_URL: envVars.WEBHOOK_DOMAIN || 'https://jarvis.9solution.vn',
        // Database
        DATABASE_URL: envVars.DATABASE_URL,
        // API URL for dashboard to call
        API_URL: `http://localhost:${envVars.PORT || 3000}`,
      },
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
      // Logs
      error_file: path.join(LOGS_DIR, 'dashboard-error.log'),
      out_file: path.join(LOGS_DIR, 'dashboard-out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
