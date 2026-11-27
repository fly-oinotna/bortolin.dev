// /api/media: MEDIATECA del pannello (in sviluppo sui file del progetto, online su GitHub: vedi workspace.ts).
//   GET    /api/media                 → elenco immagini di src/assets/images/** con peso, alt e dove sono usate
//   GET    /api/media?file=<percorso>  → il file (anteprime)
//   POST   /api/media?name=<file>      → carica un'immagine (corpo = file) in src/assets/images/library/
//   PUT    /api/media?path=<percorso>  → salva alt predefinito e marcatura AI ({ alt, ai }) in src/content/media.json
//   PATCH  /api/media?path=<percorso>&name=<nuovo nome> → rinomina il file e aggiorna tutti i riferimenti nei contenuti
//   DELETE /api/media?path=<percorso>  → elimina (solo se non è usata da nessuna parte)
import type { APIRoute } from 'astro';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join, relative, resolve, sep } from 'node:path';
import { open, errorResponse, type Session } from './workspace';

export const prerender = false;

// cartelle calcolate a ogni richiesta: online la cartella di lavoro è la copia del repository (workspace.ts)
const root = () => process.cwd();
const imagesDir = () => resolve(root(), 'src/assets/images');
const uploadsDir = () => join(imagesDir(), 'library');
const contentDir = () => resolve(root(), 'src/content');
const metaFile = () => join(contentDir(), 'media.json');
/** percorso assoluto → relativo alla cartella del sito (per le scritture dello spazio di lavoro) */
const rel = (file: string) => relative(root(), file).split(sep).join('/');
const EXT: Record<string, string> = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' };
const MAX_BYTES = 15 * 1024 * 1024;

/** dopo una modifica alla mediateca: il sito in sviluppo rilegge immagini e testi alternativi alla prossima richiesta (senza ricaricare il pannello) */
function refreshSite() {
  const server = (globalThis as any).__bdViteServer;
  for (const env of Object.values(server?.environments ?? {}) as any[]) env.moduleGraph?.invalidateAll?.();
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/** percorso salvato nei contenuti ("/src/assets/images/…") → file sul disco, solo dentro src/assets/images */
function fileOf(path: string | null) {
  if (!path) return null;
  const file = resolve(root(), path.replace(/^\/+/, ''));
  return file.startsWith(imagesDir() + sep) && EXT[extname(file).toLowerCase()] ? file : null;
}
const pathOf = (file: string) => '/' + rel(file);

function walk(dir: string, out: string[] = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) walk(f, out);
    else if (EXT[extname(f).toLowerCase()]) out.push(f);
  }
  return out;
}

/** dove è usata ogni immagine: si cercano i percorsi nei JSON dei contenuti */
function usages() {
  const labels: Record<string, string> = {
    'it/home.json': 'Home', 'it/settings.json': 'Impostazioni', 'it/offer.json': 'Offerta in evidenza', 'it/schema-markup.json': 'Schema Markup',
    'it/reviews.json': 'Reviews', 'it/navigation.json': 'Menu', 'it/cookies.json': 'Cookies', 'it/google.json': 'Google', 'it/redirects.json': 'Redirect',
  };
  const out = new Map<string, string[]>();
  const files: string[] = [];
  const scan = (dir: string) => readdirSync(dir).forEach((n) => { const f = join(dir, n); if (statSync(f).isDirectory()) scan(f); else if (f.endsWith('.json') && f !== metaFile()) files.push(f); });
  scan(contentDir());
  for (const f of files) {
    const r = relative(contentDir(), f).split(sep).join('/');
    const text = readFileSync(f, 'utf8');
    let label = labels[r];
    if (!label) {
      let title = basename(f, '.json');
      try { title = JSON.parse(text).title || title; } catch { /* JSON non valido */ }
      label = r.startsWith('it/posts/') ? `Post › ${title}` : r.startsWith('it/pages/') ? `Pagine › ${title}` : r;
    }
    for (const m of text.matchAll(/"(\/src\/assets\/images\/[^"]+)"/g)) {
      const list = out.get(m[1]) ?? [];
      if (!list.includes(label)) list.push(label);
      out.set(m[1], list);
    }
  }
  return out;
}

/** marcatura AI secondo l'AI Act (art. 50), come AM Tools 3 → Images → AI Warning */
const AI = ['none', 'ai', 'modified', 'generated'];

/** testi alternativi, marcatura AI e data di caricamento (online tutti i file hanno la stessa data: si ordina con questa) */
type Meta = Record<string, { alt?: string; ai?: string; added?: number }>;
const readMeta = (): Meta => { try { return JSON.parse(readFileSync(metaFile(), 'utf8')); } catch { return {}; } };
const writeMeta = (ws: Session, meta: Meta) => ws.write(rel(metaFile()), JSON.stringify(meta, null, 2) + '\n');

export const GET: APIRoute = async ({ url, request }) => {
  try {
    const one = url.searchParams.get('file');
    // anteprime: la copia controllata negli ultimi 30 s va bene; l'elenco invece è sempre aggiornato
    await open(request, { maxAge: one !== null ? 30000 : 0 });
    if (one !== null) {
      const file = fileOf(one);
      if (!file || !existsSync(file)) return new Response('Non trovato', { status: 404 });
      return new Response(new Uint8Array(readFileSync(file)), { headers: { 'Content-Type': EXT[extname(file).toLowerCase()], 'Cache-Control': 'no-store' } });
    }
    const used = usages();
    const meta = readMeta();
    const items = walk(imagesDir()).map((f) => {
      const path = pathOf(f);
      const st = statSync(f);
      return { path, name: basename(f), folder: relative(imagesDir(), f).split(sep).slice(0, -1).join('/'), size: st.size, mtime: meta[path]?.added ?? st.mtimeMs, alt: meta[path]?.alt ?? '', ai: meta[path]?.ai ?? 'none', usedIn: used.get(path) ?? [] };
    }).sort((a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name));
    return json({ items });
  } catch (e) { return errorResponse(e); }
};

export const POST: APIRoute = async ({ url, request }) => {
  try {
    const raw = basename(url.searchParams.get('name') ?? '');
    const ext = extname(raw).toLowerCase();
    if (!EXT[ext]) return json({ error: 'Formato non supportato: usa SVG, PNG, JPG, WebP, AVIF o GIF.' }, 400);
    const body = new Uint8Array(await request.arrayBuffer());
    if (!body.length || body.length > MAX_BYTES) return json({ error: 'File vuoto o più grande di 15 MB.' }, 400);
    const ws = await open(request);
    // nome pulito, senza sovrascrivere file esistenti
    const stem = basename(raw, extname(raw)).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'immagine';
    let file = join(uploadsDir(), stem + ext);
    for (let i = 2; existsSync(file); i++) file = join(uploadsDir(), `${stem}-${i}${ext}`);
    ws.write(rel(file), body);
    const meta = readMeta();
    meta[pathOf(file)] = { ...meta[pathOf(file)], added: Date.now() };
    writeMeta(ws, meta);
    await ws.save(`Mediateca: caricata ${basename(file)}`);
    refreshSite();
    return json({ path: pathOf(file) });
  } catch (e) { return errorResponse(e); }
};

export const PUT: APIRoute = async ({ url, request }) => {
  try {
    const path = url.searchParams.get('path');
    const body = await request.json();
    const ws = await open(request);
    if (!fileOf(path)) return json({ error: 'Percorso non valido.' }, 400);
    const meta = readMeta();
    const entry = { ...meta[path!] };
    if ('alt' in body) entry.alt = String(body.alt ?? '').trim();
    if ('ai' in body) entry.ai = AI.includes(body.ai) ? body.ai : 'none';
    if (!entry.alt) delete entry.alt;
    if (!entry.ai || entry.ai === 'none') delete entry.ai;
    if (Object.keys(entry).length) meta[path!] = entry; else delete meta[path!];
    writeMeta(ws, meta);
    await ws.save(`Mediateca: testo alternativo di ${basename(path!)}`);
    refreshSite();
    return json({ ok: true });
  } catch (e) { return errorResponse(e); }
};

export const DELETE: APIRoute = async ({ url, request }) => {
  try {
    const ws = await open(request);
    if (ws.client) return json({ error: 'Non hai i permessi per eliminare immagini.' }, 403);
    const path = url.searchParams.get('path');
    const file = fileOf(path);
    if (!file || !existsSync(file)) return json({ error: 'Immagine non trovata.' }, 404);
    const used = usages().get(path!) ?? [];
    if (used.length) return json({ error: `È usata in: ${used.join(', ')}. Toglila prima da quelle pagine.` }, 409);
    ws.remove(rel(file));
    const meta = readMeta();
    if (meta[path!]) { delete meta[path!]; writeMeta(ws, meta); }
    await ws.save(`Mediateca: eliminata ${basename(file)}`);
    refreshSite();
    return json({ ok: true });
  } catch (e) { return errorResponse(e); }
};

export const PATCH: APIRoute = async ({ url, request }) => {
  try {
    const ws = await open(request);
    const path = url.searchParams.get('path');
    const file = fileOf(path);
    if (!file || !existsSync(file)) return json({ error: 'Immagine non trovata.' }, 404);
    const ext = extname(file);
    const stem = basename(url.searchParams.get('name') ?? '', ext).replace(/\.[a-z0-9]+$/i, '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!stem) return json({ error: 'Nome non valido.' }, 400);
    const target = join(file.slice(0, file.length - basename(file).length), stem + ext);
    if (target === file) return json({ path });
    if (existsSync(target)) return json({ error: `Esiste già un file chiamato ${stem + ext} nella stessa cartella.` }, 409);
    ws.rename(rel(file), rel(target));
    const newPath = pathOf(target);
    // aggiorna i riferimenti in tutti i contenuti
    const files: string[] = [];
    const scan = (dir: string) => readdirSync(dir).forEach((n) => { const f = join(dir, n); if (statSync(f).isDirectory()) scan(f); else if (f.endsWith('.json') && f !== metaFile()) files.push(f); });
    scan(contentDir());
    let updated = 0;
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      if (text.includes(`"${path}"`)) { ws.write(rel(f), text.split(`"${path}"`).join(`"${newPath}"`)); updated++; }
    }
    const meta = readMeta();
    if (meta[path!]) { meta[newPath] = meta[path!]; delete meta[path!]; writeMeta(ws, meta); }
    await ws.save(`Mediateca: rinominata ${basename(file)} in ${basename(target)}`);
    refreshSite();
    return json({ path: newPath, updated });
  } catch (e) { return errorResponse(e); }
};
