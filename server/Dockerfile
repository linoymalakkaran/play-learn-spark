FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install system dependencies for SQLite and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code and healthcheck
COPY src/ ./src/
COPY healthcheck.js ./

# Create required directories and set permissions
RUN mkdir -p uploads logs data
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application using ts-node
CMD ["npx", "ts-node", "src/simple-server.ts"]