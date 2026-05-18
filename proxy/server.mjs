// Минимальный HTTP-прокси для Supabase.
// Принимает запросы на api.lit.sergeichernenko.ru/* и пересылает их
// на https://nqssnmhzgfkglpgiqoga.supabase.co/* со стороны российского сервера.
// Браузер РФ-пользователя ходит только на наш домен и не упирается в блок *.supabase.co.

import { createServer } from 'node:http';

const TARGET = process.env.SUPABASE_TARGET || 'https://nqssnmhzgfkglpgiqoga.supabase.co';
const PORT = Number(process.env.PORT || 8080);

// Заголовки, которые нельзя прокидывать «в лоб» — node fetch управляет ими сам.
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-length',
]);

function buildCorsHeaders(origin) {
  // Разрешаем все origin'ы (как у Lovable Cloud по умолчанию),
  // но возвращаем конкретный, чтобы работал credentials-режим.
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, prefer, range, x-upsert',
    'Access-Control-Expose-Headers': 'content-range, x-total-count',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const HEALTH_PATHS = new Set(['/', '/healthz', '/health', '/status', '/ping']);

function log(method, url, status) {
  console.log(`${method} ${url} -> ${status}`);
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const cors = buildCorsHeaders(origin);
  const urlPath = (req.url || '/').split('?')[0];

  // Health-check для Timeweb — отвечаем на любой метод (GET/HEAD/OPTIONS/POST)
  if (HEALTH_PATHS.has(urlPath)) {
    res.writeHead(200, { 'Content-Type': 'text/plain', ...cors });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end('ok');
    }
    log(req.method, req.url, 200);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    log(req.method, req.url, 204);
    return;
  }

  const targetUrl = TARGET + req.url;

  // Готовим заголовки для апстрима
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers[key] = Array.isArray(value) ? value.join(', ') : String(value ?? '');
    }
  }
  // Host подставит fetch автоматически из targetUrl

  // Собираем тело (для не-GET/HEAD)
  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    const respHeaders = {};
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        respHeaders[key] = value;
      }
    });
    // Перебиваем CORS своими значениями (Supabase отдаёт *, нам нужен конкретный origin)
    Object.assign(respHeaders, cors);

    res.writeHead(upstream.status, respHeaders);

    if (upstream.body) {
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (err) {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'application/json', ...cors });
    res.end(JSON.stringify({ error: 'bad_gateway', message: String(err?.message || err) }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Supabase proxy listening on ${PORT}, target=${TARGET}`);
});
