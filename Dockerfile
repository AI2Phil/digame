# Base image
FROM python:3.11-slim

# Update system packages and install necessary tools
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y netcat-traditional sudo && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/app

# Set working directory
WORKDIR $APP_HOME

# Install dependencies
# Copy requirements.txt first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (will be mounted as volume in dev mode)
COPY . $APP_HOME/

# Create models directory
RUN mkdir -p $APP_HOME/models/

# Copy entrypoint script
COPY entrypoint.sh $APP_HOME/entrypoint.sh

# Create and switch to a non-root user
RUN addgroup --system app && adduser --system --ingroup app --home /home/app --shell /bin/bash app
RUN chown -R app:app $APP_HOME
RUN chmod +x $APP_HOME/entrypoint.sh
# Add app user to sudo group for dev container
RUN usermod -aG sudo app
RUN echo "app ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
USER app

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command for development (can be overridden)
CMD ["dev"]
