# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install git to clone the repository
RUN apk add --no-cache git

# Concept: Clone the repository directly into the app folder
# This ensures we always build the latest code from GitHub
RUN git clone --depth 1 https://github.com/cengr-saad/renhubweb.git .

# Install dependencies and build the application
# We use 'npm ci' for faster, more reliable installs in CI/production
# --no-audit and --no-fund reduce memory usage and overhead
RUN npm ci --no-audit --no-fund --quiet
RUN npm run build

# Prune dev dependencies to keep the image small
RUN npm prune --omit=dev

# --- Stage 2: Production Stage ---
# Concept: Optimized production runtime
# Note: We use Node.js instead of Nginx because this app includes a backend server (Express)
FROM node:20-alpine

WORKDIR /app

# Copy the built assets and the production server from the builder stage
# dist/ contains both 'index.cjs' (server) and 'public/' (client static files)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment to production
ENV NODE_ENV=production
# The app serves both API and Client on this port
ENV PORT=5000

# Expose the internal port
EXPOSE 5000

# Concept: Launch the integrated server
# In this app, the Express server handles both API and static file serving
CMD ["node", "dist/index.cjs"]
