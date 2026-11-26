// GET /api/google-data — dati di Google Analytics 4 e Search Console per la Dashboard del pannello (ultimi 28 giorni).
//
// Configurazione:
//   - Keystatic → Google: "ID proprietà Google Analytics 4" e "Proprietà per la Dashboard" (Search Console)
//   - variabile d'ambiente GOOGLE_SERVICE_ACCOUNT: il file JSON dell'account di servizio di Google Cloud (su una riga)
//     con le API "Google Analytics Data" e "Google Search Console" abilitate; l'indirizzo e-mail dell'account va
//     aggiunto come Visualizzatore della proprietà GA4 e come utente della proprietà di Search Console.
// Risultati tenuti in memoria 30 minuti: aprire la Dashboard più volte non consuma quote.
import type { APIRoute } from 'astro';
import { createSign } from 'node:crypto';
import { read } from '../../lib/content';
import { open, errorResponse } from './workspace';

export const prerender = false;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const SCOPES = 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly';
const CACHE_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; data: unknown }>();
let tokenCache: { token: string; exp: number } | null = null;

function serviceAccount(): { client_email: string; private_key: string } | null {
  const raw = import.meta.env.GOOGLE_SERVICE_ACCOUNT || process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'); // JSON o JSON in base64
    const sa = JSON.parse(text);
    return sa.client_email && sa.private_key ? { client_email: sa.client_email, private_key: sa.private_key.replace(/\\n/g, '\n') } : null;
  } catch { return null; }
}

/** token di accesso dell'account di servizio (JWT firmato RS256 → OAuth) */
async function accessToken(sa: { client_email: string; private_key: string }) {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.token;
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: SCOPES, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(`Accesso a Google non riuscito: ${out.error_description || out.error || res.status}`);
  tokenCache = { token: out.access_token, exp: Date.now() + out.expires_in * 1000 };
  return tokenCache.token;
}

async function post(token: string, url: string, body: unknown) {
  const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const out = await res.json();
  if (!res.ok) throw new Error(out?.error?.message || `Errore ${res.status}`);
  return out;
}

const day = (d: Date) => d.toISOString().slice(0, 10);
const ago = (n: number) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return day(d); };

/** Google Analytics 4: utenti, sessioni, visualizzazioni, eventi chiave (28 giorni + periodo precedente), andamento e pagine */
async function ga4(token: string, id: string) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(id)}:runReport`;
  const metrics = ['activeUsers', 'sessions', 'screenPageViews', 'keyEvents'].map((name) => ({ name }));
  const [totals, daily, pages, channels] = await Promise.all([
    post(token, url, { dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }, { startDate: '56daysAgo', endDate: '29daysAgo' }], metrics }),
    post(token, url, { dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
    post(token, url, { dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 6 }),
    post(token, url, { dateRanges: [{ startDate: '28daysAgo', endDate: 'yesterday' }], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 6 }),
  ]);
  // con due periodi, ogni riga ha la dimensione "dateRange" (date_range_0 = attuale, date_range_1 = precedente)
  const sums = [0, 1].map((i) => {
    const row = (totals.rows ?? []).find((r: any) => r.dimensionValues?.[0]?.value === `date_range_${i}`) ?? (i === 0 ? totals.rows?.[0] : undefined);
    return Object.fromEntries(metrics.map((m, k) => [m.name, Number(row?.metricValues?.[k]?.value ?? 0)]));
  });
  return {
    totals: sums[0],
    previous: sums[1],
    daily: (daily.rows ?? []).map((r: any) => ({ date: r.dimensionValues[0].value, value: Number(r.metricValues[0].value) })),
    pages: (pages.rows ?? []).map((r: any) => ({ path: r.dimensionValues[0].value, value: Number(r.metricValues[0].value) })),
    channels: (channels.rows ?? []).map((r: any) => ({ name: r.dimensionValues[0].value, value: Number(r.metricValues[0].value) })),
  };
}

/** Search Console: clic, impressioni, CTR, posizione (i dati arrivano con ~3 giorni di ritardo), andamento, query e pagine */
async function gsc(token: string, property: string) {
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
  const cur = { startDate: ago(30), endDate: ago(3) };
  const prev = { startDate: ago(58), endDate: ago(31) };
  const [now, before, daily, queries, pages] = await Promise.all([
    post(token, url, { ...cur }),
    post(token, url, { ...prev }),
    post(token, url, { ...cur, dimensions: ['date'] }),
    post(token, url, { ...cur, dimensions: ['query'], rowLimit: 8 }),
    post(token, url, { ...cur, dimensions: ['page'], rowLimit: 6 }),
  ]);
  const tot = (r: any) => ({ clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, ctr: r?.ctr ?? 0, position: r?.position ?? 0 });
  return {
    totals: tot(now.rows?.[0]),
    previous: tot(before.rows?.[0]),
    daily: (daily.rows ?? []).map((r: any) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
    queries: (queries.rows ?? []).map((r: any) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position })),
    pages: (pages.rows ?? []).map((r: any) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
  };
}

export const GET: APIRoute = async ({ request, url }) => {
  try { await open(request, { maxAge: 60_000 }); } catch (e) { return errorResponse(e); }
  const google = (await read('google')) as any;
  const ga4Id = String(google.analytics?.ga4PropertyId ?? '').replace(/\D/g, '');
  const property = String(google.searchConsole?.gscProperty ?? '').trim();
  const sa = serviceAccount();
  const setup = { serviceAccount: !!sa, email: sa?.client_email ?? null, ga4: !!ga4Id, gsc: !!property };
  if (!sa || (!ga4Id && !property)) return json({ setup });

  const key = `${ga4Id}|${property}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS && !url.searchParams.has('refresh')) return json({ setup, ...(hit.data as object), cached: true });

  const token = await accessToken(sa).catch((e) => e as Error);
  if (token instanceof Error) return json({ setup, error: token.message });
  const [a, s] = await Promise.all([
    ga4Id ? ga4(token, ga4Id).catch((e) => ({ error: (e as Error).message })) : null,
    property ? gsc(token, property).catch((e) => ({ error: (e as Error).message })) : null,
  ]);
  const data = { ga4: a, gsc: s, updated: new Date().toISOString() };
  cache.set(key, { at: Date.now(), data });
  return json({ setup, ...data });
};
