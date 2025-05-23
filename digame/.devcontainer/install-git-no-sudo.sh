#!/bin/bash

echo "🔧 Installing Git in Dev Container (without sudo)..."
echo "=================================================="

# Check if we're running as root
if [ "$EUID" -eq 0 ]; then
    echo "Running as root - no sudo needed"
    APT_CMD="apt-get"
else
    echo "Running as user - checking if sudo is available..."
    if command -v sudo &> /dev/null; then
        APT_CMD="sudo apt-get"
    else
        echo "❌ Neither root access nor sudo available"
        echo "Try running the container as root or install sudo first"
        exit 1
    fi
fi

# Update package list
echo "1. Updating package list..."
$APT_CMD update

# Install Git
echo "2. Installing Git..."
$APT_CMD install -y git

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