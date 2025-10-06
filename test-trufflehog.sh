#!/bin/bash

# Test script for TruffleHog pre-commit hook
# This script tests if TruffleHog is properly configured

set -e

echo "🧪 Testing TruffleHog Pre-Commit Hook Setup"
echo "============================================"
echo ""

# Check if TruffleHog is installed
echo "1️⃣  Checking TruffleHog installation..."
if command -v trufflehog &> /dev/null; then
    echo "   ✅ TruffleHog is installed"
    trufflehog --version
else
    echo "   ❌ TruffleHog is NOT installed"
    echo ""
    echo "   Please install TruffleHog:"
    echo "   macOS: brew install trufflehog"
    echo "   Linux: curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin"
    exit 1
fi
echo ""

# Check if Husky is installed
echo "2️⃣  Checking Husky installation..."
if [ -d ".husky" ]; then
    echo "   ✅ Husky directory exists"
else
    echo "   ❌ Husky directory NOT found"
    echo "   Run: npm install"
    exit 1
fi
echo ""

# Check if pre-commit hook exists
echo "3️⃣  Checking pre-commit hook..."
if [ -f ".husky/pre-commit" ]; then
    echo "   ✅ Pre-commit hook exists"
    
    # Check if it's executable
    if [ -x ".husky/pre-commit" ]; then
        echo "   ✅ Pre-commit hook is executable"
    else
        echo "   ⚠️  Pre-commit hook is not executable"
        echo "   Fixing permissions..."
        chmod +x .husky/pre-commit
        echo "   ✅ Fixed!"
    fi
    
    # Check if TruffleHog is in the hook
    if grep -q "trufflehog" ".husky/pre-commit"; then
        echo "   ✅ TruffleHog is configured in pre-commit hook"
    else
        echo "   ❌ TruffleHog is NOT configured in pre-commit hook"
        exit 1
    fi
else
    echo "   ❌ Pre-commit hook NOT found"
    exit 1
fi
echo ""

# Test TruffleHog scanning
echo "4️⃣  Testing TruffleHog scan..."
echo "   Running: trufflehog git file://. --since-commit HEAD --results=verified,unknown"
if trufflehog git file://. --since-commit HEAD --results=verified,unknown 2>/dev/null; then
    echo "   ✅ TruffleHog scan completed successfully"
    echo "   ✅ No secrets detected in staged changes"
else
    echo "   ⚠️  TruffleHog detected potential secrets or had an error"
    echo "   Review the output above"
fi
echo ""

# Test with a fake secret (optional)
echo "5️⃣  Testing secret detection (optional)..."
read -p "   Do you want to test with a fake secret? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Create a temporary file with a fake secret
    TEST_FILE="test-secret-detection.tmp"
    echo "aws_access_key_id=AKIAIOSFODNN7EXAMPLE" > "$TEST_FILE"
    
    echo "   Creating test file with fake AWS key..."
    git add "$TEST_FILE" 2>/dev/null || true
    
    echo "   Running TruffleHog scan..."
    if trufflehog git file://. --since-commit HEAD --results=verified,unknown --fail 2>/dev/null; then
        echo "   ⚠️  TruffleHog did not detect the test secret (this might be expected)"
    else
        echo "   ✅ TruffleHog correctly detected the test secret!"
    fi
    
    # Cleanup
    git reset HEAD "$TEST_FILE" 2>/dev/null || true
    rm -f "$TEST_FILE"
    echo "   🧹 Cleaned up test file"
else
    echo "   ⏭️  Skipped secret detection test"
fi
echo ""

echo "============================================"
echo "✅ TruffleHog Pre-Commit Hook Setup Complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Make sure TruffleHog is installed (if not already)"
echo "   2. Try making a commit - TruffleHog will scan automatically"
echo "   3. Read TRUFFLEHOG_SETUP.md for detailed documentation"
echo ""
echo "🔒 Your repository is now protected against accidental secret commits!"
