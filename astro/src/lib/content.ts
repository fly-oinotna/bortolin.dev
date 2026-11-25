// Lettura dei contenuti salvati da Keystatic (file JSON nel progetto), al momento del build.
import { existsSync, readFileSync } from 'node:fs';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';
import { formatRating } from './places';
import { getReviews } from './reviews';
import { localize } from './i18n';
import { DEFAULT_LANG } from '../i18n/langs';
import { SAME_AS_IT } from '../keystatic/fields';

export const reader = createReader(process.cwd(), keystaticConfig);

type Singletons = typeof reader.singletons;
type Data<K extends keyof Singletons> = NonNullable<Awaited<ReturnType<Singletons[K]['read']>>>;
/** singleton italiani (le traduzioni "en_…" si leggono con il parametro lang) */
type ItKey = Exclude<keyof Singletons, `${string}_${string}`>;

/**
 * Legge un singleton e si ferma con un errore chiaro se il file manca.
 * Se mancano campi obbligatori il sito non si blocca: legge comunque i dati salvati e lo segnala nel build
 * (nel pannello quei campi restano obbligatori e vanno compilati per poter salvare).
 */
async function readRaw(key: string): Promise<any> {
  const k = key as keyof Singletons;
  let data;
  try {
    data = await reader.singletons[k].read();
  } catch (e) {
    const file = keystaticConfig.singletons[k].path + '.json';
    if (!existsSync(file)) throw e;
    console.warn(`[contenuti] "${key}": campi obbligatori da compilare in /keystatic →\n${(e as Error).message}`);
    data = parseLoose(keystaticConfig.singletons[k].schema, JSON.parse(readFileSync(file, 'utf8')));
  }
  return data;
}

/** esiste la traduzione del singleton nella lingua? */
export const hasTranslation = (key: string, lang: string) => {
  const s = (keystaticConfig.singletons as Record<string, { path: string }>)[`${lang}_${key}`];
  return !!s && existsSync(s.path + '.json');
};

/**
 * Contenuti di un singleton nella lingua: la traduzione (src/content/<lingua>/…) completata con la versione italiana
 * (campi condivisi, immagini "usa l'italiana") e con i link interni convertiti nella lingua.
 * Senza traduzione: i contenuti italiani (con i link nella lingua).
 */
export async function read<K extends ItKey>(key: K, lang = DEFAULT_LANG): Promise<Data<K>> {
  const it = await readRaw(key);
  if (!it) throw new Error(`Contenuto mancante: "${String(key)}". Compilalo da /keystatic.`);
  if (lang === DEFAULT_LANG) return it;
  const schema = keystaticConfig.singletons[key].schema;
  const tr = hasTranslation(key, lang) ? await readRaw(`${lang}_${key}`) : undefined;
  return localizeData(schema, mergeData(schema, it, tr), lang);
}

// ---------------------------------------------------------------- collection nelle varie lingue
type Collections = typeof reader.collections;
type ItCollection = Exclude<keyof Collections, `${string}_${string}`>;
type EntryOf<C extends ItCollection> = NonNullable<Awaited<ReturnType<Collections[C]['read']>>>;
export interface Entry<C extends ItCollection> {
  /** slug nella lingua (indirizzo della pagina) */
  slug: string;
  /** slug della versione italiana (identificativo usato nei contenuti: relazioni, offerte…) */
  itSlug: string;
  entry: EntryOf<C>;
}

/** tutte le voci di una collection nella lingua (solo quelle tradotte), completate con l'italiano */
export async function entries<C extends ItCollection>(col: C, lang = DEFAULT_LANG): Promise<Entry<C>[]> {
  const it = await reader.collections[col].all();
  if (lang === DEFAULT_LANG) return it.map((e) => ({ slug: e.slug, itSlug: e.slug, entry: e.entry as EntryOf<C> }));
  const key = `${lang}_${col}` as keyof Collections;
  if (!(key in reader.collections)) return [];
  const schema = keystaticConfig.collections[col].schema;
  const out: Entry<C>[] = [];
  for (const e of await reader.collections[key].all()) {
    const original = (e.entry as any).original as string | null;
    const base = it.find((x) => x.slug === original);
    if (!base) continue;
    out.push({ slug: e.slug, itSlug: base.slug, entry: localizeData(schema, mergeData(schema, base.entry, e.entry), lang) });
  }
  return out;
}

/** una voce dallo slug ITALIANO (come è salvato nei contenuti); null se non esiste o non è tradotta */
export async function entry<C extends ItCollection>(col: C, itSlug: string | null | undefined, lang = DEFAULT_LANG): Promise<Entry<C> | null> {
  if (!itSlug) return null;
  if (lang === DEFAULT_LANG) {
    const e = await reader.collections[col].read(itSlug);
    return e ? { slug: itSlug, itSlug, entry: e as EntryOf<C> } : null;
  }
  return (await entries(col, lang)).find((e) => e.itSlug === itSlug) ?? null;
}

/** Parti comuni a tutte le pagine */
export async function readGlobals(lang = DEFAULT_LANG) {
  const [settings, navigation, offerData, schemaMarkup, google, cookies, reviewsCfg] = await Promise.all([
    read('settings', lang), read('navigation', lang), read('offer'), read('schemaMarkup', lang), read('google'), read('cookies', lang), read('reviews'),
  ]);
  // recensioni (Keystatic → Reviews): Google o manuali, sempre nello stesso formato; null se disattivate
  const reviews = await getReviews(reviewsCfg, lang);
  // offerta in evidenza (Sito → Offerta in evidenza): una delle Offerte, solo se l'interruttore è acceso
  const offer = offerData.enabled ? await readOffer(offerData.featured, lang) : null;
  // llms.txt e Markdown (Impostazioni → llms.txt)
  const llms = settings.llms.enabled
    ? { enabled: true, markdownEnabled: settings.llms.markdownEnabled, extra: settings.llms.extra ?? '' }
    : { enabled: false, markdownEnabled: false, extra: '' };
  // l'offerta è attiva se abilitata e non ancora scaduta (al momento del build;
  // dopo la scadenza main.js la nasconde comunque nel browser)
  const offerActive = offerIsActive(offer);
  // voto Google già formattato (es. "5,0"), o null se Google non è raggiungibile
  const rating = reviews && reviews.count > 0
    ? { value: formatRating(reviews.rating, lang), stars: Math.round(reviews.rating), count: reviews.count }
    : null;
  /** indirizzo italiano di una pagina → indirizzo nella lingua della pagina (es. g.url('/blog/')) */
  const url = (u: string) => localize(u, lang);
  return { settings, navigation, offer: offer!, offerActive, llms, schemaMarkup, google, cookies, reviews, rating, lang, url };
}

export type Globals = Awaited<ReturnType<typeof readGlobals>>;

/** Un'offerta della collection "Offerte" (null se non esiste o non è tradotta nella lingua) */
export async function readOffer(slug?: string | null, lang = DEFAULT_LANG) {
  const e = await entry('offers', slug, lang);
  // i due gruppi del pannello (Offerta, Menu) diventano un unico oggetto
  return e ? { name: e.entry.name, ...e.entry.offer, ...e.entry.menu } : null;
}
export type Offer = NonNullable<Awaited<ReturnType<typeof readOffer>>>;

/** Offerta valida al momento del build (dopo la scadenza main.js la nasconde comunque nel browser) */
export const offerIsActive = (o: { deadline?: string | null } | null | undefined): o is Offer =>
  !!o && (!o.deadline || new Date(`${o.deadline}T23:59:59`) >= new Date());

/**
 * Offerta da mostrare in una pagina (gruppo "Offerta" della pagina):
 * spenta → nessuna; nessuna scelta → quella in evidenza; altrimenti quella scelta.
 */
export async function pageOffer(g: Globals, cfg?: { show: boolean; item?: string | null } | null) {
  if (cfg && !cfg.show) return null;
  const o = cfg?.item ? await readOffer(cfg.item, g.lang) : g.offerActive ? g.offer : null;
  return offerIsActive(o) ? o : null;
}

/**
 * Lettura "tollerante" di un file di contenuti quando la validazione di Keystatic fallisce (es. un campo obbligatorio vuoto):
 * percorre lo schema e converte campo per campo (gli editor diventano documenti Markdoc), ignorando gli errori del singolo campo.
 */
function parseLoose(schema: any, raw: any): any {
  const walk = (field: any, value: any): any => {
    if (!field) return value;
    if (field.kind === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, f] of Object.entries(field.fields)) out[k] = walk(f, value?.[k]);
      return out;
    }
    if (field.kind === 'array') return Array.isArray(value) ? value.map((v) => walk(field.element, v)) : [];
    if (field.kind === 'form' && field.reader?.parse) {
      try { return field.reader.parse(value); } catch { return value ?? null; }
    }
    return value;
  };
  return walk({ kind: 'object', fields: schema }, raw);
}

/**
 * Traduzione completata con l'italiano, campo per campo (seguendo lo schema italiano):
 * campo assente nella traduzione (es. telefono, che è condiviso) o immagine "usa l'italiana" → valore italiano.
 */
function mergeData(schema: any, it: any, tr: any): any {
  const walk = (field: any, a: any, b: any): any => {
    if (b === undefined) return a;
    if (!field) return b;
    if (field.kind === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, f] of Object.entries(field.fields)) out[k] = walk(f, a?.[k], b?.[k]);
      return out;
    }
    if (field.kind === 'array') {
      if (!Array.isArray(b)) return a;
      return field.element?.kind === 'object' ? b.map((v, i) => walk(field.element, a?.[i], v)) : b;
    }
    if (field.__bdImage) return b === SAME_AS_IT ? a : b;
    return b;
  };
  return walk({ kind: 'object', fields: schema }, it, tr);
}

/** link interni nella lingua: campi "Destinazione" e link dentro gli editor di testo */
function localizeData(schema: any, data: any, lang: string): any {
  const loc = (u: string) => localize(u, lang);
  const walk = (field: any, v: any): any => {
    if (!field || v == null) return v;
    if (field.kind === 'object') {
      const out: Record<string, unknown> = { ...v };
      for (const [k, f] of Object.entries(field.fields)) out[k] = walk(f, v[k]);
      return out;
    }
    if (field.kind === 'array') return Array.isArray(v) ? v.map((x) => walk(field.element, x)) : v;
    if (field.__bdDest && typeof v === 'object') {
      return v.discriminant === 'custom'
        ? { ...v, value: typeof v.value === 'string' ? loc(v.value) : v.value }
        : { ...v, discriminant: loc(v.discriminant) };
    }
    if (field.formKind === 'assets' && v?.node?.walk) {
      for (const n of v.node.walk()) if (n.type === 'link' && typeof n.attributes?.href === 'string') n.attributes.href = loc(n.attributes.href);
      return v;
    }
    return v;
  };
  return walk({ kind: 'object', fields: schema }, data);
}
