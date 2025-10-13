#!/bin/bash
# Force correct Node and pnpm versions on Vercel build runners

echo "🔧 Enabling correct Node and pnpm versions..."
corepack enable
corepack prepare pnpm@9.7.1 --activate
node -v
pnpm -v