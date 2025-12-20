# Use official Playwright image with all browsers and dependencies
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY handles.txt ./

# Create directories for sessions and captures
# Note: /app/sessions will be mounted as a Railway volume for persistence
RUN mkdir -p /app/sessions/ig /app/captures

# Set environment variables for Playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=production

# Default command - can be overridden by railway.json
CMD ["node", "src/runOnce.js"]
