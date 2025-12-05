# Optimized single-stage build for React application
FROM node:23-alpine

WORKDIR /app

# Install dependencies using npm (more stable for production)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy the application
COPY . .

# Build the application
RUN npm run build

# Install serve for production
RUN npm install -g serve

# Production server
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]