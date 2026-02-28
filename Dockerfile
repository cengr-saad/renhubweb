# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install git to clone the repository
RUN apk add --no-cache git

# Concept: Clone the repository directly into the app folder
# This ensures we always build the latest code from GitHub
RUN git clone --depth 1 https://github.com/cengr-saad/renhubweb.git .

# Install dependencies
# Using --quiet to reduce logs on slow connections
RUN npm install --quiet

# Build the application
# This runs 'tsx script/build.ts' which bundles the server (esbuild) and client (vite)
RUN npm run build

# Prune dev dependencies to keep the built node_modules small
RUN npm prune --omit=dev

# --- Stage 2: Production Stage ---
# Concept: Optimized production runtime
# Note: We use Node.js instead of Nginx because our Express server handles the logic and static files.
FROM node:20-alpine

# Use an unprivileged user for security (optional but recommended)
# RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp
# USER nodeapp

WORKDIR /app

# Copy the built assets from the builder stage
# dist/ contains 'index.cjs' (server) and 'public/' (client static files)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Set environment to production
ENV NODE_ENV=production
# Our Express server listens on Port 5000 by default
ENV PORT=5000

# Expose the internal port (standard for our app)
EXPOSE 5000

# Concept: Launch the integrated server
# In our project, node runs the bundled CommonJS server file
CMD ["node", "dist/index.cjs"]
