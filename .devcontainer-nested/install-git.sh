#!/bin/bash

echo "🔧 Installing Git in Dev Container..."
echo "===================================="

# Update package list
echo "1. Updating package list..."
sudo apt-get update

# Install Git
echo "2. Installing Git..."
sudo apt-get install -y git

# Verify installation
echo "3. Verifying Git installation..."
if command -v git &> /dev/null; then
    echo "✅ Git installed successfully!"
    echo "   Version: $(git --version)"
else
    echo "❌ Git installation failed"
    exit 1
fi

# Run basic setup
echo "4. Running basic Git setup..."
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global credential.helper store

echo ""
echo "🎉 Git installation complete!"
echo ""
echo "Next steps:"
echo "1. Set your Git user info:"
echo "   git config --global user.name 'Your Name'"
echo "   git config --global user.email 'your.email@example.com'"
echo ""
echo "2. Test Git functionality:"
echo "   git status"
echo ""
echo "3. Run diagnostics if needed:"
echo "   .devcontainer/diagnose-git.sh"