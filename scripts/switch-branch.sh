#!/bin/bash

# GalliGo Branch Switching Script
# Intelligently switches branches and handles dependency/native code changes
# Usage: ./scripts/switch-branch.sh <branch-name>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}Error: Branch name required${NC}"
    echo "Usage: ./scripts/switch-branch.sh <branch-name>"
    exit 1
fi

TARGET_BRANCH=$1
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🔄 GalliGo Branch Switching Workflow${NC}"
echo -e "   Current: ${YELLOW}$CURRENT_BRANCH${NC}"
echo -e "   Target:  ${YELLOW}$TARGET_BRANCH${NC}"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    git status -s
    echo ""
    read -p "Stash changes and continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before switching to $TARGET_BRANCH"
        echo -e "${GREEN}✓${NC} Changes stashed"
    else
        echo -e "${RED}Aborting. Please commit or stash your changes first.${NC}"
        exit 1
    fi
fi

# Save current package.json and app.json for comparison
echo "📸 Capturing current state..."
cp package.json /tmp/galligo-package-old.json
cp app.json /tmp/galligo-app-old.json

# Switch branch
echo ""
echo "🔀 Switching to branch: $TARGET_BRANCH..."
if ! git checkout "$TARGET_BRANCH"; then
    echo -e "${RED}Error: Failed to checkout branch${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Switched to $TARGET_BRANCH"
echo ""

# Compare configurations to determine rebuild strategy
PACKAGE_DIFF=$(diff -q package.json /tmp/galligo-package-old.json || true)
APP_DIFF=$(diff -q app.json /tmp/galligo-app-old.json || true)

# Determine rebuild strategy
NEEDS_NATIVE_REBUILD=false
NEEDS_JS_REFRESH=false

if [ -n "$PACKAGE_DIFF" ]; then
    echo -e "${YELLOW}📦 package.json has changed${NC}"

    # Check if native dependencies changed
    if git diff $CURRENT_BRANCH..$TARGET_BRANCH package.json | grep -E "react-native-|expo-|@shopify" > /dev/null; then
        echo -e "${YELLOW}   ⚠️  Native dependencies detected${NC}"
        NEEDS_NATIVE_REBUILD=true
    else
        echo -e "${BLUE}   ℹ️  Only JS dependencies changed${NC}"
        NEEDS_JS_REFRESH=true
    fi
fi

if [ -n "$APP_DIFF" ]; then
    echo -e "${YELLOW}⚙️  app.json has changed (config plugins or settings)${NC}"
    NEEDS_NATIVE_REBUILD=true
fi

# Clean up temp files
rm /tmp/galligo-package-old.json /tmp/galligo-app-old.json

echo ""

# Execute appropriate workflow
if [ "$NEEDS_NATIVE_REBUILD" = true ]; then
    echo -e "${RED}🔨 NATIVE REBUILD REQUIRED${NC}"
    echo "   This will take 2-5 minutes..."
    echo ""

    # Stop Metro if running
    echo "1️⃣  Stopping Metro bundler..."
    lsof -ti :8081 | xargs kill -9 2>/dev/null || true

    # Install dependencies
    echo ""
    echo "2️⃣  Installing npm dependencies..."
    npm install

    # Clear Metro cache
    echo ""
    echo "3️⃣  Clearing Metro cache..."
    rm -rf .expo
    rm -rf $TMPDIR/metro-* 2>/dev/null || true

    # Regenerate native project
    echo ""
    echo "4️⃣  Regenerating iOS project from app.json..."
    npx expo prebuild --clean --platform ios

    # Install pods
    echo ""
    echo "5️⃣  Installing CocoaPods..."
    cd ios && pod install && cd ..

    echo ""
    echo -e "${GREEN}✅ Branch switch complete with native rebuild${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run ios"
    echo "  2. Wait for app to build and install on simulator"
    echo ""

elif [ "$NEEDS_JS_REFRESH" = true ]; then
    echo -e "${YELLOW}📦 JAVASCRIPT REFRESH REQUIRED${NC}"
    echo "   This will take 30-60 seconds..."
    echo ""

    # Stop Metro if running
    echo "1️⃣  Stopping Metro bundler..."
    lsof -ti :8081 | xargs kill -9 2>/dev/null || true

    # Install dependencies
    echo ""
    echo "2️⃣  Installing npm dependencies..."
    npm install

    # Clear Metro cache
    echo ""
    echo "3️⃣  Clearing Metro cache..."
    rm -rf .expo
    rm -rf $TMPDIR/metro-* 2>/dev/null || true

    echo ""
    echo -e "${GREEN}✅ Branch switch complete with JS refresh${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm start"
    echo "  2. Press 'i' to reload simulator"
    echo ""

else
    echo -e "${GREEN}🚀 FAST PATH - No dependency changes detected${NC}"
    echo ""

    # Just clear Metro cache for safety
    echo "Clearing Metro cache..."
    rm -rf .expo
    rm -rf $TMPDIR/metro-* 2>/dev/null || true

    echo ""
    echo -e "${GREEN}✅ Branch switch complete${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. If Metro is running, press 'r' to reload"
    echo "  2. If Metro is stopped, run: npm start"
    echo ""
fi

# Check if .env needs updating
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "   Copy .env.example to .env and configure with your values"
    echo ""
fi
