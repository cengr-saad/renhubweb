# Stage 1: Build the application
FROM node:20-alpine AS builder

# Install Git and build essentials
RUN apk add --no-cache git python3 make g++

# Define build arguments for the repository
ARG REPO_URL
ARG GITHUB_TOKEN
ARG BRANCH=main

WORKDIR /app

# Clone the repository using the token (if provided) or public URL
# We use a trick to ensure we always pull the latest: add a random cache buster
ADD https://api.github.com/repos/cengr-saad/renhubweb/git/refs/heads/${BRANCH} version.json
RUN if [ -z "$GITHUB_TOKEN" ] ; then \
      git clone --depth 1 --branch ${BRANCH} https://github.com/cengr-saad/renhubweb.git . ; \
    else \
      git clone --depth 1 --branch ${BRANCH} https://${GITHUB_TOKEN}@github.com/cengr-saad/renhubweb.git . ; \
    fi

# Move into the web directory if your project is in a monorepo
# WORKDIR /app/web

# Install all dependencies
RUN npm ci

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
