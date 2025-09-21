# Stage 1: Build the React application
FROM node:23-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl bash && \
    curl -fsSL https://bun.sh/install | bash && \
    apk del curl

ENV PATH="/root/.bun/bin:$PATH"

# Copy package files first for better layer caching
COPY package.json bun.lockb ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production=false

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the React application with Nginx
FROM nginx:stable-alpine

# Create a non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy the build output from the build stage
COPY --from=build --chown=appuser:appgroup /app/dist /usr/share/nginx/html

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Set proper permissions
RUN chown -R appuser:appgroup /var/cache/nginx /var/run /var/log/nginx && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx

# Make the container more secure
RUN \
    # Remove unnecessary files
    rm -rf /etc/nginx/conf.d/*.default && \
    # Make directories writable by appuser
    chown -R appuser:appgroup /etc/nginx/conf.d && \
    # Make nginx pid directory writable by appuser
    mkdir -p /var/run/nginx && \
    chown -R appuser:appgroup /var/run/nginx

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]