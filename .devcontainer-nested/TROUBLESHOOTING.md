# Dev Container Troubleshooting Guide

## Git Installation Issues

### Problem: "Permission denied" or "sudo: command not found"

**Symptoms:**
- `sudo: command not found`
- `E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)`
- `E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), are you root?`

**Root Cause:**
The Dev Container is running as a non-root user without sudo privileges, and Git was not installed during container creation.

**Solution:**
You **must rebuild the Dev Container** to fix this issue. Manual installation is not possible without proper permissions.

### How to Rebuild Dev Container

1. **In VS Code:**
   - Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
   - Type: `Dev Containers: Rebuild Container`
   - Select it and wait for rebuild to complete

2. **Alternative method:**
   - Open Command Palette
   - Type: `Dev Containers: Rebuild and Reopen in Container`

3. **From terminal (outside container):**
   ```bash
   # If using Docker Compose
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### What Happens During Rebuild

The devcontainer.json includes these features that will install Git:
```json
"features": {
    "ghcr.io/devcontainers/features/git:1": {
        "ppa": true,
        "version": "latest"
    }
}
```

During rebuild:
1. ✅ Git will be installed by the Dev Container feature
2. ✅ Proper permissions will be set up
3. ✅ Git configuration will be applied automatically
4. ✅ SSH keys and Git config will be mounted from host

### After Rebuild - Verify Git Works

1. **Check Git installation:**
   ```bash
   git --version
   ```

2. **Configure your identity:**
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Test Git functionality:**
   ```bash
   git status
   ```

4. **Run diagnostics:**
   ```bash
   .devcontainer/diagnose-git.sh
   ```

### Why Manual Installation Failed

- **No sudo**: Container doesn't include sudo package
- **Non-root user**: Running as `vscode` user without admin privileges
- **Package locks**: System package manager requires root access
- **Missing directories**: Some apt directories don't exist or have wrong permissions

### Prevention

To avoid this issue in the future:
- Always use the Dev Container features for system-level installations
- Don't try to manually install system packages in non-root containers
- Rebuild the container when adding new features to devcontainer.json

## Other Common Issues

### Roo Extension Not Loading
- Check Extensions panel in VS Code
- Rebuild container if extension list was updated
- Verify `roo-cline.roo-cline` is in devcontainer.json extensions list

### Port Forwarding Issues
- Check if ports 8000, 3000, 5432 are available
- Verify `forwardPorts` configuration in devcontainer.json
- Restart VS Code if ports aren't forwarding

### SSH Key Issues
- Ensure `~/.ssh` directory exists on host
- Check SSH key permissions (600 for private keys)
- Verify SSH keys are mounted correctly in container