# TruffleHog Pre-Commit Hook Setup

This project uses [TruffleHog](https://github.com/trufflesecurity/trufflehog) to prevent committing secrets, credentials, and API keys to the repository.

## 🔧 Installation

### 1. Install TruffleHog

**macOS (using Homebrew):**
```bash
brew install trufflehog
```

**Linux/macOS/Windows (using installation script):**
```bash
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh | sh -s -- -b /usr/local/bin
```

**Verify installation:**
```bash
trufflehog --version
```

### 2. Install Husky Dependencies

Husky is already configured in this project. If you're setting up for the first time:

```bash
npm install
```

This will automatically run `npm run prepare` which initializes Husky.

## 🚀 How It Works

When you run `git commit`, TruffleHog automatically:

1. **Scans** all staged changes for secrets
2. **Detects** credentials, API keys, tokens, and other sensitive data
3. **Blocks** the commit if verified or unknown secrets are found
4. **Allows** the commit to proceed if no secrets are detected

## 📝 Commit Process Best Practices

### ✅ Recommended Approach
```bash
git add .
git commit -m "Your commit message"
```

### ❌ Avoid This
```bash
git commit -am "Your commit message"  # May bypass pre-commit hooks
```

## 🔍 Manual Scanning

You can manually scan your repository at any time:

### Scan All Changes Since Last Commit
```bash
trufflehog git file://. --since-commit HEAD --results=verified,unknown
```

### Scan Entire Repository History
```bash
trufflehog git file://. --results=verified,unknown
```

### Scan in Audit Mode (Non-Blocking)
```bash
trufflehog git file://. --since-commit HEAD --results=verified,unknown 2>/dev/null
```

## 🚫 Bypassing the Hook (Use with Caution)

In rare cases where you need to bypass the pre-commit hook:

```bash
git commit --no-verify -m "Your commit message"
```

**⚠️ Warning:** Only use `--no-verify` when you're absolutely certain no secrets are being committed.

## 🎯 Handling False Positives

If TruffleHog flags something that isn't actually a secret:

### Option 1: Inline Comment
Add a comment on the same line:
```javascript
const notASecret = "fake-key-12345"; // trufflehog:ignore
```

### Option 2: Configuration File
Create a `.trufflehog-ignore` file in the project root with patterns to ignore.

## 🛠️ Configuration

The pre-commit hook is configured in `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run TruffleHog to detect secrets
echo "🔍 Scanning for secrets with TruffleHog..."
trufflehog git file://. --since-commit HEAD --results=verified,unknown --fail
```

### Configuration Options

- `--since-commit HEAD`: Only scan changes since the last commit
- `--results=verified,unknown`: Show verified secrets and unknown potential secrets
- `--fail`: Exit with error code if secrets are found (blocks commit)

### Adjusting Sensitivity

**More Strict (only verified secrets):**
```bash
trufflehog git file://. --since-commit HEAD --results=verified --fail
```

**Less Strict (audit mode, doesn't block):**
```bash
trufflehog git file://. --since-commit HEAD --results=verified,unknown
```

## 🔐 What TruffleHog Detects

TruffleHog scans for 700+ types of secrets including:

- AWS credentials
- GitHub tokens
- Stripe API keys
- Database connection strings
- Private keys (SSH, PGP, etc.)
- OAuth tokens
- API keys from popular services
- And many more...

## 🐛 Troubleshooting

### Hook Not Running

1. **Check if hook is executable:**
   ```bash
   chmod +x .husky/pre-commit
   ```

2. **Verify Husky is installed:**
   ```bash
   npm run prepare
   ```

3. **Check Git hooks path:**
   ```bash
   git config --get core.hooksPath
   ```

### TruffleHog Not Found

If you get "command not found" error:

1. Verify TruffleHog is installed:
   ```bash
   which trufflehog
   ```

2. If not found, install it using the instructions above

3. Ensure it's in your PATH:
   ```bash
   echo $PATH
   ```

### False Positives

If you're getting too many false positives:

1. Use `--results=verified` instead of `--results=verified,unknown`
2. Add inline `// trufflehog:ignore` comments
3. Create a `.trufflehog-ignore` configuration file

## 📚 Additional Resources

- [TruffleHog Documentation](https://github.com/trufflesecurity/trufflehog)
- [TruffleHog Pre-Commit Guide](https://github.com/trufflesecurity/trufflehog/blob/main/PreCommit.md)
- [Husky Documentation](https://typicode.github.io/husky/)

## 🔄 Updating TruffleHog

Keep TruffleHog up to date for the latest secret detection patterns:

```bash
brew upgrade trufflehog
```

## 📊 Testing the Setup

To test if the pre-commit hook is working:

1. Create a test file with a fake secret:
   ```bash
   echo "aws_secret_key=AKIAIOSFODNN7EXAMPLE" > test-secret.txt
   git add test-secret.txt
   git commit -m "Test secret detection"
   ```

2. TruffleHog should block the commit and display the detected secret

3. Remove the test file:
   ```bash
   git reset HEAD test-secret.txt
   rm test-secret.txt
   ```

---

**Remember:** This pre-commit hook is your first line of defense against accidentally committing secrets. Always review what you're committing and keep sensitive data in environment variables or secure vaults.
