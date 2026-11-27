// /api/not-found — pagine non trovate registrate dalla 404 del sito (netlify/functions/not-found.mjs, archivio "errori-404").
//   GET                         → { enabled, items }  dall'indirizzo più visitato
//   POST   { path, to }         → crea il redirect 301 path → to in Keystatic → Redirect (e lo toglie dall'elenco)
//   DELETE { path }             → ignora (lo toglie dall'elenco)
// Solo online (l'archivio è su Netlify); il redirect segue la stessa strada dei salvataggi del pannello (workspace.ts).
import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { REMOTE, authorize, errorResponse, open } from './workspace';

export const prerender = false;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const keyOf = (path: string) => createHash('sha1').update(path).digest('hex').slice(0, 20);
const REDIRECTS = 'src/content/it/redirects.json';

async function store() {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name: 'errori-404', consistency: 'strong' });
}

export const GET: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false, items: [] });
  try {
    await authorize(request);
    const s = await store();
    const { blobs } = await s.list();
    const items = (await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })))).filter(Boolean) as any[];
    items.sort((a, b) => b.count - a.count || String(b.last).localeCompare(String(a.last)));
    return json({ enabled: true, items: items.slice(0, 50) });
  } catch (e) { return errorResponse(e); }
};

export const POST: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ error: 'Disponibile solo nel pannello online' }, 400);
  try {
    const { path, to } = await request.json();
    if (!/^\/\S*$/.test(String(path)) || !/^(\/|https?:\/\/)\S*$/.test(String(to))) return json({ error: 'Percorso o destinazione non validi' }, 400);
    const ws = await open(request);
    if (ws.client) return json({ error: 'I redirect li gestiscono gli amministratori.' }, 403);
    const data = JSON.parse(readFileSync(REDIRECTS, 'utf8'));
    data.list ??= { items: [] };
    if (data.list.items.some((r: any) => r.from === path)) return json({ error: `Esiste già un redirect per ${path}` }, 409);
    data.list.items.push({ from: path, to: { discriminant: 'custom', value: to }, type: '301', force: false });
    ws.write(REDIRECTS, JSON.stringify(data, null, 2) + '\n');
    await ws.save(`Redirect: ${path} → ${to}`);
    await (await store()).delete(keyOf(path));
    return json({ ok: true });
  } catch (e) { return errorResponse(e); }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ error: 'Disponibile solo nel pannello online' }, 400);
  try {
    await authorize(request);
    const { path } = await request.json();
    await (await store()).delete(keyOf(String(path)));
    return json({ ok: true });
  } catch (e) { return errorResponse(e); }
};
