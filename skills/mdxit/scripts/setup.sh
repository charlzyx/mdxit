#!/usr/bin/env bash
set -e
# MDXit runtime setup — run once after npx skills add charlzyx/mdxit
# Usage: bash skills/mdxit/scripts/setup.sh

RUNTIME="$(cd "$(dirname "$0")/../runtime" && pwd)"

echo "==> Installing dependencies..."
cd "$RUNTIME"
npm install

echo "==> Building..."
npm run build

echo ""
echo "Done. Preview with:"
echo "  cd $RUNTIME"
echo "  node dist/cli/index.js preview <file-or-dir>"
echo "  npm run dev"
