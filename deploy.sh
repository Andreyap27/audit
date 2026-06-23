#!/bin/bash
set -e

# ─── Warna output ───────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"


log()   { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   IT Audit — Auto Deploy${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# ─── 1. Git Pull ─────────────────────────────────────────────────────────────
log "Step 1/5 — Git pull..."
cd "$SCRIPT_DIR"
git pull || error "Git pull gagal"
ok "Git pull berhasil"

# ─── 2. Install dependencies backend ────────────────────────────────────────
log "Step 2/5 — Install dependencies backend..."
cd "$BACKEND_DIR"
npm install || error "npm install backend gagal"
ok "Dependencies backend selesai"

# ─── 3. Build backend ────────────────────────────────────────────────────────
log "Step 3/5 — Build backend (Prisma generate + TypeScript)..."
npm run build || error "Build backend gagal"
ok "Build backend selesai"

# ─── 4. Install dependencies & build frontend ────────────────────────────────
log "Step 4/5 — Install dependencies & build frontend..."
cd "$FRONTEND_DIR"
npm install || error "npm install frontend gagal"
npm run build || error "Build frontend gagal"
ok "Build frontend selesai"

# ─── 5. Restart PM2 ──────────────────────────────────────────────────────────
log "Step 5/5 — Restart PM2..."
pm2 restart all || error "Restart PM2 gagal"
pm2 save
ok "PM2 restarted"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Deploy selesai!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
pm2 list
