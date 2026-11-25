// TRADUZIONI nel pannello: per ogni lingua in più (per ora l'inglese) Keystatic ha una copia di pagine, post, menu e testi,
// con gli stessi gruppi e campi della versione italiana. Le chiavi sono "en_<chiave>" e i file stanno in src/content/en/.
// Nel pannello il selettore di lingua (admin/i18n.ts) mostra solo le voci della lingua scelta.
//
// Differenze rispetto all'italiano:
//   - i campi `shared(...)` (telefono, ID di Google…) non ci sono: il sito usa quelli italiani;
//   - ogni immagine ha l'interruttore "usa l'immagine italiana" (acceso di default);
//   - le pagine a layout fisso hanno l'indirizzo tradotto (SEO → Indirizzo), Pagine/Post/Casi studio/Offerte
//     hanno il campo "Versione italiana" che le collega all'originale.
import { fields, collection as kCollection, type ComponentSchema } from '@keystatic/core';
import { translatedImage } from './fields';

import { TRANSLATIONS } from '../i18n/langs';

/** chiave di Keystatic della traduzione: sitiWeb → en_sitiWeb */
export const tKey = (lang: string, key: string) => `${lang}_${key}`;
/** percorso dei contenuti nella lingua: src/content/it/… → src/content/en/… */
export const tPath = (lang: string, path: string) => path.replace('src/content/it/', `src/content/${lang}/`);

/** schema della traduzione: senza i campi condivisi, con le immagini "usa l'italiana". null = niente da tradurre */
export function translateField(f: any): any | null {
  if (!f || f.__bdShared) return null;
  if (f.__bdImage) return f.__bdImage.opts?.inherit === false ? f : translatedImage(f.__bdImage.label, f.__bdImage.opts);
  if (f.kind === 'object') {
    const out: Record<string, ComponentSchema> = {};
    const layout: number[] = [];
    Object.keys(f.fields).forEach((k, i) => {
      const t = translateField(f.fields[k]);
      if (!t) return;
      out[k] = t;
      if (f.layout) layout.push(f.layout[i] ?? 12);
    });
    if (!Object.keys(out).length) return null;
    return { ...f, fields: out, ...(f.layout ? { layout } : {}) };
  }
  if (f.kind === 'array') {
    const el = translateField(f.element);
    return el ? { ...f, element: el } : null;
  }
  return f;
}

export function translateSchema(schema: Record<string, ComponentSchema>) {
  const out: Record<string, ComponentSchema> = {};
  for (const [k, f] of Object.entries(schema)) {
    const t = translateField(f);
    if (t) out[k] = t;
  }
  return out;
}

/** Indirizzo tradotto delle pagine a layout fisso (in testa al gruppo SEO) */
const slugField = () =>
  fields.text({
    label: 'Indirizzo',
    description: 'Ultima parte dell’indirizzo nella lingua, es. websites → /en/services/websites/',
    validation: { isRequired: true, pattern: { regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Solo lettere minuscole, numeri e trattini' } },
  });

/** Traduzioni dei singleton: `pages` = chiavi delle pagine a layout fisso (hanno l'indirizzo tradotto, tranne la Home) */
export function translatedSingletons<T extends Record<string, any>>(singletons: T, keys: (keyof T & string)[], pages: string[]) {
  const out: Record<string, any> = {};
  for (const lang of TRANSLATIONS) {
    for (const key of keys) {
      const s = singletons[key];
      const schema = translateSchema(s.schema);
      if (pages.includes(key) && key !== 'home' && (schema as any).seo) {
        const seo: any = schema.seo;
        schema.seo = { ...seo, fields: { slug: slugField(), ...seo.fields }, ...(seo.layout ? { layout: [12, ...seo.layout] } : {}) };
      }
      out[tKey(lang, key)] = { ...s, path: tPath(lang, s.path), schema };
    }
  }
  return out as { [K in keyof T & string as `${(typeof TRANSLATIONS)[number]}_${K}`]: T[K] };
}

/** Traduzioni delle collection: stesso schema + "Versione italiana" (collegamento all'originale) dopo il titolo */
export function translatedCollections<T extends Record<string, any>>(collections: T, keys: (keyof T & string)[]) {
  const out: Record<string, any> = {};
  for (const lang of TRANSLATIONS) {
    for (const key of keys) {
      const c = collections[key];
      const { [c.slugField]: slug, ...rest } = translateSchema(c.schema);
      out[tKey(lang, key)] = kCollection({
        ...c,
        path: tPath(lang, c.path),
        schema: {
          [c.slugField]: slug,
          original: fields.relationship({
            label: 'Versione italiana',
            description: 'La pagina italiana di cui questa è la traduzione (collega le due lingue: selettore di lingua, hreflang, link).',
            collection: key,
            validation: { isRequired: true },
          }),
          ...rest,
        },
      });
    }
  }
  return out as { [K in keyof T & string as `${(typeof TRANSLATIONS)[number]}_${K}`]: T[K] };
}
