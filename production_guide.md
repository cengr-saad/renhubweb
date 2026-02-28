# LeasoRent Web Production Deployment Guide

This guide provides steps for deploying the LeasoRent web application via Docker.

## 📦 Docker Support Files Added
I've created the following files in your `web/` directory:
- [Dockerfile](file:///e:/rent/Replit%20rental%20app%20new/web/Dockerfile) - Multi-stage build for production.
- [.dockerignore](file:///e:/rent/Replit%20rental%20app%20new/web/.dockerignore) - Minimizes image size.
- [docker-compose.yml](file:///e:/rent/Replit%20rental%20app%20new/web/docker-compose.yml) - Easy deployment orchestration.

## 🚀 How to Deploy

### 1. Build & Start with Docker Compose (Recommended)
This is the easiest way to run the app with all necessary environment variables:

1.  Open the `web/docker-compose.yml` file and update the `environment` values with your actual production keys (Supabase and Database URL).
2.  Navigate to the `web` directory in your terminal.
3.  Run:
    ```bash
    docker-compose up -d --build
    ```

### 2. Manual Build (If using a container registry)
If you need to push a single image to a registry:

1.  Build the image:
    ```bash
    docker build -t leasorent-web:latest .
    ```
2.  Run the container:
    ```bash
    docker run -d \
      -p 5000:5000 \
      -e DATABASE_URL="your-db-url" \
      -e VITE_SUPABASE_URL="your-supabase-url" \
      -e VITE_SUPABASE_ANON_KEY="your-supabase-key" \
      leasorent-web:latest
    ```

## 🛠️ Performance & Scalability
- **Node v20 (Alpine)**: Lightweight and secure base image.
- **Multi-stage build**: Optimized to keep the production image small (only contains build artifacts, no source or dev tools).
- **Auto-restart**: The docker-compose configuration is set to `restart: always` to ensure uptime.

## 📝 Troubleshooting
The app serves both the **API** and the **Client** on port `5000`. Ensure this port is open in your server's firewall. 

If the client build fails during Docker build, check that you don't have circular dependencies in your `shared/` folder.
