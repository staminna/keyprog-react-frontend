# Optimized single-stage build for React application
FROM node:23-alpine

WORKDIR /app

# Install Bun (faster than npm/yarn)
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash && \
    apk del curl && \
    rm -rf /var/cache/apk/*

ENV PATH="/root/.bun/bin:$PATH"

# Copy package files for dependency caching
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source files
COPY . .

# Build with production optimizations
ENV NODE_ENV=production
RUN bun run build

# Install serve for production (lightweight, no Nginx needed)
RUN bun add -g serve

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "3000"]