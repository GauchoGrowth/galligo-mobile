#!/bin/bash

# GalliGo iOS Build Script
# Standardized workflow for building and running the iOS app
# Based on .claude/commands/build.md logic

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
TARGET="simulator"
DEVICE_NAME="iPhone 16 Pro"

while [[ $# -gt 0 ]]; do
    case $1 in
        --device)
            TARGET="device"
            shift
            ;;
        --sim|--simulator)
            TARGET="simulator"
            shift
            ;;
        --name)
            DEVICE_NAME="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--device|--simulator] [--name <device-name>]"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📱 GalliGo iOS Build & Deploy${NC}"
echo -e "   Target: ${YELLOW}$TARGET${NC}"
if [ "$TARGET" = "simulator" ]; then
    echo -e "   Device: ${YELLOW}$DEVICE_NAME${NC}"
fi
echo ""

# Step 1: Verify Node version
echo "1️⃣  Verifying Node.js version..."
if node -v | grep -q "v20"; then
    echo -e "   ${GREEN}✓${NC} Node version: $(node -v)"
else
    echo -e "   ${RED}✗${NC} ERROR: Node 20 required. Current: $(node -v)"
    echo "   Run: nvm use 20"
    exit 1
fi

# Step 2: Kill existing Metro processes
echo ""
echo "2️⃣  Cleaning up Metro processes..."
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
killall -9 node 2>/dev/null || true
echo -e "   ${GREEN}✓${NC} Metro processes cleaned"

# Step 3: Clear Metro cache
echo ""
echo "3️⃣  Clearing Metro cache..."
rm -rf .expo
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
echo -e "   ${GREEN}✓${NC} Metro cache cleared"

# Step 4: Start Metro bundler in background
echo ""
echo "4️⃣  Starting Metro bundler..."
npx expo start --dev-client --clear > .expo-start.log 2>&1 &
METRO_PID=$!
echo -e "   ${GREEN}✓${NC} Metro starting (PID: $METRO_PID)"

# Wait for Metro to be ready
echo "   Waiting for Metro to initialize..."
sleep 5

# Check if Metro is running
if ! lsof -ti :8081 > /dev/null 2>&1; then
    echo -e "   ${RED}✗${NC} Metro failed to start. Check .expo-start.log"
    cat .expo-start.log
    exit 1
fi
echo -e "   ${GREEN}✓${NC} Metro is ready on port 8081"

# Step 5: Build and run iOS app
echo ""
echo "5️⃣  Building iOS app..."

if [ "$TARGET" = "device" ]; then
    echo -e "   ${YELLOW}Building for physical device...${NC}"
    npx expo run:ios --device
else
    echo -e "   ${YELLOW}Building for simulator: $DEVICE_NAME${NC}"
    npx expo run:ios --device "$DEVICE_NAME"
fi

BUILD_SUCCESS=$?

if [ $BUILD_SUCCESS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"

    # Step 6: Network verification (for simulator)
    if [ "$TARGET" = "simulator" ]; then
        echo ""
        echo "6️⃣  Verifying network connectivity..."
        sleep 3

        # Check if app can reach localhost
        if curl -s http://localhost:8081/status > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓${NC} Metro is accessible"
        else
            echo -e "   ${YELLOW}⚠️${NC}  Cannot reach Metro server"
            echo "   If app shows connection error, try restarting simulator"
        fi

        # Check internet connectivity
        if curl -s http://www.google.com > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓${NC} Internet access OK"
        else
            echo -e "   ${RED}✗${NC} No internet access"
            echo "   Simulator may need network reset:"
            echo "   xcrun simctl shutdown booted && xcrun simctl boot \"$DEVICE_NAME\""
        fi
    fi

    echo ""
    echo -e "${GREEN}🎉 GalliGo is running!${NC}"
    echo ""
    echo "Metro bundler is running in the background (PID: $METRO_PID)"
    echo "To stop Metro: kill $METRO_PID"
    echo "To view Metro logs: tail -f .expo-start.log"
    echo ""

else
    echo ""
    echo -e "${RED}❌ Build failed${NC}"
    echo "Check errors above or view full log: .expo-start.log"

    # Kill Metro on failed build
    kill $METRO_PID 2>/dev/null || true
    exit 1
fi
