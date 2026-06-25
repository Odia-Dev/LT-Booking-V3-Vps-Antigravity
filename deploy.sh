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
# 2. Backend Deployment
# ------------------------------------------------------------------------------
log_info "Deploying Backend applications..."
cd backend

log_info "Installing backend dependencies (including devDependencies for build)..."
npm install --include=dev

log_info "Verifying TypeScript installation..."
if ! npm ls typescript >/dev/null 2>&1; then
    log_err "TypeScript is missing from backend node_modules. Aborting deployment."
    exit 1
fi

log_info "Verifying tsc compiler..."
npx tsc --version

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
# 3. Frontend Deployment
# ------------------------------------------------------------------------------
log_info "Deploying Frontend applications..."
cd frontend

log_info "Installing frontend dependencies (including devDependencies for build)..."
npm install --include=dev

log_info "Building Next.js application..."
npm run build

log_success "Frontend build compiled successfully."
cd ..

# ------------------------------------------------------------------------------
# 4. PM2 Reload
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
# 5. Post-Deployment Verification Checks
# ------------------------------------------------------------------------------
log_info "Performing integration tests checks..."

BACKEND_HEALTH="FAIL"
FRONTEND_HEALTH="FAIL"
PM2_HEALTH="FAIL"
DATABASE_HEALTH="FAIL"

log_info "Waiting for backend to start up (up to 30 seconds)..."
retries=15
backend_online=0
while [ $retries -gt 0 ]; do
    log_info "Waiting for backend..."
    BACKEND_RESP=$(curl -s http://127.0.0.1:5000/health || echo "failed")
    if [[ "$BACKEND_RESP" == *"\"success\":true"* ]]; then
        backend_online=1
        break
    fi
    sleep 2
    retries=$((retries - 1))
done

if [ $backend_online -eq 1 ]; then
    log_success "Backend online."
    BACKEND_HEALTH="PASS"
    DATABASE_HEALTH="PASS"
else
    log_err "Backend timeout expired."
fi

log_info "Waiting for frontend to start up (up to 30 seconds)..."
retries=15
frontend_online=0
while [ $retries -gt 0 ]; do
    log_info "Waiting for frontend..."
    FRONTEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 || echo "000")
    if [ "$FRONTEND_CODE" -eq 200 ] || [ "$FRONTEND_CODE" -eq 301 ]; then
        frontend_online=1
        break
    fi
    sleep 2
    retries=$((retries - 1))
done

if [ $frontend_online -eq 1 ]; then
    log_success "Frontend online."
    FRONTEND_HEALTH="PASS"
else
    log_err "Frontend timeout expired."
fi

# Verify PM2 running state status
PM2_STATUS_COUNT=$(pm2 status | grep -c "online" || echo "0")
if [ "$PM2_STATUS_COUNT" -ge 2 ]; then
    PM2_HEALTH="PASS"
fi

# ------------------------------------------------------------------------------
# 6. Deployment Summary
# ------------------------------------------------------------------------------
echo -e "\n===================================="
echo -e "         Deployment Summary"
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

if [ "$BACKEND_HEALTH" == "PASS" ] && [ "$FRONTEND_HEALTH" == "PASS" ] && [ "$PM2_HEALTH" == "PASS" ] && [ "$DATABASE_HEALTH" == "PASS" ]; then
    echo -e "Overall:  ${GREEN}PASS${NC}"
    log_success "System fully operational."
    exit 0
else
    echo -e "Overall:  ${RED}FAIL${NC}"
    log_err "Verification checks failed. Please check logs."
    exit 1
fi
