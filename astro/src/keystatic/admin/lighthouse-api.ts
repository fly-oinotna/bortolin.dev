// /api/lighthouse — monitor Lighthouse della Dashboard (misure in Netlify Blobs, archivio "lighthouse").
//   GET  → { enabled, runs: [{ date, results }] } dalla più recente
//   POST → avvia subito una misura (netlify/functions/lighthouse-background.mjs, 2–4 minuti)
// Solo online; in sviluppo { enabled: false }.
import type { APIRoute } from 'astro';
import { REMOTE, authorize, errorResponse } from './workspace';

export const prerender = false;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export const GET: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false, runs: [] });
  try {
    await authorize(request);
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('lighthouse');
    const { blobs } = await store.list({ prefix: 'run-' });
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 30);
    const runs = (await Promise.all(keys.map((k) => store.get(k, { type: 'json' })))).filter(Boolean);
    return json({ enabled: true, key: !!(import.meta.env.PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY), runs });
  } catch (e) { return errorResponse(e); }
};

export const POST: APIRoute = async ({ request, url }) => {
  if (!REMOTE) return json({ error: 'Disponibile solo nel pannello online' }, 400);
  try {
    await authorize(request);
    const secret = import.meta.env.KEYSTATIC_SECRET || process.env.KEYSTATIC_SECRET;
    const res = await fetch(`${url.origin}/.netlify/functions/lighthouse-background`, { method: 'POST', headers: { 'x-bd-secret': secret ?? '' } });
    return json({ ok: res.status === 202 || res.ok, status: res.status });
  } catch (e) { return errorResponse(e); }
};
