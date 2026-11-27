// /api/keystatic/* — API del pannello Keystatic con DUE STRADE:
//   - admin (GitHub): il gestore originale di Keystatic, invariato (login GitHub, il browser salva direttamente su GitHub);
//   - clienti (email e password): il gestore "locale" di Keystatic applicato alla copia del ramo "contenuti"
//     (workspace.ts). Prima di salvare si controllano i permessi (niente "SEO e strumenti", niente "Configurazione",
//     niente immagini eliminate), poi le modifiche vanno su GitHub come commit dell'app, con il nome del cliente.
import type { APIRoute } from 'astro';
import { makeHandler } from '@keystatic/astro/api';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import keystaticConfig from '../../../keystatic.config';
import { CLIENT_DENIED, clientOf, json } from './auth';
import { open, errorResponse } from './workspace';

export const prerender = false;

const github = makeHandler({ config: keystaticConfig });
const localConfig = { ...keystaticConfig, storage: { kind: 'local' as const } };

/** risposta del gestore generico di Keystatic → Response */
const toResponse = (r: { status?: number; headers?: any; body?: any }) => new Response(r.body ?? null, { status: r.status ?? 200, headers: r.headers });

async function forClient(request: Request) {
  const url = new URL(request.url);
  const isUpdate = request.method === 'POST' && url.pathname.endsWith('/update');
  // l'elenco dei file si può riusare per qualche secondo; i salvataggi partono sempre dall'ultima versione
  const ws = await open(request, { maxAge: isUpdate ? 0 : 10_000 });
  const local = makeGenericAPIRouteHandler({ config: localConfig as any, localBaseDirectory: process.cwd() } as any);

  if (!isUpdate) return toResponse(await local(request));

  let body: { additions: { path: string; contents: string }[]; deletions: { path: string }[] };
  try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida' }, 400); }
  const denied = [
    ...body.additions.filter((a) => CLIENT_DENIED.test(a.path)).map((a) => a.path),
    ...body.deletions.filter((d) => CLIENT_DENIED.test(d.path) || d.path.startsWith('src/assets/images/')).map((d) => d.path),
  ];
  if (denied.length) return new Response(`Non hai i permessi per modificare: ${denied.join(', ')}`, { status: 403 });
  for (const a of body.additions) ws.write(a.path, new Uint8Array(Buffer.from(a.contents, 'base64url')));
  for (const d of body.deletions) ws.remove(d.path);
  const names = [...body.additions, ...body.deletions].map((x) => x.path.replace(/^src\/content\//, '').replace(/\.json$/, ''));
  await ws.save(`aggiorna ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` e altri ${names.length - 3}` : ''}`);
  // come il gestore locale: si risponde con l'elenco aggiornato dei file
  const tree = new Request(new URL('/api/keystatic/tree', request.url), { headers: { 'no-cors': '1' } });
  return toResponse(await local(tree));
}

export const ALL: APIRoute = async (ctx) => {
  try {
    if (await clientOf(ctx.request)) return await forClient(ctx.request);
  } catch (e) { return errorResponse(e); }
  return github(ctx as any);
};
