// /api/translate (solo sviluppo): TRADUZIONE CON AI dal pannello Keystatic.
//   GET  /api/translate                       → quali contenuti sono già tradotti (per il selettore di lingua e i pulsanti)
//   POST /api/translate { lang, key }          → traduce un singleton (es. "sitiWeb") e crea src/content/<lingua>/…
//   POST /api/translate { lang, collection, slug, force? } → traduce una voce (Pagine, Post, Casi studio, Offerte)
// Con force: true riscrive una traduzione esistente (le modifiche fatte a mano si perdono).
// Strumenti (traduzioni preparate fuori dal pannello): { …, prepare: true } restituisce i testi da tradurre senza chiamare l'AI;
// { …, translated: { slug, items: [{ id, text }] } } scrive la traduzione con quei testi.
//
// Si traducono solo i testi (campi di testo ed editor); immagini → "usa l'immagine italiana", link interni → restano
// gli indirizzi italiani (il sito li converte nella lingua), campi condivisi → non vengono copiati.
// Serve la chiave ANTHROPIC_API_KEY nel file .env.
import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import keystaticConfig from '../../../keystatic.config';
import { tKey } from '../i18n';
import { SAME_AS_IT } from '../fields';
import { FIXED_PAGES } from '../../lib/i18n';
import { TRANSLATIONS, LANG_NAMES } from '../../i18n/langs';

export const prerender = false;

const MODEL = 'claude-opus-5-5';
/** contenuti che hanno una traduzione (chiavi italiane) */
const COLLECTIONS = ['pages', 'posts', 'caseStudies', 'offers'] as const;
const singletons = keystaticConfig.singletons as Record<string, any>;
const collections = keystaticConfig.collections as Record<string, any>;
const TRANSLATABLE_SINGLETONS = Object.keys(singletons).filter((k) => !k.includes('_') && singletons[tKey(TRANSLATIONS[0], k)]);

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

/** dopo aver scritto un file: il sito in sviluppo rilegge i contenuti */
function refreshSite() {
  const server = (globalThis as any).__bdViteServer;
  for (const env of Object.values(server?.environments ?? {}) as any[]) env.moduleGraph?.invalidateAll?.();
}

// ---------------------------------------------------------------- stato delle traduzioni
function status() {
  const out: Record<string, { singletons: Record<string, boolean>; collections: Record<string, Record<string, string>> }> = {};
  for (const lang of TRANSLATIONS) {
    const s: Record<string, boolean> = {};
    for (const k of TRANSLATABLE_SINGLETONS) s[k] = existsSync(singletons[tKey(lang, k)].path + '.json');
    const c: Record<string, Record<string, string>> = {};
    for (const col of COLLECTIONS) {
      c[col] = {};
      const dir = dirname(collections[tKey(lang, col)].path);
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
        const original = readJson(`${dir}/${f}`).original;
        if (original) c[col][original] = f.slice(0, -5);
      }
    }
    out[lang] = { singletons: s, collections: c };
  }
  return { langs: TRANSLATIONS, names: LANG_NAMES, fixed: FIXED_PAGES.map((p) => ({ key: p.key, label: p.label })), translations: out };
}

// ---------------------------------------------------------------- copia + testi da tradurre
interface Item { id: string; field: string; text: string }

/**
 * Percorre lo schema della traduzione insieme ai dati italiani: copia quello che non si traduce
 * e mette al posto di ogni testo un segnaposto "§n", raccogliendo i testi in `items`.
 */
function prepare(schema: Record<string, any>, raw: any) {
  const items: Item[] = [];
  const walk = (field: any, value: any, label: string): any => {
    if (value === undefined) return undefined;
    if (field.kind === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, f] of Object.entries<any>(field.fields)) {
        const v = walk(f, value?.[k], [label, f.label].filter(Boolean).join(' › '));
        if (v !== undefined) out[k] = v;
      }
      return out;
    }
    if (field.kind === 'array') return Array.isArray(value) ? value.map((v) => walk(field.element, v, label)) : value;
    if (field.__bdTranslatedImage) return value ? SAME_AS_IT : '';
    // immagini senza "usa l'italiana" (OG Image: nelle traduzioni si genera in automatico nella lingua)
    if (field.__bdImage) return '';
    // testi: campi di testo (formKind "slug") ed editor (formKind "assets", salvati come Markdown)
    if ((field.formKind === 'slug' || field.formKind === 'assets') && typeof value === 'string' && value.trim()) {
      const id = `§${items.length}`;
      items.push({ id, field: label, text: value });
      return id;
    }
    return value;
  };
  return { data: walk({ kind: 'object', fields: schema }, raw, ''), items };
}

/** rimette i testi tradotti al posto dei segnaposto */
function fill(data: any, tr: Map<string, string>): any {
  if (typeof data === 'string') return /^§\d+$/.test(data) ? tr.get(data) ?? data : data;
  if (Array.isArray(data)) return data.map((v) => fill(v, tr));
  if (data && typeof data === 'object') return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, fill(v, tr)]));
  return data;
}

// ---------------------------------------------------------------- Claude
/** regole per lingua: stile (transcreation), formato di numeri e date, dove ambientare gli esempi inventati, esempi di slug */
const LOCALE_RULES: Record<string, { style: string; format: string; examples: string; slugs: string }> = {
  en: {
    style: `Write in international English that reads naturally in the UK, the US, Canada, Australia and Ireland alike:
- Spelling: -ize and -yze endings (optimize, analyze), which are accepted on both sides of the Atlantic. Where the two spellings clash visibly (colour/color, centre/center, favourite, programme, licence, cheque), rephrase with a neutral word when you can; otherwise use US spelling.
- Vocabulary: pick words that work everywhere (phone, not cell or mobile; online store; small business; quote; bill or invoice). Avoid strongly regional slang and idioms.
- Voice: confident, warm and to the point, like the best freelancer and agency websites in London, New York or Sydney. First person singular, talking to "you". Contractions are welcome. Short sentences, active verbs, concrete benefits before features.
- Headings: sentence case, punchy, benefit-led; a heading may play on words or make a promise if it fits. Avoid clichés (“look no further”, “in today’s digital world”, “unlock”, “elevate”, “seamless”, “cutting-edge”) and Italian calques (“realize a website”, “professional” on every line, “at 360 degrees”, “turnkey” overused, “SMEs” → “small businesses”).
- Buttons and calls to action: imperative, specific and appealing (“Get a free quote”, “Book a free 30-minute call”, “See how it works”).`,
    format: 'Numbers, dates and times in English format (1,000 · 2.5 s · 7:30 pm); dates in words (25 November or November 25, never 25/11); prices with the currency symbol before the number (€490, $2,400, £650).',
    examples: 'cities in the USA, the UK, Canada, Australia or Ireland (e.g. "plumber in Austin", "bakery in Manchester", "dentist in Toronto"). Vary them. Example domains (e.g. idraulicorossi.it) become plausible .com / .co.uk domains, and prices inside examples use the local currency of the example’s place',
    slugs: '"websites", "seo-consulting"',
  },
  es: {
    style: `Write in the Spanish of Spain (español de España), for business owners in Spain:
- Address the reader as "tú" (informal, warm, the norm for freelancers and agencies in Spain); first person singular for Antonio.
- Peninsular vocabulary: "móvil", "ordenador", "página web" or "web", "tienda online", "presupuesto" (quote), "factura", "autónomo", "pyme", "IVA", "reunión", "llamada". Never Latin American forms ("celular", "computadora", "cotización", "ustedes" for plural you → "vosotros" only if needed).
- Voice: cercano, seguro y directo, like the best Spanish freelancer and agency websites in Madrid or Barcelona. Short sentences, active verbs, concrete benefits before features. Avoid anglicisms when a natural Spanish word exists, but keep established terms (SEO, Google Ads, landing page, Core Web Vitals).
- Headings: only the first word and proper nouns capitalized (sentence case), punchy and benefit-led. Avoid clichés and calques from Italian ("realizar una web" is fine in Spanish; avoid "a 360 grados", "llave en mano" overuse).
- Buttons and calls to action: imperative with "tú", specific and appealing ("Pide tu presupuesto gratis", "Reserva una llamada gratuita").
- Correct Spanish punctuation: opening ¿ and ¡, Spanish quotation marks are fine as “ ” or « ».`,
    format: 'Numbers, dates and times in Spanish format (1.000 · 2,5 s · 19:30); dates in words (25 de noviembre, never 25/11); prices with the euro sign after the number (490 €, 2.400 €).',
    examples: 'cities and places in Spain ONLY (e.g. "fontanero en Madrid", "panadería en Sevilla", "dentista en Valencia"; also Barcelona, Bilbao, Málaga, Zaragoza, Granada, San Sebastián, A Coruña, Palma, La Rioja, Rías Baixas…). Vary them. Example domains (e.g. idraulicorossi.it) become plausible .es domains, example people get Spanish names, phone numbers use the Spanish format (+34 6xx xxx xxx), prices inside examples stay in euros, and food, products and businesses become typically Spanish ones',
    slugs: '"paginas-web", "consultoria-seo"',
  },
  de: {
    style: `Write in the standard German of Germany (Bundesdeutsch), for business owners in Germany. Do not use Austrian or Swiss variants (no "Jänner", no "ss" instead of "ß"):
- Address the reader as "Sie" (the norm for B2B services in Germany, from craftsmen to the Mittelstand), warm but professional; first person singular for Antonio.
- Natural German business vocabulary: "Website", "Onlineshop", "Angebot" (quote), "Rechnung", "Festpreis", "Selbstständige", "kleine und mittlere Unternehmen" or "KMU", "Handwerksbetrieb", "Termin", "Erstgespräch", "MwSt.". Keep established English terms German marketers really use (SEO, Google Ads, Landingpage, Core Web Vitals, Performance, Tracking), but avoid needless Denglisch.
- Voice: klar, kompetent und direkt, like the best German freelancer and agency websites in Berlin, Hamburg or Munich. Short sentences, active verbs, concrete benefits before features. Break up long compound nouns with a hyphen when they hurt readability on mobile.
- Headings: German capitalization rules (nouns capitalized), punchy and benefit-led. Avoid clichés ("ganzheitlich", "maßgeschneiderte Lösungen" overuse, "im digitalen Zeitalter") and Italian calques ("realisieren" for building a website, "360 Grad", "schlüsselfertig" overuse).
- Buttons and calls to action: imperative with "Sie" or a short noun phrase, specific and appealing ("Kostenloses Angebot anfordern", "Kostenloses Erstgespräch buchen").
- German quotation marks „…“.`,
    format: 'Numbers, dates and times in German format (1.000 · 2,5 s · 19:30 Uhr); dates in words (25. November, never 25/11); prices with the euro sign after the number (490 €, 2.400 €).',
    examples: 'cities and places in Germany ONLY, never Austria or Switzerland (e.g. "Elektriker Berlin", "Bäckerei in Hamburg", "Zahnarzt München"; also Köln, Frankfurt, Stuttgart, Düsseldorf, Leipzig, Dresden, Nürnberg, Freiburg, Bremen, the Mosel or the Allgäu…). Vary them. Example domains (e.g. idraulicorossi.it) become plausible .de domains, example people get German names, phone numbers use the German format (+49 1xx xxxxxxx), prices inside examples stay in euros, and food, products and businesses become typically German ones',
    slugs: '"webdesign", "seo-beratung"',
  },
};

const SYSTEM = (lang: string) => {
  const L = LOCALE_RULES[lang] ?? LOCALE_RULES.en;
  return `You are the senior ${LANG_NAMES[lang]} copywriter of bortolin.dev, the website of Antonio Bortolin, an Italian freelance web designer, developer and SEO consultant who also works with clients abroad. You receive the Italian copy of a page and write the ${LANG_NAMES[lang]} version.

Do not translate: transcreate. Keep the meaning, the facts, the structure and the intent of every item, but rewrite each sentence the way a native ${LANG_NAMES[lang]} copywriter would have written it from scratch, for readers who have never seen the Italian. Rephrase freely, reorder clauses, swap Italian idioms for ${LANG_NAMES[lang]} ones and make headings and buttons more compelling where you can. The result must not sound translated.

${L.style}

Rules:
- Keep Markdown/Markdoc markup exactly as it is: **bold**, *italic*, [link text](url) (translate the link text, never the URL), {% tags %}, line breaks and blank lines.
- Keep placeholders such as {n} untouched.
- Keep brand and product names (bortolin.dev, Google, Google Ads, Meta, Lighthouse, PageSpeed, WordPress, ChatGPT…), URLs, email addresses, real phone numbers, numbers, and the prices of Antonio’s services in €.
- ${L.format}
- Facts stay true: where Antonio lives and works (Veneto and Friuli Venezia Giulia, Italy), real clients, real projects and their locations, addresses, legal and company data are translated, never changed.
- Localize invented examples only. Italian places and local examples (cities such as Treviso, Udine, Pordenone, Venezia, Padova, Trieste; regions such as Friuli or Veneto; Italian business examples like "idraulico a Treviso" or "negozio di Udine") become equivalent examples set in ${L.examples}. Example search queries become natural ${LANG_NAMES[lang]} queries. Do not invent real business names.
- Italian-specific terms get the usual local equivalent (e.g. "P.IVA" → the local name of the VAT number).
- Buttons, labels, menu items, badges and chart labels must stay about as short as the source: they live in tight layouts.
- Keep roughly the same length for every item (±20%), so the layout does not break.
- Link and button texts must say where they lead: never generic texts such as “Learn more”, “Click here” or “Read more” (or their ${LANG_NAMES[lang]} equivalents) on their own.
- SEO fields: a Meta Title should be 35–65 characters, a Meta Description 80–160 characters, both written for ${LANG_NAMES[lang]}-language search.
- Also return "slug": a short, lowercase, hyphenated ${LANG_NAMES[lang]} URL slug for the page, without accents (2–5 words, from its main topic; e.g. ${L.slugs}). Return "" if the content is not a page.

You receive a JSON list of items {id, field, text}: "field" is the editor label of the field (context only). Return every id exactly once with its translated text.`;
};

async function translate(lang: string, page: string, items: Item[]) {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const client = new Anthropic(apiKey ? { apiKey } : {});
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'high',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            items: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } }, required: ['id', 'text'], additionalProperties: false } },
          },
          required: ['slug', 'items'],
          additionalProperties: false,
        },
      },
    },
    system: SYSTEM(lang),
    messages: [{ role: 'user', content: `Page: ${page}\n\n${JSON.stringify(items)}` }],
  } as any);
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('La traduzione è stata rifiutata dal modello.');
  if (msg.stop_reason === 'max_tokens') throw new Error('Il testo è troppo lungo per una sola traduzione.');
  const text = msg.content.flatMap((b: any) => (b.type === 'text' ? [b.text] : [])).join('');
  const out = JSON.parse(text) as { slug: string; items: { id: string; text: string }[] };
  return { slug: out.slug, map: new Map(out.items.map((i) => [i.id, i.text])) };
}

/** traduzione preparata fuori dal pannello */
const given = (t: { slug: string; items: { id: string; text: string }[] }) => ({ slug: t.slug, map: new Map(t.items.map((i) => [i.id, i.text])) });

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---------------------------------------------------------------- endpoint
export const GET: APIRoute = async () => json(status());

export const POST: APIRoute = async ({ request }) => {
  let body: { lang?: string; key?: string; collection?: string; slug?: string; force?: boolean; prepare?: boolean; translated?: { slug: string; items: { id: string; text: string }[] } };
  try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida' }, 400); }
  const lang = body.lang ?? TRANSLATIONS[0];
  if (!(TRANSLATIONS as readonly string[]).includes(lang)) return json({ error: `Lingua non prevista: ${lang}` }, 400);

  try {
    // ---- singleton (pagine a layout fisso, Menu, Impostazioni…)
    if (body.key) {
      if (!TRANSLATABLE_SINGLETONS.includes(body.key)) return json({ error: 'Contenuto non traducibile' }, 400);
      const it = singletons[body.key], tr = singletons[tKey(lang, body.key)];
      const target = tr.path + '.json';
      if (existsSync(target) && !body.force && !body.prepare) return json({ error: 'La traduzione esiste già', exists: true }, 409);
      const { data, items } = prepare(tr.schema, readJson(it.path + '.json'));
      if (body.prepare) return json({ page: it.label, items });
      const { slug, map } = body.translated ? given(body.translated) : await translate(lang, it.label, items);
      const out = fill(data, map);
      const fixed = FIXED_PAGES.find((p) => p.key === body.key);
      if (fixed && fixed.key !== 'home' && out.seo) out.seo = { slug: slugify(slug) || fixed.url.split('/').filter(Boolean).pop(), ...out.seo };
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
      refreshSite();
      return json({ ok: true, href: `/keystatic/singleton/${tKey(lang, body.key)}` });
    }

    // ---- voce di una collection (la cartella della lingua, nome del file = indirizzo tradotto)
    const col = body.collection as (typeof COLLECTIONS)[number];
    if (!col || !COLLECTIONS.includes(col) || !body.slug) return json({ error: 'Contenuto non valido' }, 400);
    const it = collections[col], tr = collections[tKey(lang, col)];
    const source = it.path.replace('*', body.slug) + '.json';
    if (!existsSync(source)) return json({ error: 'Voce italiana non trovata' }, 404);
    const existing = status().translations[lang].collections[col][body.slug];
    if (existing && !body.force && !body.prepare) return json({ error: 'La traduzione esiste già', exists: true, href: `/keystatic/collection/${tKey(lang, col)}/item/${existing}` }, 409);
    const raw = readJson(source);
    const { data, items } = prepare(tr.schema, raw);
    if (body.prepare) return json({ page: `${it.label}: ${raw[it.slugField] ?? body.slug}`, items });
    const { slug, map } = body.translated ? given(body.translated) : await translate(lang, `${it.label}: ${raw[it.slugField] ?? body.slug}`, items);
    const out = { ...fill(data, map), original: body.slug };
    const dir = dirname(tr.path);
    let name = slugify(slug) || slugify(out[it.slugField] ?? '') || body.slug;
    if (existing) name = existing; // ritraduzione: stesso indirizzo
    else while (existsSync(`${dir}/${name}.json`)) name += '-2';
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/${name}.json`, JSON.stringify(out, null, 2) + '\n');
    refreshSite();
    return json({ ok: true, href: `/keystatic/collection/${tKey(lang, col)}/item/${name}` });
  } catch (e) {
    const err = e as any;
    const msg = err instanceof Anthropic.AuthenticationError || /api.?key|auth/i.test(String(err?.message))
      ? 'Chiave API mancante o non valida: aggiungi ANTHROPIC_API_KEY nel file .env e riavvia il server.'
      : err instanceof Anthropic.RateLimitError ? 'Troppe richieste: riprova tra poco.'
      : err instanceof Anthropic.APIError ? `Errore del servizio AI (${err.status}): ${err.message}`
      : String(err?.message ?? err);
    return json({ error: msg }, 500);
  }
};
