#!/bin/bash

echo "🔍 Git Diagnostic Script for Dev Container"
echo "=========================================="

# Check if Git is installed
echo "1. Checking Git installation..."
if command -v git &> /dev/null; then
    echo "✅ Git is installed: $(git --version)"
else
    echo "❌ Git is not installed"
    exit 1
fi

# Check Git configuration
echo ""
echo "2. Checking Git configuration..."
USER_NAME=$(git config --global user.name)
USER_EMAIL=$(git config --global user.email)

if [ -n "$USER_NAME" ]; then
    echo "✅ Git user.name: $USER_NAME"
else
    echo "❌ Git user.name is not set"
fi

if [ -n "$USER_EMAIL" ]; then
    echo "✅ Git user.email: $USER_EMAIL"
else
    echo "❌ Git user.email is not set"
fi

# Check if we're in a Git repository
echo ""
echo "3. Checking Git repository status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Currently in a Git repository"
    echo "   Repository root: $(git rev-parse --show-toplevel)"
    echo "   Current branch: $(git branch --show-current 2>/dev/null || echo 'No branch')"
    
    # Check repository status
    if git status --porcelain > /dev/null 2>&1; then
        echo "✅ Git status command works"
    else
        echo "❌ Git status command failed"
    fi
else
    echo "❌ Not in a Git repository"
    echo "   Current directory: $(pwd)"
fi

# Check SSH configuration
echo ""
echo "4. Checking SSH configuration..."
if [ -d "$HOME/.ssh" ]; then
    echo "✅ SSH directory exists: $HOME/.ssh"
    if [ -f "$HOME/.ssh/id_rsa" ] || [ -f "$HOME/.ssh/id_ed25519" ]; then
        echo "✅ SSH keys found"
    else
        echo "⚠️  No SSH keys found in $HOME/.ssh"
    fi
else
    echo "❌ SSH directory not found: $HOME/.ssh"
fi

# Check Git credential configuration
echo ""
echo "5. Checking Git credentials..."
CREDENTIAL_HELPER=$(git config --global credential.helper)
if [ -n "$CREDENTIAL_HELPER" ]; then
    echo "✅ Git credential helper: $CREDENTIAL_HELPER"
else
    echo "⚠️  No Git credential helper configured"
fi

# Check network connectivity
echo ""
echo "6. Checking network connectivity..."
if ping -c 1 github.com > /dev/null 2>&1; then
    echo "✅ Can reach github.com"
else
    echo "❌ Cannot reach github.com"
fi

# Test Git operations
echo ""
echo "7. Testing basic Git operations..."
if git log --oneline -1 > /dev/null 2>&1; then
    echo "✅ Git log works"
else
    echo "❌ Git log failed (might be empty repository)"
fi

if git remote -v > /dev/null 2>&1; then
    echo "✅ Git remote command works"
    REMOTES=$(git remote -v)
    if [ -n "$REMOTES" ]; then
        echo "   Remotes configured:"
        echo "$REMOTES" | sed 's/^/   /'
    else
        echo "   No remotes configured"
    fi
else
    echo "❌ Git remote command failed"
fi

echo ""
echo "🏁 Diagnostic complete!"
echo ""
echo "If you see any ❌ or ⚠️  above, please address those issues."
echo "For help, see .devcontainer/README.md"