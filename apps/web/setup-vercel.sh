#!/bin/bash
set -e
echo "🔧 Forcing correct pnpm & Node versions..."

corepack enable
corepack prepare pnpm@9.7.1 --activate

# Ensure the newly prepared pnpm binary takes priority
export PATH="$(corepack where pnpm)/bin:$PATH"

echo "✅ Using pnpm version:"
pnpm -v || true

echo "✅ Using Node version:"
node -v || true

# Run install using correct pnpm
pnpm install --frozen-lockfile=false