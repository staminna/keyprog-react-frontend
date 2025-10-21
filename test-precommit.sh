#!/bin/bash

# Test script for pre-commit hook
echo "🧪 Testing Pre-commit Hook Security Features"
echo "=============================================="
echo ""

# Test 1: Try to commit a .env file
echo "Test 1: Attempting to commit .env file (should FAIL)..."
echo "TEST_SECRET=abc123" > .env.test
git add .env.test 2>/dev/null

# Simulate pre-commit hook
if .husky/pre-commit 2>&1 | grep -q "ERROR.*\.env"; then
    echo "✅ Test 1 PASSED: .env file blocked"
else
    echo "❌ Test 1 FAILED: .env file not blocked"
fi

# Cleanup
git reset HEAD .env.test 2>/dev/null
rm -f .env.test
echo ""

# Test 2: Try to commit a file with secrets
echo "Test 2: Attempting to commit file with secrets (should FAIL)..."
echo "const API_KEY = 'sk_live_51H7xxxxxxxxxxxxxxxxxxx';" > test-secret.js
git add test-secret.js 2>/dev/null

# Note: TruffleHog test would require actual git commit
echo "⚠️  Test 2 SKIPPED: Requires actual commit (would block in real scenario)"

# Cleanup
git reset HEAD test-secret.js 2>/dev/null
rm -f test-secret.js
echo ""

# Test 3: Verify hook is executable
echo "Test 3: Checking hook permissions..."
if [ -x .husky/pre-commit ]; then
    echo "✅ Test 3 PASSED: Hook is executable"
else
    echo "❌ Test 3 FAILED: Hook is not executable"
    echo "   Fix with: chmod +x .husky/pre-commit"
fi
echo ""

# Test 4: Verify TruffleHog is installed
echo "Test 4: Checking TruffleHog installation..."
if command -v trufflehog &> /dev/null; then
    echo "✅ Test 4 PASSED: TruffleHog is installed"
    trufflehog --version
else
    echo "❌ Test 4 FAILED: TruffleHog not found"
    echo "   Install with: brew install trufflehog"
fi
echo ""

# Test 5: Verify .gitignore includes .env
echo "Test 5: Checking .gitignore configuration..."
if grep -q "^\.env$" .gitignore; then
    echo "✅ Test 5 PASSED: .env in .gitignore"
else
    echo "❌ Test 5 FAILED: .env not in .gitignore"
fi
echo ""

echo "=============================================="
echo "🏁 Pre-commit Hook Tests Complete"
echo ""
echo "To test with a real commit:"
echo "  1. Make a safe change: echo '# test' >> README.md"
echo "  2. Stage it: git add README.md"
echo "  3. Commit: git commit -m 'Test commit'"
echo "  4. You should see security checks run"
echo "  5. Undo: git reset HEAD~1"
