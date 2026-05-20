# Dependencies stage: install JS deps only, without apt-get
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build stage: compile the Vite app
FROM node:20-slim AS build

WORKDIR /app

# VITE_* env vars must be present at build time — Vite inlines them into the bundle.
# Timeweb Cloud passes app env vars as Docker build args automatically.
ARG VITE_SUPABASE_PROJECT_ID
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN VITE_SUPABASE_PROJECT_ID="$(printf '%s' "$VITE_SUPABASE_PROJECT_ID" | tr -d '[:space:]')" && \
    VITE_SUPABASE_URL="$(printf '%s' "$VITE_SUPABASE_URL" | tr -d '[:space:]')" && \
    VITE_SUPABASE_PUBLISHABLE_KEY="$(printf '%s' "$VITE_SUPABASE_PUBLISHABLE_KEY" | tr -d '[:space:]')" && \
    test -n "$VITE_SUPABASE_URL" && \
    test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" && \
    VITE_SUPABASE_PROJECT_ID="$VITE_SUPABASE_PROJECT_ID" \
    VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
    VITE_SUPABASE_PUBLISHABLE_KEY="$VITE_SUPABASE_PUBLISHABLE_KEY" \
    npm run build

# Runtime stage: serve static files using only Node built into node:20-slim
FROM node:20-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY docker-server.mjs ./docker-server.mjs

EXPOSE 8080
CMD ["node", "docker-server.mjs"]
