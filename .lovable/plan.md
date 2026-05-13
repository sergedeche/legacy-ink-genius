## Причина ошибки

Сборка падает не из-за GitHub-ветки и не из-за React/Vite, а из-за Dockerfile в Timeweb:

```text
apt-get install ... curl npm ci
E: Unable to locate package ci
```

`npm ci` попал внутрь команды `apt-get install`, поэтому Linux пытается установить пакет с названием `ci`. Такого пакета нет, поэтому билд останавливается.

## Что нужно сделать

1. Найти Dockerfile в репозитории GitHub/Timeweb, который сейчас использует Timeweb.
2. Исправить блок установки зависимостей:
   - через `apt-get install` устанавливать только системные пакеты, например `curl`;
   - `npm ci` вынести отдельной командой после копирования `package.json` и `package-lock.json`.
3. Убедиться, что финальная сборка делает:
   - `npm ci`
   - `npm run build`
   - отдаёт папку `dist`.

## Правильный вариант Dockerfile

```dockerfile
FROM node:20-slim AS build

WORKDIR /app

RUN DEBIAN_FRONTEND=noninteractive apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/index.html /usr/share/nginx/html/200.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Если Timeweb выбран как Static site, Dockerfile лучше вообще не использовать

Для Static site в Timeweb достаточно настроек:

```text
Install command: npm ci
Build command: npm run build
Output directory: dist
Node.js version: 20
```

То есть самый простой путь — удалить/отключить Dockerfile в Timeweb и деплоить как Vite Static site.

## Что я могу сделать после подтверждения

- Добавить в проект корректный Dockerfile, если вы хотите деплоить через контейнер.
- Или обновить инструкцию `DEPLOY_TIMEWEB.md`, чтобы Timeweb настраивался именно как Static site без Dockerfile.
- Если Dockerfile сейчас существует только в GitHub, но не в Lovable-проекте, нужно будет исправить его там вручную или синхронизировать сюда.