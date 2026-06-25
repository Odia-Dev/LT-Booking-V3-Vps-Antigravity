#!/bin/bash

# ==============================================================================
# LT-Booking-V3 Automated Production Deployment Script
# ==============================================================================
# Safe execution modes: Exit immediately if any command exits with non-zero status
set -e

# Terminal colors for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions for structured printing
log_info() {
    echo -e "${BLUE}[$(date +'%F %T')] [INFO] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%F %T')] [SUCCESS] $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%F %T')] [WARNING] $1${NC}"
}

log_err() {
    echo -e "${RED}[$(date +'%F %T')] [ERROR] $1${NC}"
}

# Catch unexpected exit code failures
handle_error() {
    local exit_code=$?
    log_err "Deployment aborted. Error occurred on line $1. Exit code: $exit_code."
    exit $exit_code
}
trap 'handle_error $LINENO' ERR

echo "===================================="
echo "LT-Booking-V3 Deployment Started"
echo "===================================="

# ------------------------------------------------------------------------------
# 1. Structure Verification
# ------------------------------------------------------------------------------
log_info "Verifying directory structures..."
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -f "ecosystem.config.js" ]; then
    log_err "Structure check failed. Missing backend/, frontend/, or ecosystem.config.js."
    exit 1
fi
log_success "Structure verification complete."

# ------------------------------------------------------------------------------
# 2. Git Synchronization
# ------------------------------------------------------------------------------
log_info "Running Git status checks..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
LATEST_COMMIT=$(git rev-parse --short HEAD)
log_info "Current Branch: $CURRENT_BRANCH"
log_info "Latest Commit Hash: $LATEST_COMMIT"

log_info "Fetching update logs from origin..."
git fetch origin

log_info "Pulling updates from origin develop..."
# Temporary disable set -e to handle pull failures gracefully
set +e
git pull origin develop
PULL_STATUS=$?
set -e

if [ $PULL_STATUS -ne 0 ]; then
    log_err "Git pull failed. Aborting deployment."
    exit 1
fi
log_success "Git update pulled successfully."

# ------------------------------------------------------------------------------
# 3. Backend Deployment
# ------------------------------------------------------------------------------
log_info "Deploying Backend applications..."
cd backend

log_info "Installing backend dependencies..."
npm install --omit=dev

log_info "Compiling Prisma database client..."
npx prisma generate

log_info "Validating Prisma schema settings..."
npx prisma validate

log_info "Applying database migrations..."
npx prisma migrate deploy

log_info "Building Express backend server..."
npm run build

log_success "Backend build compiled successfully."
cd ..

# ------------------------------------------------------------------------------
# 4. Frontend Deployment
# ------------------------------------------------------------------------------
log_info "Deploying Frontend applications..."
cd frontend

log_info "Installing frontend dependencies..."
npm install --omit=dev

log_info "Building Next.js application..."
npm run build

log_success "Frontend build compiled successfully."
cd ..

# ------------------------------------------------------------------------------
# 5. PM2 Reload
# ------------------------------------------------------------------------------
log_info "Reloading PM2 applications list..."
set +e
pm2 reload ecosystem.config.js
RELOAD_STATUS=$?
set -e

if [ $RELOAD_STATUS -ne 0 ]; then
    log_warn "PM2 reload failed. Attempting full start..."
    pm2 start ecosystem.config.js
fi
pm2 save
log_success "Processes reloaded and saved successfully."

# ------------------------------------------------------------------------------
# 6. Post-Deployment Verification Checks
# ------------------------------------------------------------------------------
log_info "Performing integration tests checks..."

BACKEND_HEALTH="FAIL"
FRONTEND_HEALTH="FAIL"
PM2_HEALTH="FAIL"
DATABASE_HEALTH="FAIL"

# Verify Express API health check endpoint (Port 5000)
set +e
BACKEND_RESP=$(curl -s http://127.0.0.1:5000/health)
if [[ "$BACKEND_RESP" == *"\"success\":true"* ]]; then
    BACKEND_HEALTH="PASS"
    DATABASE_HEALTH="PASS" # Database queries pass if health check passes
fi

# Verify Next.js Server headers check (Port 3000)
FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
if [ "$FRONTEND_CODE" -eq 200 ] || [ "$FRONTEND_CODE" -eq 301 ]; then
    FRONTEND_HEALTH="PASS"
fi

# Verify PM2 running state status
PM2_STATUS_COUNT=$(pm2 status | grep -c "online" || true)
if [ "$PM2_STATUS_COUNT" -ge 2 ]; then
    PM2_HEALTH="PASS"
fi
set -e

# ------------------------------------------------------------------------------
# 7. Deployment Summary
# ------------------------------------------------------------------------------
echo -e "\n===================================="
echo -e "         Deployment Complete"
echo -e "===================================="

if [ "$BACKEND_HEALTH" == "PASS" ]; then
    echo -e "Backend:  ${GREEN}PASS${NC}"
else
    echo -e "Backend:  ${RED}FAIL${NC}"
fi

if [ "$FRONTEND_HEALTH" == "PASS" ]; then
    echo -e "Frontend: ${GREEN}PASS${NC}"
else
    echo -e "Frontend: ${RED}FAIL${NC}"
fi

if [ "$PM2_HEALTH" == "PASS" ]; then
    echo -e "PM2:      ${GREEN}PASS${NC}"
else
    echo -e "PM2:      ${RED}FAIL${NC}"
fi

if [ "$DATABASE_HEALTH" == "PASS" ]; then
    echo -e "Database: ${GREEN}PASS${NC}"
else
    echo -e "Database: ${RED}FAIL${NC}"
fi

if [ "$BACKEND_HEALTH" == "PASS" ] && [ "$FRONTEND_HEALTH" == "PASS" ]; then
    echo -e "Health:   ${GREEN}PASS${NC}"
    log_success "System fully operational."
    exit 0
else
    echo -e "Health:   ${RED}FAIL${NC}"
    log_err "Verification checks failed. Please check logs."
    exit 1
fi
