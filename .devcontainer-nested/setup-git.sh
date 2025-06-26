#!/bin/bash

# Git setup script for Dev Container
echo "Setting up Git configuration in Dev Container..."

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y git
fi

# Check if Git user is configured
if [ -z "$(git config --global user.name)" ]; then
    echo "Git user.name is not set."
    echo "Please run: git config --global user.name 'Your Name'"
fi

if [ -z "$(git config --global user.email)" ]; then
    echo "Git user.email is not set."
    echo "Please run: git config --global user.email 'your.email@example.com'"
fi

# Set up Git editor
git config --global core.editor "code --wait"

# Set up Git default branch
git config --global init.defaultBranch main

# Set up Git credential helper
git config --global credential.helper store

# Set up Git pull strategy
git config --global pull.rebase false

# Check Git status
echo "Git version: $(git --version)"
echo "Git user.name: $(git config --global user.name)"
echo "Git user.email: $(git config --global user.email)"

# Test Git functionality
if git status &> /dev/null; then
    echo "✅ Git is working properly in this repository"
else
    echo "⚠️  Git repository not initialized or not in a Git repository"
    echo "Current directory: $(pwd)"
    echo "To initialize: git init"
fi

echo "Git setup complete!"