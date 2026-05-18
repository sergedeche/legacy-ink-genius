# Минимальный контейнер для прокси Supabase.
# Никаких apt-get, никаких зависимостей — только встроенный node:fetch.
FROM node:20-slim

WORKDIR /app

COPY package.json ./
COPY server.mjs ./

ENV NODE_ENV=production
ENV PORT=8080
# SUPABASE_TARGET можно переопределить переменной окружения в Timeweb.
ENV SUPABASE_TARGET=https://nqssnmhzgfkglpgiqoga.supabase.co

EXPOSE 8080
CMD ["node", "server.mjs"]
