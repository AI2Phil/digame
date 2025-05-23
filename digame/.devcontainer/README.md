# Dev Container Configuration

This directory contains the Dev Container configuration for the Digame project, which ensures the Roo extension and other development tools are automatically installed when starting a Dev Container.

## What's Included

### Extensions
- **Roo Cline** (`roo-cline.roo-cline`) - The main Roo extension for AI-powered development
- **Python Development Tools**:
  - Python extension
  - Pylint for linting
  - Black formatter
  - isort for import sorting
- **Web Development Tools**:
  - Tailwind CSS IntelliSense
  - Prettier code formatter
- **General Development Tools**:
  - JSON and YAML support
  - Remote Containers extension

### Features
- **Git** - Version control tools
- **GitHub CLI** - Command-line interface for GitHub
- **Node.js 20** - For frontend development

### Port Forwarding
- **8000** - Backend API (FastAPI/Uvicorn)
- **3000** - Frontend development server
- **5432** - PostgreSQL database

## Usage

1. **Open in Dev Container**:
   - Open the project in VS Code
   - When prompted, click "Reopen in Container"
   - Or use Command Palette: `Dev Containers: Reopen in Container`

2. **Manual Setup** (if needed):
   - Command Palette: `Dev Containers: Rebuild Container`

3. **Verify Roo Extension**:
   - After container starts, the Roo extension should be automatically installed and available
   - Check the Extensions panel to confirm `roo-cline.roo-cline` is installed

## Configuration Details

- **Base Image**: `mcr.microsoft.com/devcontainers/python:3.11`
- **Workspace**: `/workspaces/digame`
- **User**: `vscode`
- **Python Path**: `/usr/local/bin/python`

## Post-Creation Commands

The container automatically runs:
```bash
pip install --upgrade pip && pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary
```

This installs the core Python dependencies needed for the Digame backend.

## Troubleshooting

### Roo Extension Issues
If the Roo extension doesn't load:
1. Check the Extensions panel in VS Code
2. Manually install: `roo-cline.roo-cline`
3. Rebuild the container: `Dev Containers: Rebuild Container`
4. Check the Dev Container logs for any errors

### Git Issues
If Git is not working properly:

1. **Check Git Configuration**:
   ```bash
   git config --global user.name
   git config --global user.email
   ```

2. **Set Git User** (if not configured):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Run Git Setup Script**:
   ```bash
   .devcontainer/setup-git.sh
   ```

4. **Check Git Credentials**:
   - SSH keys should be mounted from `~/.ssh`
   - Git config should be mounted from `~/.gitconfig`
   - If using HTTPS, you may need to configure credentials

5. **Common Git Issues**:
   - **Permission denied**: Check SSH key permissions
   - **Authentication failed**: Verify credentials or use personal access token
   - **Git not found**: Rebuild container to ensure Git feature is installed

6. **Manual Git Installation** (if needed):
   ```bash
   sudo apt-get update && sudo apt-get install -y git
   ```

## Customization

To modify the configuration:
1. Edit `devcontainer.json`
2. Rebuild the container to apply changes
3. Update `../vscode/extensions.json` for workspace-wide extension recommendations