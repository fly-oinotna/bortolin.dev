// /api/publish — pulsante "Pubblica sul sito" del pannello online.
//   GET  → { enabled, commits, files }: modifiche salvate nel pannello (ramo "contenuti") non ancora sul sito
//   POST → pubblica: il ramo del sito ("main") avanza fino a "contenuti" e Netlify ricostruisce il sito
// In sviluppo il pannello salva direttamente nei file: niente da pubblicare ({ enabled: false }).
import type { APIRoute } from 'astro';
import { REMOTE, authorize, errorResponse, pending, publish } from './workspace';

export const prerender = false;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export const GET: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false });
  try {
    const token = await authorize(request);
    return json({ enabled: true, ...(await pending(token)) });
  } catch (e) { return errorResponse(e); }
};

export const POST: APIRoute = async ({ request }) => {
  if (!REMOTE) return json({ enabled: false });
  try {
    const token = await authorize(request);
    const sha = await publish(token);
    return json({ ok: true, sha });
  } catch (e) { return errorResponse(e); }
};
