# Dependencies stage: install JS deps only, without apt-get
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build stage: compile the Vite app
FROM node:20-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime stage: serve static files using only Node built into node:20-slim
FROM node:20-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY docker-server.mjs ./docker-server.mjs

EXPOSE 8080
CMD ["node", "docker-server.mjs"]
