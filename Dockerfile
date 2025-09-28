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

# Install all dependencies (including dev dependencies for build)
RUN bun install

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the React application with Nginx
FROM nginx:stable-alpine

# Copy the build output from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]