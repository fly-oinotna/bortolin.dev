// TRADUZIONI nel sito: indirizzi di ogni pagina in tutte le lingue e "localizzazione" dei contenuti.
//
// Nei contenuti i link interni sono sempre salvati con l'indirizzo ITALIANO (es. "/servizi/siti-web/"), che fa da
// identificativo della pagina: leggendo una traduzione, src/lib/content.ts li converte nell'indirizzo della stessa lingua
// (es. "/en/services/websites/"). Se la pagina non è ancora tradotta il link resta quello italiano.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { DEFAULT_LANG, TRANSLATIONS, prefix } from '../i18n/langs';

/** pagine a layout fisso: chiave di Keystatic, indirizzo italiano, file dei contenuti, pagina "madre" */
export const FIXED_PAGES = [
  { key: 'home', label: 'Home', url: '/', file: 'home' },
  { key: 'servizi', label: 'Servizi', url: '/servizi/', file: 'servizi/index' },
  { key: 'sitiWeb', label: 'Siti web', url: '/servizi/siti-web/', file: 'servizi/siti-web', parent: 'servizi' },
  { key: 'consulenzaSeo', label: 'Consulenza SEO', url: '/servizi/consulenza-seo/', file: 'servizi/consulenza-seo', parent: 'servizi' },
  { key: 'performance', label: 'Performance', url: '/servizi/miglioramento-prestazioni-siti-web/', file: 'servizi/miglioramento-prestazioni-siti-web', parent: 'servizi' },
  { key: 'integrazioneAi', label: 'Integrazione AI', url: '/servizi/integrazione-ai/', file: 'servizi/integrazione-ai', parent: 'servizi' },
  { key: 'googleAds', label: 'Google Ads', url: '/servizi/google-ads/', file: 'servizi/google-ads', parent: 'servizi' },
  { key: 'aiAds', label: 'AI Ads', url: '/servizi/ai-ads/', file: 'servizi/ai-ads', parent: 'servizi' },
  { key: 'metaAds', label: 'Meta Ads', url: '/servizi/meta-ads/', file: 'servizi/meta-ads', parent: 'servizi' },
  { key: 'consulenzaDigitale', label: 'Consulenza digitale', url: '/servizi/consulenza-digitale/', file: 'servizi/consulenza-digitale', parent: 'servizi' },
  { key: 'webAgency', label: 'Per le web agency', url: '/servizi/sviluppatore-freelance-per-web-agency/', file: 'servizi/sviluppatore-freelance-per-web-agency', parent: 'servizi' },
  { key: 'casiStudio', label: 'Casi studio', url: '/casi-studio/', file: 'casi-studio' },
  { key: 'blog', label: 'Blog', url: '/blog/', file: 'blog' },
] as const;
export type FixedKey = (typeof FIXED_PAGES)[number]['key'];

/** collection con una pagina per voce: cartella dei contenuti e pagina "madre" (nell'indirizzo) */
export const COLLECTION_PAGES = {
  pages: { dir: 'pages', parent: null },
  posts: { dir: 'posts', parent: 'blog' },
  caseStudies: { dir: 'casi-studio', parent: 'casiStudio' },
} as const;
export type PageCollection = keyof typeof COLLECTION_PAGES;

export interface Route {
  /** identificativo (= pagina italiana): "sitiWeb", "posts/quanto-costa-un-sito-web" */
  id: string;
  kind: 'fixed' | PageCollection;
  /** chiave di Keystatic (fisse) o slug italiano (collection) */
  key: string;
  /** indirizzo in ogni lingua in cui la pagina esiste */
  urls: Record<string, string>;
  /** slug della voce nella lingua (solo collection) */
  slugs: Record<string, string>;
}

const json = (file: string) => {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; }
};
const lastSegment = (url: string) => url.split('/').filter(Boolean).pop() ?? '';

function loadRoutes(): Route[] {
  const out: Route[] = [];
  const fixed = new Map<string, Route>();
  for (const p of FIXED_PAGES) {
    const r: Route = { id: p.key, kind: 'fixed', key: p.key, urls: { [DEFAULT_LANG]: p.url }, slugs: {} };
    for (const lang of TRANSLATIONS) {
      const data = json(`src/content/${lang}/${p.file}.json`);
      if (!data) continue;
      if (p.key === 'home') { r.urls[lang] = `${prefix(lang)}/`; continue; }
      const slug = data.seo?.slug || lastSegment(p.url);
      const parent = 'parent' in p ? fixed.get(p.parent) : undefined;
      const base = parent ? parent.urls[lang] ?? `${prefix(lang)}/${lastSegment(parent.urls[DEFAULT_LANG])}/` : `${prefix(lang)}/`;
      r.urls[lang] = `${base}${slug}/`;
    }
    fixed.set(p.key, r);
    out.push(r);
  }
  for (const [kind, c] of Object.entries(COLLECTION_PAGES) as [PageCollection, (typeof COLLECTION_PAGES)[PageCollection]][]) {
    const dir = `src/content/${DEFAULT_LANG}/${c.dir}`;
    if (!existsSync(dir)) continue;
    const byIt = new Map<string, Route>();
    const parentOf = (lang: string) => {
      if (!c.parent) return `${prefix(lang)}/`;
      const p = fixed.get(c.parent)!;
      return p.urls[lang] ?? `${prefix(lang)}/${lastSegment(p.urls[DEFAULT_LANG])}/`;
    };
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
      const slug = f.slice(0, -5);
      const r: Route = { id: `${kind}/${slug}`, kind, key: slug, urls: { [DEFAULT_LANG]: `${parentOf(DEFAULT_LANG)}${slug}/` }, slugs: { [DEFAULT_LANG]: slug } };
      byIt.set(slug, r);
      out.push(r);
    }
    for (const lang of TRANSLATIONS) {
      const tdir = `src/content/${lang}/${c.dir}`;
      if (!existsSync(tdir)) continue;
      for (const f of readdirSync(tdir).filter((f) => f.endsWith('.json'))) {
        const r = byIt.get(json(`${tdir}/${f}`)?.original ?? '');
        if (!r) continue;
        const slug = f.slice(0, -5);
        r.slugs[lang] = slug;
        r.urls[lang] = `${parentOf(lang)}${slug}/`;
      }
    }
  }
  return out;
}

let cache: Route[] | undefined;
/** tutte le pagine con gli indirizzi nelle varie lingue (in sviluppo sempre aggiornate) */
export function routes(): Route[] {
  if (import.meta.env.DEV) return loadRoutes();
  return (cache ??= loadRoutes());
}

/** indirizzo italiano → indirizzo nella lingua (con #sezione e ?parametri); se la pagina non è tradotta resta l'italiano */
export function localize(url: string, lang: string): string {
  if (lang === DEFAULT_LANG || !url) return url;
  const m = url.match(/^([^?#]*)([?#].*)?$/);
  const path = m?.[1] ?? '';
  if (!path.startsWith('/')) return url; // #sezione, https://…, mailto:…
  const r = routes().find((x) => x.urls[DEFAULT_LANG] === path);
  return r?.urls[lang] ? r.urls[lang] + (m?.[2] ?? '') : url;
}

/** la pagina di un indirizzo (in qualsiasi lingua) */
export const routeOf = (pathname: string) => routes().find((r) => Object.values(r.urls).includes(pathname));
