# SSH Deployment Best Practices for GitHub Actions

## ✅ What We Implemented (Industry Standard)

### **Using `webfactory/ssh-agent` Action**

```yaml
- name: Setup SSH
  uses: webfactory/ssh-agent@v0.9.0
  with:
    ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}
```

### **Why This Is Best Practice**

1. ✅ **Automatic SSH Agent Management**
   - Handles key loading and agent lifecycle
   - No manual file permissions or cleanup needed
   - Works with multiple keys if needed

2. ✅ **Security**
   - Keys never written to disk
   - Automatic cleanup after job completion
   - No risk of key leakage in logs

3. ✅ **Simplicity**
   - No manual `chmod`, `mkdir`, or key file management
   - Works with standard SSH commands (no `-i` flag needed)
   - Handles edge cases (line endings, key formats)

4. ✅ **Industry Standard**
   - 5.4k+ stars on GitHub
   - Used by thousands of projects
   - Well-maintained and documented

## ❌ What We Avoided (Anti-Patterns)

### **Manual Key File Management**

```yaml
# ❌ DON'T DO THIS
- name: Setup SSH key
  run: |
    mkdir -p ~/.ssh
    echo "$SSH_PRIVATE_KEY" > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
```

**Problems:**
- Key written to disk (security risk)
- Manual permission management
- Doesn't handle line ending issues
- Requires `-i` flag in all SSH commands
- No automatic cleanup

### **Key Validation in Workflow**

```yaml
# ❌ DON'T DO THIS
- name: Validate key
  run: |
    ssh-keygen -l -f ~/.ssh/deploy_key || exit 1
```

**Problems:**
- Exposes key fingerprint in logs
- Adds unnecessary complexity
- Doesn't fix root cause (bad key format)
- Should be validated before adding to secrets

## 📋 Proper SSH Key Setup

### **1. Generate Key (Correct Format)**

```bash
# Use Ed25519 (modern, secure, no passphrase for CI/CD)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/keyprog_deploy -N ""
```

**Or use the provided script:**
```bash
chmod +x regenerate-ssh-key.sh
./regenerate-ssh-key.sh
```

### **2. Add Public Key to Server**

```bash
# On keyprog.varrho.com
cat >> ~/.ssh/authorized_keys << 'EOF'
ssh-ed25519 AAAAC3... github-actions-deploy
EOF
chmod 600 ~/.ssh/authorized_keys
```

### **3. Add Private Key to GitHub Secrets**

1. Go to: `https://github.com/staminna/keyprog-react-frontend/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `SSH_PRIVATE_KEY`
4. Value: **Entire private key** including headers:
   ```
   -----BEGIN OPENSSH PRIVATE KEY-----
   b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
   ...
   -----END OPENSSH PRIVATE KEY-----
   ```

### **4. Test Locally First**

```bash
ssh -i ~/.ssh/keyprog_deploy nunes@keyprog.varrho.com "echo 'Connection successful'"
```

## 🔒 Security Best Practices

### **DO:**
- ✅ Use Ed25519 keys (modern, secure)
- ✅ No passphrase for CI/CD keys
- ✅ Separate keys for CI/CD vs personal use
- ✅ Rotate keys periodically
- ✅ Use GitHub Secrets (encrypted at rest)
- ✅ Limit key permissions on server (specific user, specific path)

### **DON'T:**
- ❌ Reuse personal SSH keys for CI/CD
- ❌ Add passphrase to CI/CD keys
- ❌ Commit keys to repository (even encrypted)
- ❌ Use RSA keys < 4096 bits
- ❌ Write keys to disk in workflows
- ❌ Echo or log key contents

## 🚀 Complete Deployment Workflow

```yaml
deploy-production:
  runs-on: ubuntu-latest
  needs: [secret-scan, build-and-test]
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: dist
        path: dist/

    # ✅ Best Practice: Use ssh-agent action
    - name: Setup SSH
      uses: webfactory/ssh-agent@v0.9.0
      with:
        ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

    - name: Add server to known hosts
      run: |
        mkdir -p ~/.ssh
        ssh-keyscan -H keyprog.varrho.com >> ~/.ssh/known_hosts

    # ✅ No -i flag needed - ssh-agent handles it
    - name: Test SSH connection
      run: |
        ssh nunes@keyprog.varrho.com "echo '✅ Connected'"

    - name: Deploy files
      run: |
        rsync -avz --delete dist/ nunes@keyprog.varrho.com:/path/to/deploy/
```

## 🔧 Troubleshooting

### **Error: "Load key: error in libcrypto"**

**Cause:** Key format incompatible or has passphrase

**Solution:**
1. Regenerate key without passphrase
2. Use OpenSSH format (not PEM)
3. Ensure no Windows line endings (`\r\n`)

### **Error: "Permission denied (publickey)"**

**Cause:** Public key not on server or wrong user

**Solution:**
1. Verify public key in `~/.ssh/authorized_keys` on server
2. Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
3. Verify correct username in SSH command

### **Error: "Host key verification failed"**

**Cause:** Server not in known_hosts

**Solution:**
```yaml
- name: Add server to known hosts
  run: ssh-keyscan -H keyprog.varrho.com >> ~/.ssh/known_hosts
```

## 📚 References

- [webfactory/ssh-agent](https://github.com/webfactory/ssh-agent)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [SSH Key Types Comparison](https://goteleport.com/blog/comparing-ssh-keys/)

## ✅ Summary

**Before (Manual):**
- Manual key file management
- Security risks
- Complex error handling
- Requires `-i` flag everywhere

**After (ssh-agent):**
- Automatic key management
- Secure by default
- Simple and clean
- Standard SSH commands work

**Result:** Production-ready, secure, maintainable deployment workflow ✨
