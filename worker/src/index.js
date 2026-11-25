// Comments, visit counter, and rating API for Последната глогинка.
// Runs on Cloudflare Workers with one D1 database (binding: DB).

const PAGES = new Set(['diary', 'library']);
const CAPTCHA_CODE = 'abvau';
const NAME_MAX = 40;
const TEXT_MAX = 2000;
const RATE_LIMIT_COUNT = 3;          // comments...
const RATE_LIMIT_MINUTES = 10;       // ...in this many minutes, for each visitor
const TIME_ZONE = 'Europe/Sofia';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map(s => s.trim());
    const cors = allowed.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }
      : {};

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Write requests must come from the site itself.
    if (request.method === 'POST' && !cors['Access-Control-Allow-Origin']) {
      return json({ error: 'forbidden' }, 403, cors);
    }

    const url = new URL(request.url);
    try {
      const route = `${request.method} ${url.pathname}`;
      switch (route) {
        case 'GET /comments':  return json(await listComments(env, url), 200, cors);
        case 'POST /comments': return await addComment(env, request, cors);
        case 'POST /visit':    return json(await recordVisit(env, request), 200, cors);
        case 'GET /rating':    return json(await getRating(env), 200, cors);
        case 'POST /rating':   return await addRating(env, request, cors);
        default:               return json({ error: 'not found' }, 404, cors);
      }
    } catch (err) {
      console.error(err);
      return json({ error: 'server error' }, 500, cors);
    }
  },
};

// ---------- comments ----------

async function listComments(env, url) {
  const page = url.searchParams.get('page');
  if (!PAGES.has(page)) return { comments: [] };
  const { results } = await env.DB
    .prepare('SELECT id, name, text, created_at FROM comments WHERE page = ? ORDER BY id')
    .bind(page)
    .all();
  return { comments: results };
}

async function addComment(env, request, cors) {
  const body = await readJson(request);
  if (!body) return json({ error: 'bad request' }, 400, cors);

  // Honeypot: people never see this field. Pretend success for bots.
  if (body.website) return json({ ok: true }, 200, cors);

  const page = String(body.page || '');
  const name = clean(body.name);
  const text = clean(body.text);
  const captcha = String(body.captcha || '').trim().toLowerCase();

  if (!PAGES.has(page))                      return json({ error: 'page' }, 400, cors);
  if (!name || name.length > NAME_MAX)       return json({ error: 'name' }, 400, cors);
  if (!text || text.length > TEXT_MAX)       return json({ error: 'text' }, 400, cors);
  if (captcha !== CAPTCHA_CODE)              return json({ error: 'captcha' }, 400, cors);

  const ipHash = await hash(env.SALT, clientIp(request));
  const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60_000).toISOString();
  const recent = await env.DB
    .prepare('SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?')
    .bind(ipHash, since)
    .first('n');
  if (recent >= RATE_LIMIT_COUNT) return json({ error: 'rate' }, 429, cors);

  const createdAt = new Date().toISOString();
  const { meta } = await env.DB
    .prepare('INSERT INTO comments (page, name, text, created_at, ip_hash) VALUES (?, ?, ?, ?, ?)')
    .bind(page, name, text, createdAt, ipHash)
    .run();

  return json({ ok: true, comment: { id: meta.last_row_id, name, text, created_at: createdAt } }, 201, cors);
}

// ---------- visit counter ----------

async function recordVisit(env, request) {
  const today = sofiaDay(0);
  const yesterday = sofiaDay(-1);
  const visitor = await hash(env.SALT, `${clientIp(request)}|${request.headers.get('User-Agent') || ''}|${today}`);

  const { meta } = await env.DB
    .prepare('INSERT OR IGNORE INTO visits (day, hash) VALUES (?, ?)')
    .bind(today, visitor)
    .run();

  if (meta.changes === 1) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO daily_counts (day, count) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET count = count + 1').bind(today),
      env.DB.prepare('DELETE FROM visits WHERE day < ?').bind(yesterday),
    ]);
  }

  const [totalRow, yesterdayRow] = await env.DB.batch([
    env.DB.prepare('SELECT COALESCE(SUM(count), 0) AS n FROM daily_counts'),
    env.DB.prepare('SELECT count AS n FROM daily_counts WHERE day = ?').bind(yesterday),
  ]);

  return {
    total: Number(env.START_TOTAL || 0) + (totalRow.results[0]?.n || 0),
    yesterday: yesterdayRow.results[0]?.n || 0,
  };
}

// ---------- rating ----------

async function getRating(env) {
  const row = await env.DB
    .prepare('SELECT COUNT(*) AS votes, AVG(value) AS average FROM rating_votes')
    .first();
  return { votes: row.votes, average: row.votes ? Math.round(row.average * 10) / 10 : null };
}

async function addRating(env, request, cors) {
  const body = await readJson(request);
  const value = Number(body?.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return json({ error: 'value' }, 400, cors);
  }
  const voter = await hash(env.SALT, `${clientIp(request)}|${request.headers.get('User-Agent') || ''}`);
  await env.DB
    .prepare('INSERT INTO rating_votes (voter, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(voter) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(voter, value, new Date().toISOString())
    .run();
  return json(await getRating(env), 200, cors);
}

// ---------- helpers ----------

function json(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

// Trim, collapse runs of blank lines, and drop control characters.
function clean(value) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || '';
}

async function hash(salt, value) {
  const data = new TextEncoder().encode(`${salt}|${value}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Date in Bulgaria as YYYY-MM-DD, offset by whole days.
function sofiaDay(offsetDays) {
  const date = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);
}
