# Build stage: install deps and build Vite app
FROM node:20-slim AS build

WORKDIR /app

# System deps (only curl; npm comes with the node image)
RUN DEBIAN_FRONTEND=noninteractive apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install JS deps with a clean, reproducible install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Runtime stage: serve static files with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback (200.html is also produced by vite plugin, this is a safety net)
RUN cp /usr/share/nginx/html/index.html /usr/share/nginx/html/200.html

# Nginx SPA config: fall back to index.html for client-side routes
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
