# Legacy Ink Genius

## Важно для Timeweb Cloud

Если деплой падает на команде вида:

```text
apt-get install -y --no-install-recommends curl npm ci
```

это значит, что приложение в Timeweb создано как **Frontend → Static site / Другой JS-фреймворк**, а `npm ci` ошибочно попал в поле **System dependencies**. В этом режиме Timeweb использует свой автосборщик и не читает `Dockerfile` из репозитория.

### Чеклист исправления в панели Timeweb Cloud

Зайдите в **My Cloud → Apps → ваше приложение → Settings (Настройки) → раздел Build / Сборка** и выполните пункты по порядку:

#### 1. Поле «System dependencies» (Системные зависимости)
- [ ] Полностью **очистите** это поле. Оно должно остаться **пустым**.
- [ ] Здесь НЕ должно быть: `npm`, `npm ci`, `nodejs`, `node`, `yarn`, `curl`, `git`.
- [ ] Сюда можно писать **только названия Debian/Ubuntu пакетов** (например `libvips`, `ffmpeg`). Команды (`npm ci`, `npm install`) сюда писать нельзя — Timeweb подставит их в `apt-get install`, и сборка упадёт с `exit code: 100`.

#### 2. Поле «Install command» (Команда установки зависимостей)
- [ ] Установите значение: `npm ci`
- [ ] Если `npm ci` падает на lock-файле — используйте `npm install`.

#### 3. Поле «Build command» (Команда сборки)
- [ ] Установите значение: `npm run build`

#### 4. Поле «Output directory» / «Public directory» (Каталог сборки)
- [ ] Установите значение: `dist`

#### 5. Поле «Node.js version»
- [ ] Выберите `20.x` (или новее).

#### 6. Сохранить и пересобрать
- [ ] Нажмите **Save / Сохранить**.
- [ ] Запустите **Redeploy / Пересобрать**.
- [ ] В логах сборки команда `apt-get install ... npm ci` должна **исчезнуть**. Останутся только `npm ci` → `npm run build`.

### Альтернатива: деплой через Dockerfile
Если хотите использовать `Dockerfile` из репозитория (он уже настроен на `node:20-slim` без `apt-get`):

1. Удалите текущее приложение в Timeweb (тип Static / Frontend).
2. Создайте новое: **Create app → вкладка Dockerfile** (не Frontend!).
3. Подключите тот же репозиторий и ветку.
4. **Path to Dockerfile**: `Dockerfile` (в корне).
5. **Port**: `8080` (соответствует `EXPOSE 8080`).
6. Поля Install/Build/System dependencies оставьте пустыми — всё уже описано в `Dockerfile`.
7. Запустите Deploy.

> Признак того, что Timeweb всё ещё игнорирует `Dockerfile`: в логах появляется строка `apt-get install ... npm ci`. В Dockerfile-режиме этой команды быть не может в принципе.

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
