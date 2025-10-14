#!/bin/bash
set -e
echo "🔧 Setting up correct pnpm & Node versions (without corepack)..."

# Uninstall any global pnpm
npm uninstall -g pnpm || true

# Install pnpm 9.7.1 manually
npm install -g pnpm@9.7.1

echo "✅ Using pnpm version:"
pnpm -v

echo "✅ Using Node version:"
node -v

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile=false