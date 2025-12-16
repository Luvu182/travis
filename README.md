# J.A.R.V.I.S - Vietnamese Executive Assistant with Long-Term Memory

AI-powered chatbot with long-term memory using mem0, designed for Telegram and Lark Suite group chats.

## Features

- **Long-term memory** using mem0 for intelligent information extraction
- **Multi-platform** support for Telegram and Lark Suite
- **Intelligent extraction** of tasks, decisions, and deadlines from conversations
- **Vietnamese language** optimized responses
- **Hybrid AI** with Gemini Flash (primary) and OpenAI (fallback)
- **Self-hosted** on VPS with PostgreSQL + pgvector

## Tech Stack

- **Backend**: Hono (TypeScript web framework)
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Drizzle ORM
- **Memory**: mem0 with Vercel AI SDK
- **LLM**: Google Gemini Flash, OpenAI GPT
- **Embeddings**: Gemini embedding-001 (1536D)
- **Bots**: grammY (Telegram), @larksuiteoapi/node-sdk (Lark)
- **Monorepo**: Turborepo + pnpm workspaces

## Project Structure

```
J.A.R.V.I.S/
├── apps/
│   └── api/              # Hono API server
├── packages/
│   ├── config/           # Environment validation
│   ├── db/               # Database client & schema
│   └── core/             # AI & memory logic
└── docker/               # PostgreSQL + pgvector
```

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start PostgreSQL**
   ```bash
   docker compose -f docker/docker-compose.dev.yml up -d
   ```

4. **Run database migrations**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## Development

- **Build**: `pnpm build`
- **Dev server**: `pnpm dev`
- **Database migrations**: `pnpm db:generate && pnpm db:migrate`
- **Database studio**: `pnpm db:studio`

## Environment Variables

See `.env.example` for required variables:
- `TELEGRAM_BOT_TOKEN` - Telegram Bot API token
- `LARK_APP_ID`, `LARK_APP_SECRET` - Lark Suite app credentials
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `DATABASE_URL` - PostgreSQL connection string
- `WEBHOOK_DOMAIN` - Public webhook domain

## API Endpoints

- `GET /health` - Health check (API + database)
- `POST /webhook/telegram` - Telegram webhook
- `POST /webhook/lark` - Lark Suite webhook

## License

Private project
