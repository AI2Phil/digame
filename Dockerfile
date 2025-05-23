# Base image
FROM python:3.11-slim

# Update system packages to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/app

# Set working directory
WORKDIR $APP_HOME

# Install dependencies
# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY digame $APP_HOME/digame

# Copy model files
# This places models from the host's root 'models/' directory
# into '/app/digame/app/models/' in the image.
# The application (predictive.py) should be configured to look for models here.
# Specifically, DEFAULT_MODEL_DIR is "digame/app/models", so models like
# "example_custom_model.pth" (if only filename is given to save/load functions)
# will be resolved to /app/digame/app/models/example_custom_model.pth.
# If PRIMARY_MODEL_PATH is "models/predictive_model.pth", it resolves to /app/models/predictive_model.pth.
# The instruction below means predictive_model.pth from host's models/
# will be at /app/digame/app/models/predictive_model.pth in the image.
# This implies PRIMARY_MODEL_PATH in predictive.py might need to be adjusted
# to "digame/app/models/predictive_model.pth" or use the DEFAULT_MODEL_DIR logic.
# For this Dockerfile, we follow the explicit instruction.
COPY models $APP_HOME/digame/app/models/

# Copy entrypoint script
COPY digame/entrypoint.sh $APP_HOME/entrypoint.sh

# Create and switch to a non-root user
RUN addgroup --system app && adduser --system --ingroup app --home /home/app --shell /bin/bash app
RUN chown -R app:app $APP_HOME
RUN chmod +x $APP_HOME/entrypoint.sh
USER app

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command for development (can be overridden)
CMD ["sleep"]
