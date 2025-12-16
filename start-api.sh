#!/bin/bash
cd /var/www/jarvis

# Load environment variables
set -a
source .env
set +a

# Start API
cd apps/api
exec node --import tsx src/index.ts
