#!/bin/bash

echo "🔧 Installing Git directly (no sudo)..."
echo "======================================"

# Try direct apt-get commands (works if running as root)
echo "1. Updating package list..."
apt-get update

echo "2. Installing Git..."
apt-get install -y git

echo "3. Verifying installation..."
if command -v git &> /dev/null; then
    echo "✅ Git installed successfully!"
    echo "   Version: $(git --version)"
    
    # Basic Git setup
    echo "4. Setting up Git..."
    git config --global core.editor "code --wait"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    git config --global credential.helper store
    
    echo ""
    echo "🎉 Git installation and setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Set your Git user info:"
    echo "   git config --global user.name 'Your Name'"
    echo "   git config --global user.email 'your.email@example.com'"
    echo ""
    echo "2. Test Git functionality:"
    echo "   git status"
else
    echo "❌ Git installation failed"
    echo ""
    echo "This might be because:"
    echo "- Container is not running as root"
    echo "- Package manager permissions issue"
    echo "- Network connectivity issue"
    echo ""
    echo "Try rebuilding the Dev Container to use the Git feature instead."
fi