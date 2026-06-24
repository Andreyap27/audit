#!/bin/bash
set -e

REPO_DIR="/opt/audit"

echo "======================================"
echo "  Audit Ko Budy Deploy Script"
echo "======================================"

# ── Step 1: Stop PM2 (skip if already stopped) ───
echo ""
echo "[1/7] Checking PM2 status..."
PM2_COUNT=$(pm2 list 2>/dev/null | grep -c "online\|stopped\|errored" || true)
if [ "$PM2_COUNT" -gt 0 ]; then
  pm2 stop all
  echo "✓ PM2 stopped"
else
  echo "✓ PM2 already stopped, skipping"
fi

# ── Step 2: Git Pull Production ──────────────────
echo ""
echo "[2/7] Pulling latest code..."
cd "$REPO_DIR"
git stash 2>/dev/null || true
git pull
git stash pop 2>/dev/null || true
echo "✓ Repo updated"

# ── Step 3: Install Production Backend Packages ──
echo ""
echo "[3/7] Installing backend packages..."
cd "$REPO_DIR/backend"
npm install
chmod -R +x node_modules/.bin/
echo "✓ Backend packages ok"

# ── Step 4: Build Production Backend ─────────────
echo ""
echo "[4/7] Building production backend..."
npm run build
echo "✓ Production backend built"

# ── Step 4b: Run Prisma Migrations ───────────────
echo ""
echo "[4b] Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✓ Prisma migrations applied"
else
  echo "⚠️  Prisma migration failed. Check manually:"
  echo "   cd $REPO_DIR/backend && npx prisma migrate deploy"
  echo "   Continuing deploy..."
fi

# ── Step 5: Install Production Frontend Packages ─
echo ""
echo "[5/7] Installing frontend packages..."
cd "$REPO_DIR/frontend"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
chmod -R +x node_modules/.bin/
echo "✓ Frontend packages ok"

# ── Step 6: Build Production Frontend ────────────
echo ""
echo "[6/7] Building production frontend..."
npm run build
echo "✓ Production frontend built"

# ── Step 7: Start PM2 ────────────────────────────
echo ""
echo "[7/7] Starting PM2..."
pm2 start /opt/audit/ecosystem.config.js
pm2 save
echo "✓ PM2 started"

# ── Done ─────────────────────────────────────────
echo ""
echo "======================================"
echo "  Deploy selesai!"
echo "======================================"
pm2 list
