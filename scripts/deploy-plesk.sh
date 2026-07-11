#!/usr/bin/env bash
# Linux Plesk only. On Windows Plesk use: scripts/deploy-plesk.bat
set -euo pipefail

cd "$(dirname "$0")/.."

export PATH="/opt/plesk/node/20/bin:${PATH}"
export NODE_ENV=production

echo "==> Node: $(node -v)"
echo "==> npm:  $(npm -v)"

echo "==> Install dependencies"
npm ci --omit=dev

echo "==> Prisma generate"
npx prisma generate

if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null || true)" ]; then
  echo "==> Prisma migrate deploy"
  npx prisma migrate deploy
else
  echo "==> No migrations folder — skipping migrate (use db push manually if needed)"
fi

echo "==> Build Next.js"
npm run build

echo "==> Deploy done. Restart Node.js app in Plesk if it did not auto-restart."
