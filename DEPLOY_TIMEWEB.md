# Деплой на Timeweb Cloud через Dockerfile из GitHub

Этот проект состоит из двух частей:

- **Фронтенд** — React + Vite, собирается в `dist/` внутри Dockerfile. Хостится на **Timeweb Cloud**.
- **Бэкенд** — Lovable Cloud (Supabase): база, edge-функции (`create-booking`, `verify-payment`, отправка писем и т.д.). **Остаётся на Lovable.** Фронт обращается к нему по адресу `https://nqssnmhzgfkglpgiqoga.supabase.co`. CORS открыт для всех источников (`*`), поэтому новый домен заработает без правок.

---

## Шаг 1. Подключить репозиторий к GitHub

В Lovable: чат → кнопка `+` → **GitHub** → **Connect project** → **Create Repository**. После этого каждый коммит из Lovable автоматически попадает в репозиторий.

## Шаг 2. Создать приложение на Timeweb Cloud

Панель Timeweb Cloud → **Apps** → **Создать приложение** → вкладка **Dockerfile** → источник **GitHub** → выбрать репозиторий и ветку `main`.

Важно: не выбирайте **Frontend → Static site / Другой JS-фреймворк** для этого проекта, если хотите использовать Dockerfile. В этом режиме Timeweb игнорирует `Dockerfile` и запускает свой автосборщик с `apt-get`. Именно он даёт ошибку вида:

```text
apt-get install -y --no-install-recommends curl npm ci
```

`npm ci` — это команда Node.js, а не системный пакет. Если она попала в поле системных зависимостей Timeweb, `apt-get` завершится с `exit code: 100`.

### Параметры Dockerfile-приложения

```text
Project directory:  оставить пустым, если Dockerfile лежит в корне
Port:               определяется из EXPOSE 8080
Start command:      не указывать — используется CMD из Dockerfile
System dependencies: оставить пустым
```

Если вы всё же создаёте **Frontend → Static site**, тогда в настройках должны быть только frontend-команды:

```text
Install command:       npm ci
Build command:         npm run build
Output directory:      dist
System dependencies:   оставить пустым
```

Не вписывайте `npm ci` в **System dependencies**.

### Переменные окружения (обязательно!)

Vite запекает `VITE_*` переменные в бандл во время сборки. Без них фронт не сможет обращаться к бэкенду.

В разделе **Environment variables** приложения Timeweb добавьте:

```text
VITE_SUPABASE_PROJECT_ID       = nqssnmhzgfkglpgiqoga
VITE_SUPABASE_URL              = https://nqssnmhzgfkglpgiqoga.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY  = <значение из .env проекта, начинается с eyJhbGciOi...>
```

Это публичный (anon) ключ — его безопасно хранить в фронте.

## Шаг 3. SPA-роутинг

Уже настроено в коде:

- `public/_redirects` — правило `/* /index.html 200` для Netlify-совместимых хостингов.
- `vite.config.ts` — после сборки копирует `dist/index.html` в `dist/200.html` (универсальный fallback, который понимают многие статические хостинги, включая Timeweb).

Если после деплоя прямой заход на `/rules` всё равно даёт 404 — в настройках приложения Timeweb включить опцию **SPA fallback** или указать `index.html` как fallback-страницу для 404 (название может отличаться, ищите "Single Page Application", "fallback", "404 → index.html").

## Шаг 4. Привязка домена `lit.sergeichernenko.ru`

1. В панели приложения Timeweb → **Домены** → **Добавить домен** → `lit.sergeichernenko.ru`.
2. Timeweb покажет IP-адрес для A-записи (вид `92.255.xx.xx`).
3. У регистратора домена `sergeichernenko.ru` (где куплен) откройте управление DNS:
   - Удалите старую A-запись поддомена `lit`, которая указывает на `185.158.133.1` (Lovable).
   - Удалите TXT-запись `_lovable.lit` (если есть).
   - Добавьте новую A-запись `lit` → IP, выданный Timeweb.
4. Подождите распространение DNS (15 мин – 2 часа). Timeweb автоматически выпустит SSL Let's Encrypt.

## Шаг 5. Отвязать домен от Lovable

В Lovable: **Project Settings → Domains** → у `lit.sergeichernenko.ru` → ⋯ → **Remove**.

Это нужно, чтобы Lovable перестал пытаться выпускать SSL для домена, который теперь на Timeweb. Превью `*.lovable.app` продолжит работать.

## Шаг 6. Проверка автодеплоя

1. В Lovable измените что-нибудь мелкое.
2. На GitHub появится новый коммит.
3. В Timeweb → **Apps → Деплои** автоматически запустится новый билд.
4. Через 1–2 минуты обновите `lit.sergeichernenko.ru` — изменение появится.

---

## Что НЕ нужно делать

- Не переносите edge-функции (`supabase/functions/*`) на Timeweb — они работают только в Lovable Cloud.
- Не трогайте `.env`, `src/integrations/supabase/client.ts`, `supabase/config.toml` — это управляемые файлы Lovable.
- Не публикуйте проект через Lovable Publish после переезда — это может перезаписать DNS-настройки.
