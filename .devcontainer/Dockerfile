# Use an official Python base image
FROM python:3.10-slim

# Install OS packages
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev && \
    apt-get clean

# Set working directory
WORKDIR /workspace

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy everything else
COPY . .

# Default shell
CMD [ "bash" ]
