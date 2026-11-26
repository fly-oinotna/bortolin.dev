// GET /api/seo-status: stato SEO di ogni pagina del sito (layout fisso, Pagine, Post)
// per i badge della sidebar e degli elenchi. Usa la stessa lettura del sito: se mancano campi obbligatori funziona comunque.
import type { APIRoute } from 'astro';
import { read } from '../../lib/content';
import { allPages } from '../../lib/pages';
import { seoReport } from '../../lib/seo';
import { open, errorResponse } from './workspace';

export const prerender = false;

export const GET: APIRoute = async ({ url, request }) => {
  try { await open(request, { maxAge: 15000 }); } catch (e) { return errorResponse(e); }
  const settings = await read('settings');
  const sm = await read('schemaMarkup');
  const markdownEnabled = !!(settings.llms.enabled && settings.llms.markdownEnabled);
  const available = { aboutPage: !!sm.aboutPage.enabled, contactPage: !!sm.contactPage.enabled, product: true };
  // indirizzo pubblico del sito (per i link "apri la pagina" negli elenchi): in sviluppo, lo stesso server
  const origin = url.origin;
  const pages: Record<string, unknown> = {};
  for (const p of await allPages()) {
    pages[p.id] = { ...seoReport(p.seo, { markdownEnabled, available, auto: p.auto }), url: p.url, href: origin + p.url, pageTitle: p.title, kind: p.kind, label: p.label, lang: p.lang, itId: p.itId };
  }
  return new Response(JSON.stringify({ pages }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
