# Multi-stage Dockerfile for LeasoRent Web Production
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install build dependencies if needed (some npm packages require compilation)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for the build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the client and server
# This script runs vite build and esbuild
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Copy build artifacts from builder stage
# dist/ contains both the bundled server (index.cjs) and the public/ client files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
# Even though we bundle many deps, some might be externalized in script/build.ts
RUN npm install --omit=dev && npm cache clean --force

# Set environment to production
ENV NODE_ENV=production
# The app serves both API and Client on this port
ENV PORT=5000

# Expose the internal port
EXPOSE 5000

# Launch the server
CMD ["node", "dist/index.cjs"]
