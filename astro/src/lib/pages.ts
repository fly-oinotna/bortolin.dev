// TUTTE le pagine del sito, in tutte le lingue: quelle a layout fisso (singleton, es. Home) + Pagine, Casi studio e Post
// (collection di Keystatic). Lo usano sitemap, llms.txt, immagini social e i badge SEO del pannello.
// Una nuova pagina a layout fisso va aggiunta in FIXED_PAGES (src/lib/i18n.ts).
import { entries, hasTranslation, read } from './content';
import { FIXED_PAGES, routes } from './i18n';
import { DEFAULT_LANG, LANGS } from '../i18n/langs';

export { FIXED_PAGES };

export interface SitePage {
  /**
   * chiave univoca = chiave di Keystatic: "home", "pages/informativa-sulla-privacy", "posts/quanto-costa-un-sito";
   * nelle traduzioni "en_home", "en_posts/how-much-does-a-website-cost"
   */
  id: string;
  /** identificativo della pagina italiana corrispondente ("home", "posts/quanto-costa-un-sito") */
  itId: string;
  lang: string;
  kind: 'fixed' | 'pages' | 'posts';
  url: string;
  title: string;
  seo: any;
  /** nome della pagina nel pannello (solo pagine a layout fisso) */
  label?: string;
  /** etichetta dell'immagine social automatica, nella lingua della pagina (solo pagine a layout fisso) */
  ogLabel?: string;
  /** dati strutturati propri della pagina generati in automatico (per il badge SM) */
  auto?: string[];
  /** file dei contenuti (per la data di ultima modifica) */
  file: string;
}

/** indirizzi ITALIANI (identificativi): nelle altre lingue passano da g.url() / localize() */
export const postUrl = (slug: string) => `/blog/${slug}/`;
export const pageUrl = (slug: string) => `/${slug}/`;
export const caseUrl = (slug: string) => `/casi-studio/${slug}/`;

let cache: Promise<SitePage[]> | undefined;
/** in build l'elenco si calcola una volta sola; in sviluppo sempre aggiornato */
export function allPages(): Promise<SitePage[]> {
  if (import.meta.env.DEV) return loadPages();
  return (cache ??= loadPages());
}

const keyOf = (lang: string, key: string) => (lang === DEFAULT_LANG ? key : `${lang}_${key}`);
const dirOf = (lang: string) => `src/content/${lang}`;

async function loadPages(): Promise<SitePage[]> {
  const out: SitePage[] = [];
  const r = routes();
  for (const lang of LANGS) {
    for (const p of FIXED_PAGES) {
      if (lang !== DEFAULT_LANG && !hasTranslation(p.key, lang)) continue;
      const data: any = await read(p.key, lang);
      const auto: string[] = [];
      if ('parent' in p && p.parent === 'servizi') auto.push('Service');
      if (p.key === 'servizi' || p.key === 'casiStudio') auto.push('CollectionPage');
      if (p.key === 'blog') auto.push('Blog');
      if (data?.faq?.items?.length) auto.push('FAQPage');
      const url = r.find((x) => x.id === p.key)!.urls[lang];
      const ogLabel = p.key === 'home' ? 'bortolin.dev' : lang === DEFAULT_LANG ? p.label : data?.hero?.breadcrumb || data?.hero?.eyebrow || p.label;
      out.push({ id: keyOf(lang, p.key), itId: p.key, lang, kind: 'fixed', label: p.label, ogLabel, auto, url, title: data?.seo?.title ?? p.key, seo: data?.seo, file: `${dirOf(lang)}/${p.file}.json` });
    }
    const coll = async (col: 'pages' | 'caseStudies' | 'posts', dir: string, kind: SitePage['kind'], auto?: string[]) => {
      for (const e of await entries(col, lang)) {
        const url = r.find((x) => x.id === `${col}/${e.itSlug}`)?.urls[lang];
        if (!url) continue;
        out.push({ id: `${keyOf(lang, col)}/${e.slug}`, itId: `${col}/${e.itSlug}`, lang, kind, auto, url, title: (e.entry as any).title, seo: (e.entry as any).seo, file: `${dirOf(lang)}/${dir}/${e.slug}.json` });
      }
    };
    await coll('pages', 'pages', 'pages');
    await coll('caseStudies', 'casi-studio', 'pages', ['CreativeWork']);
    await coll('posts', 'posts', 'posts', ['BlogPosting']);
  }
  return out;
}

/** Percorso delle pagine servizio (Home / Servizi / Pagina): stesso nome della voce "Servizi" del menu */
export const serviceTrail = (g: { navigation: any; url: (u: string) => string }, name: string, url: string) => [
  { name: g.navigation?.main?.servicesLabel || 'Servizi', url: g.url('/servizi/') },
  { name, url: g.url(url) },
];
