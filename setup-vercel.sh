#!/bin/bash
echo "🔧 Forcing correct pnpm & Node versions..."
corepack enable
corepack prepare pnpm@9.7.1 --activate
pnpm -v
node -v
pnpm install --frozen-lockfile=false