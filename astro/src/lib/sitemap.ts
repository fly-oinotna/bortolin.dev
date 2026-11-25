// Pagine della sitemap: escluse quelle con lo switch "Escludi dalla sitemap" o in noindex.
// Ogni pagina indica anche le sue versioni nelle altre lingue (hreflang), come nel <head>.
import { statSync } from 'node:fs';
import { allPages } from './pages';
import { sitemapStatus } from './seo';
import { routeOf } from './i18n';
import { DEFAULT_LANG } from '../i18n/langs';

export async function sitemapEntries() {
  const pages = await allPages();
  const included = new Set(pages.filter((p) => sitemapStatus(p.seo).included).map((p) => p.url));
  const out: { url: string; lastmod?: string; alternates: [string, string][] }[] = [];
  for (const p of pages) {
    if (!included.has(p.url)) continue;
    let lastmod: string | undefined;
    try {
      lastmod = statSync(p.file).mtime.toISOString().slice(0, 10); // ultima modifica dei contenuti
    } catch { /* file non trovato: senza data */ }
    // solo le versioni anch'esse in sitemap; x-default = italiano
    const urls = Object.entries(routeOf(p.url)?.urls ?? {}).filter(([, u]) => included.has(u));
    const def = urls.find(([l]) => l === DEFAULT_LANG);
    const alternates: [string, string][] = urls.length > 1 ? [...urls, ...(def ? [['x-default', def[1]] as [string, string]] : [])] : [];
    out.push({ url: p.url, lastmod, alternates });
  }
  return out;
}
