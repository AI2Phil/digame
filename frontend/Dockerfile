# First stage: build
FROM node:20.18.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# Use npm install instead of npm ci to handle package-lock.json sync issues
RUN npm install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Build the application with standalone output for Docker
ENV DOCKER_BUILD=true
RUN npm run build

# Second stage: production image
FROM node:20.18.1-alpine

WORKDIR /app

# Copy only what we need for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the production server
CMD ["node", "server.js"]