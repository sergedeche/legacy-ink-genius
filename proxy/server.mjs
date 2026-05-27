// Минимальный HTTP-прокси для Supabase.
// Принимает запросы на наш домен и потоково форвардит их на Supabase.
// Без буферизации тел запроса/ответа — это надёжнее на любых размерах.

import { createServer } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

const TARGET = process.env.SUPABASE_TARGET || 'https://nqssnmhzgfkglpgiqoga.supabase.co';
const PORT = Number(process.env.PORT || 8080);
const targetUrl = new URL(TARGET);

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
]);

const CORS_RESPONSE_HEADERS = new Set([
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-expose-headers',
  'access-control-max-age',
  'vary',
]);

function buildCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, prefer, range, x-upsert, x-verification-code',
    'Access-Control-Expose-Headers': 'content-range, x-total-count',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const HEALTH_PATHS = new Set(['/', '/healthz', '/health', '/status', '/ping']);

function log(method, url, status) {
  console.log(`${method} ${url} -> ${status}`);
}

const server = createServer((req, res) => {
  const origin = req.headers.origin || '';
  const cors = buildCorsHeaders(origin);
  const urlPath = (req.url || '/').split('?')[0];

  // Health-check
  if (HEALTH_PATHS.has(urlPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...cors,
    });
    res.end(req.method === 'HEAD' ? undefined : 'ok');
    log(req.method, req.url, 200);
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    log(req.method, req.url, 204);
    return;
  }

  // Подготовка заголовков
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    const lk = key.toLowerCase();
    if (HOP_BY_HOP.has(lk)) continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : String(value ?? '');
  }
  headers['host'] = targetUrl.host;

  const upstreamReq = httpsRequest(
    {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port || 443,
      method: req.method,
      path: req.url,
      headers,
    },
    (upstreamRes) => {
      const respHeaders = {};
      for (const [key, value] of Object.entries(upstreamRes.headers)) {
        const lk = key.toLowerCase();
        if (HOP_BY_HOP.has(lk)) continue;
        // Не пробрасываем CORS-заголовки от Supabase — иначе в ответе будут дубликаты
        // (Supabase отдаёт Access-Control-Allow-Origin: *, а мы ниже выставляем свой).
        if (CORS_RESPONSE_HEADERS.has(lk)) continue;
        respHeaders[key] = value;
      }
      // Перебиваем CORS своими значениями
      Object.assign(respHeaders, cors);

      res.writeHead(upstreamRes.statusCode || 502, respHeaders);
      upstreamRes.pipe(res);
      log(req.method, req.url, upstreamRes.statusCode || 502);
    },
  );

  upstreamReq.on('error', (err) => {
    console.error('Proxy upstream error:', err);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json', ...cors });
      res.end(JSON.stringify({ error: 'bad_gateway', message: String(err?.message || err) }));
    } else {
      try { res.end(); } catch {}
    }
    log(req.method, req.url, 502);
  });

  req.on('error', (err) => {
    console.error('Proxy client error:', err);
    try { upstreamReq.destroy(err); } catch {}
  });

  // Потоково форвардим тело запроса
  req.pipe(upstreamReq);
});

server.on('clientError', (err, socket) => {
  console.error('Server clientError:', err?.message);
  try { socket.destroy(); } catch {}
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Supabase proxy listening on ${PORT}, target=${TARGET}`);
});
