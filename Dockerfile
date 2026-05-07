# Build complete MLOps Studio application
FROM node:18-bullseye

# Install system dependencies including Docker
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    curl \
    wget \
    build-essential \
    docker.io \
    docker-compose \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy entire project
COPY . .

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Install model-registry dependencies
WORKDIR /app/model-registry
RUN pip install --no-cache-dir -r requirements.txt

# Install model-serving dependencies
WORKDIR /app/model-serving
RUN pip install --no-cache-dir -r requirements.txt

# Install monitoring dependencies
WORKDIR /app/monitoring
RUN pip install --no-cache-dir -r requirements.txt 2>/dev/null || true

# Install root dependencies if exists
WORKDIR /app
RUN npm install 2>/dev/null || true

# Expose ports
# Frontend: 3000
# Backend: 5000
# Model Registry: 5001
# Model Serving: 5002
# Monitoring: 5003
EXPOSE 3000 5000 5001 5002 5003 8080

# Create docker group for docker-in-docker
RUN groupadd -g 999 docker

# Volume for Docker socket (for docker-in-docker)
VOLUME ["/var/run/docker.sock"]

# Default command - keep container running
CMD ["sh", "-c", "echo 'MLOps Studio Container Started' && tail -f /dev/null"]
