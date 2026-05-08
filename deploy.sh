# ============================================
# Nexus EDU — Production Deploy Script (VPS)
# Usage: bash deploy.sh
# ============================================

set -e  # Exit on any error

echo "🚀 Starting Nexus EDU Production Deploy..."

# ─── Colors ───────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ─── Pre-flight checks ────────────────────────────────────────
[ ! -f ".env" ] && fail ".env file not found. Copy .env.production → .env and fill in values."
[ -z "$JWT_SECRET" ] && warn "JWT_SECRET not set in environment — will use value from .env"

ok "Pre-flight checks passed"

# ─── Pull latest code ─────────────────────────────────────────
if [ -d ".git" ]; then
    echo "📦 Pulling latest code..."
    git pull origin main || warn "Git pull failed — continuing with current code"
fi

# ─── Build & start with Docker Compose ───────────────────────
echo "🐳 Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Stopping old containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans

echo "▶️  Starting services..."
docker compose -f docker-compose.prod.yml up -d

# ─── Wait for DB ──────────────────────────────────────────────
echo "⏳ Waiting for database to be ready..."
sleep 10

# ─── Run Prisma migrations ────────────────────────────────────
echo "🗃️  Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy
ok "Database migrations applied"

# ─── Health check ─────────────────────────────────────────────
echo "🏥 Running health check..."
sleep 5

HEALTH=$(curl -sf http://localhost:4000/health 2>/dev/null || echo "FAIL")
if [[ "$HEALTH" == *"ok"* ]]; then
    ok "API is healthy: $HEALTH"
else
    warn "API health check returned: $HEALTH"
    echo "   Check logs: docker compose -f docker-compose.prod.yml logs api"
fi

# ─── Show running containers ──────────────────────────────────
echo ""
echo "📊 Running containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
ok "Deployment complete! 🎉"
echo ""
echo "📌 Useful commands:"
echo "   View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "   API logs:     docker compose -f docker-compose.prod.yml logs -f api"
echo "   Stop all:     docker compose -f docker-compose.prod.yml down"
echo "   Restart:      docker compose -f docker-compose.prod.yml restart api"
