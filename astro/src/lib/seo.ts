// Regole SEO condivise (stesse soglie, etichette e colori di AM Tools 3):
// usate dal contatore nel pannello, dai badge MT/MD/R/OG/SM nella sidebar e dal sito (robots, schema).

export const COLORS = { red: '#f44336', orange: '#ff9800', green: '#4caf50', black: '#000000', gray: '#777777' } as const;

/** Soglie: sotto "short" = troppo corto · sotto "good" = corto · fino a "max" = buono · oltre = troppo lungo */
export const SEO_LIMITS = {
  title: { short: 25, good: 35, max: 65 },
  description: { short: 50, good: 80, max: 160 },
} as const;

type Limits = { short: number; good: number; max: number };

export const length = (text?: string | null) => Array.from(text ?? '').length;

export function lengthStatus(n: number, l: Limits) {
  if (n < l.short) return { label: 'Troppo corto', color: COLORS.red };
  if (n < l.good) return { label: 'Corto', color: COLORS.orange };
  if (n <= l.max) return { label: 'Buono', color: COLORS.green };
  return { label: 'Troppo lungo', color: COLORS.red };
}

/** Opzioni Robots (valore → etichetta), come AM Tools */
export const ROBOTS = [
  { value: 'max-snippet:-1,max-image-preview:large,max-video-preview:-1', label: 'Index, follow' },
  { value: 'nofollow', label: 'No follow' },
  { value: 'noindex', label: 'No index' },
  { value: 'noindex, nofollow', label: 'No index, no follow' },
] as const;
export const ROBOTS_DEFAULT = ROBOTS[0].value;

/** Tipi di Schema Markup attivabili da ogni pagina */
export const SCHEMA_TYPES = [
  { key: 'aboutPage', label: 'AboutPage' },
  { key: 'contactPage', label: 'ContactPage' },
  { key: 'product', label: 'Product' },
] as const;

export interface PageSeo {
  title?: string | null;
  description?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  sitemapExclude?: boolean;
  markdown?: string | null;
  aboutPage?: boolean;
  contactPage?: boolean;
  product?: boolean;
  customMarkup?: boolean;
  customMarkupCode?: string | null;
}

/** La pagina va nella sitemap? No se esclusa con lo switch o se è in noindex */
export function sitemapStatus(seo: PageSeo | undefined) {
  if (seo?.sitemapExclude) return { included: false, label: 'Esclusa' };
  if ((seo?.robots ?? '').includes('noindex')) return { included: false, label: 'Esclusa (noindex)' };
  return { included: true, label: 'Inclusa' };
}

/** Tutti i dati dei badge e del tooltip di una pagina */
/**
 * @param opts.available tipi di schema attivi nella pagina Schema Markup (AboutPage/ContactPage si possono spegnere
 *   per tutto il sito; Product è sempre disponibile), come available_schema_types() di AM Tools 3
 */
/**
 * @param opts.auto dati strutturati propri della pagina generati in automatico dai contenuti (Service, BlogPosting, FAQPage…).
 * SM: verde se la pagina ha dati strutturati propri (automatici, switch o markup personalizzato), nero se usa solo quelli comuni del sito.
 */
export function seoReport(seo: PageSeo | undefined, opts: { markdownEnabled: boolean; available?: Partial<Record<(typeof SCHEMA_TYPES)[number]['key'], boolean>>; auto?: string[] }) {
  const s = seo ?? {};
  const titleLen = length(s.title);
  const descLen = length(s.description);
  const robots = s.robots || ROBOTS_DEFAULT;
  const robotsLabel = ROBOTS.find((r) => r.value === robots)?.label ?? robots;
  const schema = SCHEMA_TYPES.filter((t) => opts.available?.[t.key] !== false).map((t) => ({ ...t, enabled: !!s[t.key] }));
  const enabled = schema.filter((t) => t.enabled).length;
  const custom = !!s.customMarkup && !!s.customMarkupCode?.trim();
  return {
    title: { text: s.title ?? '', length: titleLen, ...lengthStatus(titleLen, SEO_LIMITS.title) },
    description: { text: s.description ?? '', length: descLen, ...lengthStatus(descLen, SEO_LIMITS.description) },
    robots: { label: robotsLabel, color: robots.includes('noindex') || robots.includes('nofollow') ? COLORS.red : COLORS.green },
    // senza immagine personalizzata la pagina ne ha una generata in automatico (lib/og.ts)
    og: { custom: !!s.ogImage, auto: !s.ogImage, color: COLORS.green },
    sitemap: { ...sitemapStatus(s), color: sitemapStatus(s).included ? COLORS.green : COLORS.red },
    markdown: { enabled: opts.markdownEnabled, custom: opts.markdownEnabled && !!s.markdown },
    schema: {
      types: schema,
      custom,
      auto: opts.auto ?? [],
      color: enabled > 0 || custom || (opts.auto?.length ?? 0) > 0 ? COLORS.green : COLORS.black,
    },
  };
}

export type SeoReport = ReturnType<typeof seoReport>;
