#!/bin/bash
echo "🔧 Forcing correct pnpm & Node versions..."
set -e

corepack enable
corepack prepare pnpm@9.7.1 --activate

# Tell the shell to use the newly prepared pnpm binary
export PATH="$(corepack where pnpm)/bin:$PATH"

echo "✅ Using pnpm version:"
pnpm -v

echo "✅ Using Node version:"
node -v

# Run the actual install using the correct pnpm
pnpm install --frozen-lockfile=false