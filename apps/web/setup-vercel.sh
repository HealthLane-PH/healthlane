#!/bin/bash
set -e
echo "🔧 Forcing correct pnpm & Node versions..."

corepack enable
corepack prepare pnpm@9.7.1 --activate

# Ensure correct binary paths
export PATH="$(corepack where pnpm)/bin:$PATH"

echo "✅ Using pnpm version:"
pnpm -v

echo "✅ Using Node version:"
node -v

# Fix for 'env: node: File name too long' bug
export NODE=$(which node)

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile=false --node-path="$NODE"