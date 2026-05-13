## Что важно понимать перед началом

Проект состоит из двух частей:

1. **Фронтенд** (React + Vite, папка `src/`) — статика, которая собирается в `dist/`. Вот её и переносим на Timeweb Cloud.
2. **Бэкенд** (Lovable Cloud — база данных, edge-функции `create-booking`, `verify-payment`, отправка писем и т.д.) — **остаётся на Lovable**. Перенести его на Timeweb нельзя, и не нужно: фронтенд с Timeweb продолжит дёргать те же API через `https://nqssnmhzgfkglpgiqoga.supabase.co`. CORS в функциях уже стоит `*`, так что новый домен заработает без правок.

То есть Timeweb получает только статический сайт. Бронирования, письма, оплата — всё продолжает работать через Lovable Cloud.

---

## Что я подготовлю в коде (этот шаг)

### 1. SPA-fallback для роутов `/rules`, `/unsubscribe`

Сейчас при прямом заходе на `indurobot.ru/rules` Timeweb отдаст 404, потому что физически файла нет — роутинг клиентский (React Router). Добавлю два файла, чтобы любой статический хостинг (Timeweb, Nginx, Netlify-like) корректно отдавал `index.html` на неизвестных путях:

- `public/_redirects` — правило `/* /index.html 200` (читается Netlify-совместимыми хостингами).
- В `vite.config.ts` или через `package.json` postbuild — копирование `dist/index.html` в `dist/200.html` как универсальный fallback.

### 2. Документ-инструкция в репозитории

Создам `DEPLOY_TIMEWEB.md` с готовым чек-листом для Timeweb (build команды, переменные окружения, домен). Чтобы не потерять и можно было дать админу.

### 3. Что НЕ трогаю

- `.env`, `src/integrations/supabase/client.ts`, `supabase/config.toml` — managed-файлы Lovable.
- Edge-функции — работают как есть.
- Дизайн, бизнес-логика — не трогаем.

---

## Параметры для Timeweb (раздел Apps → Static site)

```text
Repository:        ваш GitHub-репозиторий
Branch:            main
Framework preset:  Vite (или Custom)
Node.js version:   20
Install command:   npm ci
Build command:     npm run build
Output directory:  dist
```

### Переменные окружения (Build-time, обязательно!)

Vite "запекает" `VITE_*` переменные в бандл во время сборки. Если их не задать в Timeweb, фронт соберётся без ключей и бэкенд работать не будет. В разделе **Environment variables** приложения Timeweb добавить:

```text
VITE_SUPABASE_PROJECT_ID       = nqssnmhzgfkglpgiqoga
VITE_SUPABASE_URL              = https://nqssnmhzgfkglpgiqoga.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY  = eyJhbGciOiJIUzI1NiIs... (значение из текущего .env)
```

Эти ключи публичные (anon key), их можно безопасно передавать.

---

## Порядок действий (что сделаете вы, что — я)

| Шаг | Кто | Действие |
|---|---|---|
| 1 | **Я** | Добавлю `_redirects`, postbuild-копию `200.html`, файл `DEPLOY_TIMEWEB.md` |
| 2 | Вы | В Lovable: чат → `+` → GitHub → Connect → Create Repository |
| 3 | Вы | Регистрация на Timeweb Cloud, пополнение баланса |
| 4 | Вы | Apps → Создать → Static site → выбрать репозиторий + параметры выше + env-переменные |
| 5 | Вы | Дождаться первого билда, проверить работу на `xxxx.twc1.net` |
| 6 | Вы | В Timeweb: Домены → добавить `lit.sergeichernenko.ru` (и `www`), получить IP |
| 7 | Вы | У регистратора домена (где куплен `sergeichernenko.ru`): удалить старые A-записи поддомена `lit` (сейчас на `185.158.133.1` Lovable), добавить новые A на IP Timeweb |
| 8 | Вы | В Lovable: Settings → Domains → удалить `lit.sergeichernenko.ru`, чтобы Lovable не пытался выпускать SSL |
| 9 | Вы | Проверить автодеплой: правка в Lovable → коммит в GitHub → билд в Timeweb |

---

## Что нужно от вас, чтобы продолжить после моего шага

1. **Подтверждение:** делаем именно `lit.sergeichernenko.ru` (поддомен), не корень `sergeichernenko.ru`?
2. **Где куплен `sergeichernenko.ru`** (Reg.ru / Beget / Timeweb / другой) — для точной DNS-инструкции на шаге 7.
3. После шага 6 — пришлите IP, который выдаст Timeweb.

Подтвердите план — и я внесу правки в код (шаг 1 из таблицы).
