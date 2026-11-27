// Registro delle pagine non trovate (Netlify Function, POST /api/404, chiamata dalla pagina 404 del sito).
// Salva in Netlify Blobs (archivio "errori-404") quante volte è stato aperto ogni indirizzo inesistente e da dove:
// il pannello (Dashboard → Pagine non trovate) li mostra e permette di creare un redirect con un clic.
// Nessun dato personale: solo l'indirizzo (senza parametri) e il dominio di provenienza.
import { getStore } from '@netlify/blobs';
import { createHash } from 'node:crypto';

export default async (req) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });
  let body;
  try { body = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400 }); }
  const path = String(body?.path ?? '').split('?')[0].split('#')[0].slice(0, 300);
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api/')) return new Response(null, { status: 204 });
  let ref = '';
  try { ref = body?.ref ? new URL(body.ref).hostname : ''; } catch { /* provenienza non valida */ }

  const store = getStore('errori-404');
  const key = createHash('sha1').update(path).digest('hex').slice(0, 20);
  const now = new Date().toISOString();
  const item = (await store.get(key, { type: 'json' }).catch(() => null)) ?? { path, count: 0, first: now, refs: {} };
  item.count += 1;
  item.last = now;
  if (ref) {
    item.refs[ref] = (item.refs[ref] ?? 0) + 1;
    // si tengono solo le 5 provenienze più frequenti
    item.refs = Object.fromEntries(Object.entries(item.refs).sort((a, b) => b[1] - a[1]).slice(0, 5));
  }
  await store.setJSON(key, item);
  return new Response(null, { status: 204 });
};

export const config = { path: '/api/404' };
