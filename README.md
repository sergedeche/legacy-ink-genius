# Legacy Ink Genius

## Важно для Timeweb Cloud

Если деплой падает на команде вида:

```text
apt-get install -y --no-install-recommends curl npm ci
```

это значит, что приложение в Timeweb создано как **Frontend → Static site / Другой JS-фреймворк**, а `npm ci` ошибочно попал в поле **System dependencies**. В этом режиме Timeweb использует свой автосборщик и не читает `Dockerfile` из репозитория.

Исправление в Timeweb:

1. Откройте настройки приложения → сборка/деплой.
2. Очистите поле **System dependencies** полностью.
3. Укажите `npm ci` только в поле **Install command**.
4. `Build command`: `npm run build`.
5. `Output directory`: `dist`.

Если нужен именно Dockerfile-деплой — создайте приложение заново через вкладку **Dockerfile**, оставьте путь проекта пустым и используйте порт `8080` из `EXPOSE 8080`.

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
