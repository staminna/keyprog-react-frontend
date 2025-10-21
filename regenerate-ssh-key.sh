#!/bin/bash

# Script to regenerate SSH key for GitHub Actions deployment
# This ensures the key is in the correct OpenSSH format without passphrase

set -e

echo "🔑 SSH Key Regeneration for GitHub Actions"
echo "=========================================="
echo ""

KEY_PATH="$HOME/.ssh/keyprog_deploy"
KEY_NAME="keyprog_deploy"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    read -p "⚠️  Key $KEY_PATH already exists. Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted"
        exit 1
    fi
    rm -f "$KEY_PATH" "$KEY_PATH.pub"
fi

# Generate new SSH key in OpenSSH format (no passphrase)
echo "📝 Generating new SSH key..."
ssh-keygen -t ed25519 -C "github-actions-keyprog-deploy" -f "$KEY_PATH" -N ""

echo ""
echo "✅ SSH key generated successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1️⃣  Add the PUBLIC key to your server:"
echo "   Run this command on keyprog.varrho.com:"
echo "   ----------------------------------------"
echo "   cat >> ~/.ssh/authorized_keys << 'EOF'"
cat "$KEY_PATH.pub"
echo "   EOF"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "   ----------------------------------------"
echo ""
echo "2️⃣  Add the PRIVATE key to GitHub Secrets:"
echo "   Go to: https://github.com/staminna/keyprog-react-frontend/settings/secrets/actions"
echo "   Secret name: SSH_PRIVATE_KEY"
echo "   Secret value (copy this):"
echo "   ----------------------------------------"
cat "$KEY_PATH"
echo "   ----------------------------------------"
echo ""
echo "3️⃣  Test the connection locally:"
echo "   ssh -i $KEY_PATH nunes@keyprog.varrho.com"
echo ""
echo "⚠️  IMPORTANT: Keep the private key secure and delete it after adding to GitHub Secrets"
echo "   rm $KEY_PATH"
echo ""
