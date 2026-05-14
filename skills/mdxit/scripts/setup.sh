#!/usr/bin/env bash
set -e

# MDXit runtime setup — run once after installing the skill.
# Usage: bash skills/mdxit/scripts/setup.sh

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

if [ ! -f "$ROOT/package.json" ]; then
  echo "Error: not in MDXit project root. Run this from the cloned mdxit repo."
  exit 1
fi

echo "==> Installing dependencies..."
cd "$ROOT"
npm install

echo "==> Building..."
npm run build

echo ""
echo "Done. Preview with:"
echo "  node dist/cli/index.js preview examples"
echo "  node dist/cli/index.js preview docs/"
echo ""
echo "Or dev mode with HMR:"
echo "  npm run dev"
