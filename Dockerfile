# Optimized single-stage build for React application
FROM node:23-alpine

WORKDIR /app

# Install Bun (faster than npm/yarn)
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash && \
    export PATH="$HOME/.bun/bin:$PATH" && \
    echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc && \
    echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
# First try with frozen lockfile, if that fails, update lockfile and proceed
RUN set -e; \
    if ! bun install --frozen-lockfile; then \
        echo "Lockfile is outdated, updating..."; \
        bun install; \
    fi

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production server
EXPOSE 3000
CMD ["bun", "run", "start"]