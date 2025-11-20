#!/bin/bash

# GalliGo Deep Clean Script
# Clears all caches, build artifacts, and resets the development environment
# Use this when experiencing persistent Metro bundler or build issues

set -e

echo "🧹 Starting Deep Clean for GalliGo Mobile..."
echo ""

# Kill any running Metro processes
echo "1️⃣  Killing Metro bundler processes..."
lsof -ti :8081 | xargs kill -9 2>/dev/null || true
killall -9 node 2>/dev/null || true
echo "   ✓ Metro processes terminated"

# Clear Watchman (if installed)
echo ""
echo "2️⃣  Resetting Watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo "   ✓ Watchman reset complete"
else
    echo "   ⚠️  Watchman not installed (optional, but recommended)"
fi

# Clear Metro cache
echo ""
echo "3️⃣  Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true
rm -rf .metro-health-check* 2>/dev/null || true
echo "   ✓ Metro cache cleared"

# Clear Expo cache
echo ""
echo "4️⃣  Clearing Expo cache..."
rm -rf .expo
rm -rf node_modules/.cache
echo "   ✓ Expo cache cleared"

# Clear build directories
echo ""
echo "5️⃣  Removing build artifacts..."
rm -rf build/
rm -rf build-*/
rm -rf ios/build
echo "   ✓ Build artifacts removed"

# Clear Xcode DerivedData (optional but thorough)
echo ""
echo "6️⃣  Clearing Xcode DerivedData..."
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    rm -rf ~/Library/Developer/Xcode/DerivedData/galligomobile-*
    echo "   ✓ DerivedData cleared"
else
    echo "   ⚠️  DerivedData directory not found (skipping)"
fi

# Reinstall node_modules (optional, uncomment if needed)
echo ""
echo "7️⃣  Node modules..."
read -p "   Do you want to reinstall node_modules? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Removing node_modules..."
    rm -rf node_modules
    echo "   Running npm install..."
    npm install
    echo "   ✓ node_modules reinstalled"
else
    echo "   ⏭️  Skipped node_modules reinstall"
fi

# Reinstall iOS Pods (optional, uncomment if needed)
echo ""
echo "8️⃣  iOS CocoaPods..."
if [ -d "ios" ]; then
    read -p "   Do you want to reinstall CocoaPods? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   Deintegrating CocoaPods..."
        cd ios
        pod deintegrate
        echo "   Installing pods..."
        pod install
        cd ..
        echo "   ✓ CocoaPods reinstalled"
    else
        echo "   ⏭️  Skipped CocoaPods reinstall"
    fi
else
    echo "   ⚠️  ios/ directory not found (will be generated on next build)"
fi

echo ""
echo "✅ Deep clean complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'npm start' to start the Metro bundler"
echo "  2. Press 'i' to launch iOS simulator"
echo "  3. If native changes were made, run 'npm run ios' to rebuild"
echo ""
