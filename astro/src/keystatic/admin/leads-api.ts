// /api/leads — RICHIESTE dal modulo contatti (salvate da netlify/functions/contact.mjs in Netlify Blobs, archivio "richieste").
//   GET    → { enabled, items }          elenco, dalla più recente
//   PATCH  { id, status?, notes? }       aggiorna stato e note
//   DELETE { id }                        elimina (es. spam)
// Solo online e solo per chi è entrato nel pannello; in sviluppo l'archivio non esiste ({ enabled: false }).
import type { APIRoute } from 'astro';
import { REMOTE, authorize, errorResponse } from './workspace';

export const prerender = false;

export const STATUSES = ['nuova', 'contattato', 'preventivo', 'acquisito', 'perso'] as const;
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

async function store() {
  const { getStore } = await import('@netlify/blobs');
  return getStore('richieste');
}

export const GET: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false, items: [] });
  try {
    await authorize(request);
    const s = await store();
    const { blobs } = await s.list();
    const items = (await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })))).filter(Boolean);
    items.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return json({ enabled: true, statuses: STATUSES, items });
  } catch (e) { return errorResponse(e); }
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false }, 400);
  try {
    await authorize(request);
    const body = await request.json();
    const s = await store();
    const item: any = await s.get(String(body.id), { type: 'json' });
    if (!item) return json({ error: 'Richiesta non trovata' }, 404);
    if (body.status && (STATUSES as readonly string[]).includes(body.status)) item.status = body.status;
    if (typeof body.notes === 'string') item.notes = body.notes.slice(0, 5000);
    item.updatedAt = new Date().toISOString();
    await s.setJSON(item.id, item);
    return json({ ok: true, item });
  } catch (e) { return errorResponse(e); }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false }, 400);
  try {
    await authorize(request);
    const body = await request.json();
    await (await store()).delete(String(body.id));
    return json({ ok: true });
  } catch (e) { return errorResponse(e); }
};
