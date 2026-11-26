// MONITOR LIGHTHOUSE (Netlify Background Function, fino a 15 minuti): misura con l'API di PageSpeed Insights le pagine
// principali (mobile) e salva i risultati in Netlify Blobs (archivio "lighthouse"), per la Dashboard del pannello.
// Avviata ogni settimana da lighthouse-weekly.mjs e dal pulsante "Misura ora" (/api/lighthouse), sempre con il segreto
// KEYSTATIC_SECRET: nessun altro può avviarla e consumare la quota. Chiave: PAGESPEED_API_KEY.
import { getStore } from '@netlify/blobs';

export const PAGES = ['/', '/servizi/', '/servizi/siti-web/', '/servizi/consulenza-seo/', '/blog/', '/en/'];
const KEEP = 30; // misure conservate (circa 7 mesi a una alla settimana)

export async function measure(site, path, key) {
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', site + path);
  api.searchParams.set('strategy', 'mobile');
  for (const c of ['performance', 'accessibility', 'best-practices', 'seo']) api.searchParams.append('category', c);
  if (key) api.searchParams.set('key', key);
  const res = await fetch(api);
  const d = await res.json();
  if (!res.ok) return { path, error: d?.error?.message ?? `Errore ${res.status}` };
  const cat = d.lighthouseResult?.categories ?? {};
  const audit = (id) => d.lighthouseResult?.audits?.[id]?.numericValue;
  const field = d.loadingExperience?.metrics ?? {};
  return {
    path,
    scores: Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map((k) => [k, Math.round((cat[k]?.score ?? 0) * 100)])),
    lab: { lcp: audit('largest-contentful-paint'), tbt: audit('total-blocking-time'), cls: audit('cumulative-layout-shift') },
    // dati reali degli utenti Chrome (CrUX), se la pagina ha abbastanza visite
    field: field.LARGEST_CONTENTFUL_PAINT_MS ? {
      lcp: field.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
      inp: field.INTERACTION_TO_NEXT_PAINT?.percentile,
      cls: field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null ? field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 : undefined,
      overall: d.loadingExperience?.overall_category,
    } : null,
  };
}

export default async (req) => {
  if (!process.env.KEYSTATIC_SECRET || req.headers.get('x-bd-secret') !== process.env.KEYSTATIC_SECRET) return new Response(null, { status: 401 });
  const site = (process.env.URL || 'https://bortolin.dev').replace(/\/$/, '');
  const key = process.env.PAGESPEED_API_KEY;
  const results = [];
  for (const path of PAGES) results.push(await measure(site, path, key).catch((e) => ({ path, error: e.message })));
  const store = getStore('lighthouse');
  const date = new Date().toISOString();
  await store.setJSON(`run-${date}`, { date, results });
  // si tengono solo le ultime misure
  const { blobs } = await store.list({ prefix: 'run-' });
  const old = blobs.map((b) => b.key).sort().slice(0, -KEEP);
  await Promise.all(old.map((k) => store.delete(k)));
  console.log(`[lighthouse] ${results.length} pagine misurate`);
};
