# Directory Structure Refactoring Plan

## Overview

This document outlines a step-by-step plan to refactor the current nested directory structure from `digame/digame/` to a simplified flat structure. The goal is to eliminate the redundant nesting and improve project organization.

## Current Structure Analysis

### Current Nested Structure:
```
digame/                          # Root project directory
├── digame/                      # Nested digame directory (REDUNDANT)
│   ├── __init__.py
│   ├── alembic.ini
│   ├── CONTRIBUTING.md
│   ├── entrypoint.sh
│   ├── Makefile
│   ├── app/                     # Backend Python application
│   ├── frontend/                # React frontend application
│   ├── migrations/              # Database migrations
│   ├── scripts/                 # Utility scripts
│   └── tests/                   # Test suites
├── docs/                        # Documentation
├── mobile/                      # Mobile application
├── models/                      # ML/AI models
├── published_models/            # Published model artifacts
├── scripts/                     # Root-level scripts
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt
```

### Target Simplified Structure:
```
digame/                          # Root project directory
├── app/                         # Backend Python application (moved up)
├── frontend/                    # React frontend application (moved up)
├── migrations/                  # Database migrations (moved up)
├── tests/                       # Test suites (moved up)
├── scripts/                     # Utility scripts (consolidated)
├── docs/                        # Documentation
├── mobile/                      # Mobile application
├── models/                      # ML/AI models
├── published_models/            # Published model artifacts
├── alembic.ini                  # Database migration config (moved up)
├── Makefile                     # Build automation (moved up)
├── entrypoint.sh               # Docker entrypoint (moved up)
├── CONTRIBUTING.md             # Contributing guidelines (moved up)
├── docker-compose.yml
├── Dockerfile
├── README.md
└── requirements.txt
```

## Refactoring Plan

### Phase 1: Preparation and Backup
**Risk Level**: 🟢 Low
**Estimated Time**: 30 minutes

1. **Create Backup**
   ```bash
   # Create a complete backup of the current state
   git checkout -b backup-before-refactor
   git add -A
   git commit -m "Backup before directory structure refactor"
   git checkout main
   ```

2. **Create Refactor Branch**
   ```bash
   git checkout -b refactor-directory-structure
   ```

3. **Document Current State**
   ```bash
   # Generate current directory tree
   tree digame/ > docs/current-structure.txt
   ```

### Phase 2: Move Core Application Files
**Risk Level**: 🟡 Medium
**Estimated Time**: 1 hour

1. **Move Backend Application**
   ```bash
   # Move the app directory to root level
   mv digame/app/ ./app/
   
   # Update any relative imports in Python files
   find ./app -name "*.py" -exec sed -i 's/from digame\.app/from app/g' {} \;
   find ./app -name "*.py" -exec sed -i 's/import digame\.app/import app/g' {} \;
   ```

2. **Move Frontend Application**
   ```bash
   # Move the frontend directory to root level
   mv digame/frontend/ ./frontend/
   
   # Update package.json paths if needed
   # Update any build scripts that reference the old path
   ```

3. **Move Database Migrations**
   ```bash
   # Move migrations directory
   mv digame/migrations/ ./migrations/
   
   # Update alembic.ini configuration
   mv digame/alembic.ini ./alembic.ini
   
   # Update alembic.ini paths
   sed -i 's/script_location = migrations/script_location = migrations/g' alembic.ini
   ```

4. **Move Test Suites**
   ```bash
   # Move tests directory
   mv digame/tests/ ./tests/
   
   # Update test imports and paths
   find ./tests -name "*.py" -exec sed -i 's/from digame\.app/from app/g' {} \;
   find ./tests -name "*.py" -exec sed -i 's/import digame\.app/import app/g' {} \;
   ```

### Phase 3: Move Configuration and Build Files
**Risk Level**: 🟡 Medium
**Estimated Time**: 45 minutes

1. **Move Build and Configuration Files**
   ```bash
   # Move Makefile
   mv digame/Makefile ./Makefile
   
   # Move Docker entrypoint
   mv digame/entrypoint.sh ./entrypoint.sh
   chmod +x ./entrypoint.sh
   
   # Move contributing guidelines
   mv digame/CONTRIBUTING.md ./CONTRIBUTING.md
   ```

2. **Consolidate Scripts**
   ```bash
   # Merge script directories
   cp -r digame/scripts/* ./scripts/
   rm -rf digame/scripts/
   
   # Update script paths and references
   find ./scripts -name "*.py" -exec sed -i 's/from digame\.app/from app/g' {} \;
   find ./scripts -name "*.sh" -exec sed -i 's/digame\/app/app/g' {} \;
   ```

### Phase 4: Update Configuration Files
**Risk Level**: 🟡 Medium
**Estimated Time**: 1 hour

1. **Update Docker Configuration**
   ```bash
   # Update Dockerfile paths
   sed -i 's/COPY digame\//COPY /g' Dockerfile
   sed -i 's/WORKDIR \/app\/digame/WORKDIR \/app/g' Dockerfile
   sed -i 's/CMD \["digame\/entrypoint.sh"\]/CMD ["entrypoint.sh"]/g' Dockerfile
   ```

2. **Update Docker Compose**
   ```bash
   # Update docker-compose.yml volume mounts and paths
   sed -i 's/\.\/digame:/app/g' docker-compose.yml
   sed -i 's/digame\/entrypoint.sh/entrypoint.sh/g' docker-compose.yml
   ```

3. **Update Python Package Configuration**
   ```bash
   # Update setup.py
   sed -i 's/packages=find_packages("digame")/packages=find_packages()/g' setup.py
   sed -i 's/package_dir={"": "digame"}/package_dir={}/g' setup.py
   
   # Update pyproject.toml if it exists
   if [ -f pyproject.toml ]; then
       sed -i 's/digame\.app/app/g' pyproject.toml
   fi
   ```

4. **Update Import Statements**
   ```bash
   # Create a script to update all Python imports
   cat > update_imports.py << 'EOF'
   import os
   import re
   
   def update_imports_in_file(filepath):
       with open(filepath, 'r') as f:
           content = f.read()
       
       # Update imports
       content = re.sub(r'from digame\.app', 'from app', content)
       content = re.sub(r'import digame\.app', 'import app', content)
       content = re.sub(r'from digame\.tests', 'from tests', content)
       content = re.sub(r'import digame\.tests', 'import tests', content)
       
       with open(filepath, 'w') as f:
           f.write(content)
   
   # Update all Python files
   for root, dirs, files in os.walk('.'):
       for file in files:
           if file.endswith('.py'):
               filepath = os.path.join(root, file)
               update_imports_in_file(filepath)
   EOF
   
   python update_imports.py
   rm update_imports.py
   ```

### Phase 5: Clean Up and Remove Nested Directory
**Risk Level**: 🟢 Low
**Estimated Time**: 15 minutes

1. **Remove Empty Nested Directory**
   ```bash
   # Remove the now-empty digame/__init__.py
   rm digame/__init__.py
   
   # Remove the empty digame directory
   rmdir digame/
   ```

2. **Update Root __init__.py if needed**
   ```bash
   # Create new root __init__.py if the project needs to be importable
   echo '"""Digame - Digital Goal Achievement and Motivation Engine"""' > __init__.py
   echo '__version__ = "1.0.0"' >> __init__.py
   ```

### Phase 6: Update CI/CD and Development Tools
**Risk Level**: 🟡 Medium
**Estimated Time**: 45 minutes

1. **Update GitHub Actions / CI Configuration**
   ```bash
   # Update .github/workflows/*.yml files
   find .github/workflows -name "*.yml" -exec sed -i 's/digame\/app/app/g' {} \;
   find .github/workflows -name "*.yml" -exec sed -i 's/digame\/frontend/frontend/g' {} \;
   find .github/workflows -name "*.yml" -exec sed -i 's/digame\/tests/tests/g' {} \;
   ```

2. **Update IDE Configuration**
   ```bash
   # Update .vscode/settings.json if it exists
   if [ -f .vscode/settings.json ]; then
       sed -i 's/digame\/app/app/g' .vscode/settings.json
       sed -i 's/digame\/frontend/frontend/g' .vscode/settings.json
   fi
   
   # Update .idea configuration if using PyCharm
   if [ -d .idea ]; then
       find .idea -name "*.xml" -exec sed -i 's/digame\/app/app/g' {} \;
   fi
   ```

3. **Update Development Scripts**
   ```bash
   # Update any development scripts in scripts/
   find scripts/ -name "*.sh" -exec sed -i 's/digame\/app/app/g' {} \;
   find scripts/ -name "*.py" -exec sed -i 's/digame\.app/app/g' {} \;
   ```

### Phase 7: Testing and Validation
**Risk Level**: 🟢 Low
**Estimated Time**: 1 hour

1. **Run Tests**
   ```bash
   # Run Python tests
   python -m pytest tests/ -v
   
   # Run frontend tests
   cd frontend && npm test
   cd ..
   
   # Run linting
   flake8 app/
   pylint app/
   ```

2. **Test Docker Build**
   ```bash
   # Test Docker build
   docker build -t digame-refactored .
   
   # Test Docker Compose
   docker-compose build
   docker-compose up -d
   docker-compose down
   ```

3. **Test Application Startup**
   ```bash
   # Test backend startup
   cd app && python -m uvicorn main:app --reload
   
   # Test frontend startup
   cd frontend && npm start
   ```

### Phase 8: Documentation Updates
**Risk Level**: 🟢 Low
**Estimated Time**: 30 minutes

1. **Update README.md**
   ```bash
   # Update all path references in README.md
   sed -i 's/digame\/app/app/g' README.md
   sed -i 's/digame\/frontend/frontend/g' README.md
   sed -i 's/digame\/tests/tests/g' README.md
   ```

2. **Update Documentation**
   ```bash
   # Update all documentation files
   find docs/ -name "*.md" -exec sed -i 's/digame\/app/app/g' {} \;
   find docs/ -name "*.md" -exec sed -i 's/digame\/frontend/frontend/g' {} \;
   ```

3. **Create Migration Guide**
   ```bash
   # Document the changes for team members
   cat > docs/MIGRATION_GUIDE.md << 'EOF'
   # Directory Structure Migration Guide
   
   ## What Changed
   - Moved `digame/app/` → `app/`
   - Moved `digame/frontend/` → `frontend/`
   - Moved `digame/tests/` → `tests/`
   - Moved `digame/migrations/` → `migrations/`
   - Updated all import statements and configuration files
   
   ## For Developers
   1. Pull the latest changes
   2. Update your IDE workspace settings
   3. Update any local scripts that reference the old paths
   4. Rebuild Docker containers: `docker-compose build`
   
   ## Breaking Changes
   - Python import paths changed from `digame.app` to `app`
   - Docker volume mounts updated
   - CI/CD pipeline paths updated
   EOF
   ```

## Risk Assessment

### High-Risk Areas
- **Import statements**: Incorrect updates could break the application
- **Docker configuration**: Wrong paths could prevent container startup
- **CI/CD pipelines**: Could break automated deployments

### Mitigation Strategies
1. **Comprehensive Testing**: Test each phase thoroughly before proceeding
2. **Backup Strategy**: Maintain backup branch throughout the process
3. **Incremental Approach**: Complete one phase at a time
4. **Rollback Plan**: Keep the backup branch until refactor is validated

## Rollback Plan

If issues arise during refactoring:

```bash
# Quick rollback to backup
git checkout backup-before-refactor
git checkout -b main-rollback
git push origin main-rollback

# Or selective rollback
git checkout main
git reset --hard backup-before-refactor
```

## Post-Refactor Validation Checklist

- [ ] All tests pass
- [ ] Docker build succeeds
- [ ] Docker Compose starts successfully
- [ ] Frontend builds and starts
- [ ] Backend API responds correctly
- [ ] Database migrations work
- [ ] CI/CD pipeline passes
- [ ] Documentation is updated
- [ ] Team is notified of changes

## Benefits of Refactoring

1. **Simplified Structure**: Eliminates confusing nested directories
2. **Cleaner Imports**: Shorter, more intuitive import paths
3. **Better IDE Support**: IDEs can better understand the project structure
4. **Easier Navigation**: Developers can find files more quickly
5. **Standard Convention**: Follows common Python project conventions
6. **Reduced Complexity**: Fewer directory levels to navigate

## Timeline

**Total Estimated Time**: 5-6 hours
- Phase 1: 30 minutes
- Phase 2: 1 hour
- Phase 3: 45 minutes
- Phase 4: 1 hour
- Phase 5: 15 minutes
- Phase 6: 45 minutes
- Phase 7: 1 hour
- Phase 8: 30 minutes
- Buffer: 30 minutes

## Conclusion

This refactoring will significantly improve the project's organization and developer experience. The step-by-step approach ensures minimal risk while achieving a cleaner, more maintainable structure.