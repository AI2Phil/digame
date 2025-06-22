#!/bin/bash
echo "Activating Digame development environment..."
source venv/bin/activate
echo "Virtual environment activated!"
echo ""
echo "To run the application:"
echo "  python -m uvicorn digame.app.main:app --reload"
echo ""
echo "To run migrations:"
echo "  cd digame && python deploy_migrations.py"
echo ""
echo "To deactivate: deactivate"
