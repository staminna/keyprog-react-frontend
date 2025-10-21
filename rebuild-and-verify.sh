#!/bin/bash

# Script to rebuild and verify the production build
# This fixes the 404 errors on api.keyprog.com

set -e

echo "🔨 Rebuilding Production Bundle"
echo "================================"
echo ""

# Step 1: Clean previous build
echo "1️⃣  Cleaning previous build..."
rm -rf dist
echo "✅ dist/ directory cleaned"
echo ""

# Step 2: Build production bundle
echo "2️⃣  Building production bundle..."
npm run build:prod
echo "✅ Production build complete"
echo ""

# Step 3: Verify build output
echo "3️⃣  Verifying build output..."
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist/ directory not created"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html not found"
    exit 1
fi

echo "✅ Build output verified"
echo ""

# Step 4: Check asset paths in index.html
echo "4️⃣  Checking asset paths..."
echo ""
echo "Assets in index.html:"
grep -E "(src=|href=)" dist/index.html | sed 's/^/  /'
echo ""

# Step 5: List all built files
echo "5️⃣  Built files:"
find dist -type f | sed 's/^/  /'
echo ""

# Step 6: Check file sizes
echo "6️⃣  Build size:"
du -sh dist
echo ""

echo "================================"
echo "✅ Build Complete and Verified"
echo ""
echo "Next steps:"
echo "  1. Test locally: npm run preview"
echo "  2. Deploy to server"
echo "  3. Verify in browser (check Network tab for 404s)"
echo ""
echo "Deploy options:"
echo "  - Docker: npm run prod:start"
echo "  - Manual: scp -r dist/* user@api.keyprog.com:/var/www/html/"
echo "  - Script: npm run deploy"
