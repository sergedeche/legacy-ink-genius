# Supabase proxy для lit.sergeichernenko.ru

Минимальный Node-прокси. Принимает запросы на `api.lit.sergeichernenko.ru/*`
и пересылает их на `https://nqssnmhzgfkglpgiqoga.supabase.co/*` со стороны
сервера Timeweb (российский IP). Нужен потому, что домен `*.supabase.co`
сейчас блокируется частью российских провайдеров, и фронт не может напрямую
ходить за данными.

## Что делает

- `OPTIONS` → отвечает CORS-заголовками (`*` или конкретный origin).
- Любой другой метод → пересылает в Supabase с сохранением метода, заголовков,
  тела и стриминга ответа.
- `GET /healthz` и `GET /` → `200 ok` (для health-check Timeweb).

## Деплой в Timeweb Cloud (пошагово)

### 1. Создать второе приложение

Панель Timeweb → **Apps → Создать приложение** → вкладка **Dockerfile** →
источник **GitHub** → выбрать тот же репозиторий, что и для основного сайта.

Параметры:

```text
Тип:                Dockerfile
Path to Dockerfile: proxy/Dockerfile
Project directory:  proxy
Port:               8080
System dependencies: (оставить пустым)
Install/Build:       (оставить пустым)
```

Переменные окружения — не обязательны (дефолты уже в Dockerfile),
но при желании можно переопределить:

```text
SUPABASE_TARGET = https://nqssnmhzgfkglpgiqoga.supabase.co
```

### 2. Привязать поддомен `api.lit.sergeichernenko.ru`

1. В Timeweb (новое приложение) → **Домены** → **Добавить домен** →
   `api.lit.sergeichernenko.ru`.
2. Timeweb покажет IP для A-записи.
3. На reg.ru в DNS домена `sergeichernenko.ru` добавить:
   ```text
   Тип: A
   Имя: api.lit
   Значение: <IP от Timeweb>
   TTL: 3600
   ```
4. Подождать 15 мин – 2 часа. Timeweb автоматически выпустит Let's Encrypt SSL.

Проверка: `https://api.lit.sergeichernenko.ru/healthz` должно вернуть `ok`.

### 3. Переключить фронт на прокси

В **основном** приложении Timeweb (`lit.sergeichernenko.ru`):

- Открыть **Environment variables**.
- Поменять `VITE_SUPABASE_URL`:
  ```text
  было:  https://nqssnmhzgfkglpgiqoga.supabase.co
  стало: https://api.lit.sergeichernenko.ru
  ```
- Остальные переменные (`VITE_SUPABASE_PROJECT_ID`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`) **не трогать**.
- Нажать **Redeploy**, чтобы Vite пересобрал бандл с новым URL.

### 4. Проверка

- Открыть `https://lit.sergeichernenko.ru` без VPN с мобильного интернета РФ.
- В DevTools → Network запросы должны идти на
  `https://api.lit.sergeichernenko.ru/rest/v1/...` и `/functions/v1/...`,
  отвечать 200.
- Календарь показывает события, бронирование оформляется, письмо приходит.

## Откат

Если что-то сломалось — в env основного приложения вернуть
`VITE_SUPABASE_URL` на `https://nqssnmhzgfkglpgiqoga.supabase.co`
и сделать Redeploy. Прокси можно оставить выключенным, основной сайт
снова будет работать (через VPN, как до правок).
