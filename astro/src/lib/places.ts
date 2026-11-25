// Recensioni e voto da Google Places API (New), letti al momento del build.
//
// Configurazione (file .env nella cartella astro, NON va su git):
//   GOOGLE_PLACES_API_KEY=...   chiave con "Places API (New)" abilitata
//   GOOGLE_PLACE_ID=...         ID della scheda Google dell'attività
//
// Il sito è statico: le recensioni vengono lette durante il build e scritte nell'HTML; chi visita il sito
// non fa nessuna richiesta a Google. Dati e foto profilo finiscono in una cache su disco e vengono
// riscaricati AL MASSIMO UNA VOLTA A SETTIMANA (10 build in un giorno = 0 chiamate dopo la prima).
//   PLACES_REFRESH=1        forza il riscaricamento (es. dopo una nuova recensione)
//   PLACES_CACHE_DIR=...    cartella della cache (predefinita: node_modules/.cache/bortolin-places,
//                           che gli hosting come Netlify/Vercel/Cloudflare conservano tra un build e l'altro)
// Le foto profilo vengono ridotte a 80×80 WebP e servite dal sito (/reviews/<id>.webp, vedi
// src/pages/reviews/[file].webp.ts): nessuna richiesta a server Google dal browser dei visitatori.
// Se Google non risponde si usa l'ultima cache disponibile, anche se più vecchia di una settimana.
// Senza chiave: in sviluppo si usano dati di prova, in produzione la sezione recensioni e i voti non compaiono.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

export interface PlaceReview {
  rating: number;
  text: string;
  original?: string;
  author: string;
  authorUri?: string;
  /** foto profilo già scaricata: /reviews/<id>.webp */
  photoUri?: string;
  /** indirizzo originale della foto su Google (serve solo per riscaricarla) */
  photoSrc?: string;
  when: string;
  /** data ISO di pubblicazione (per i dati strutturati) */
  publishTime?: string;
}

export interface PlaceData {
  rating: number;
  count: number;
  mapsUri: string;
  writeReviewUri: string;
  reviews: PlaceReview[];
  mock: boolean;
}

const MOCK: PlaceData = {
  rating: 5,
  count: 24,
  mapsUri: 'https://www.google.com/maps/search/?api=1&query=bortolin.dev',
  writeReviewUri: 'https://www.google.com/maps/search/?api=1&query=bortolin.dev',
  mock: true,
  reviews: [1, 2, 3, 4, 5].map((i) => ({
    rating: 5,
    text: 'Recensione di prova: in produzione qui compare il testo vero, importato da Google e tradotto nella lingua del sito.',
    original: i % 2 ? 'Test review: in production the real text from Google appears here.' : undefined,
    author: `Cliente di prova ${i}`,
    when: `${i} mesi fa`,
  })),
};

const cache = new Map<string, Promise<PlaceData | null>>();

const WEEK = 7 * 24 * 60 * 60 * 1000;
const CACHE_DIR = process.env.PLACES_CACHE_DIR || join(process.cwd(), 'node_modules', '.cache', 'bortolin-places');
const PHOTO_DIR = join(CACHE_DIR, 'photos');
/** nome del file della foto (senza estensione) a partire dal suo indirizzo su Google */
const photoId = (src: string) => createHash('sha1').update(src).digest('hex').slice(0, 16);
/** file su disco di una foto già scaricata (per l'endpoint /reviews/<id>.webp) */
export const photoPath = (id: string) => join(PHOTO_DIR, `${id.replace(/[^a-f0-9]/g, '')}.webp`);

/**
 * Dati della scheda Google nella lingua richiesta (una sola chiamata per lingua e build).
 * Place ID da Keystatic → Reviews (se vuoto: GOOGLE_PLACE_ID del file .env); chiave API solo da GOOGLE_PLACES_API_KEY del file .env.
 */
export function getPlace(lang = 'it', creds: { placeId?: string | null } = {}): Promise<PlaceData | null> {
  const cacheKey = `${lang}|${creds.placeId ?? ''}`;
  if (!cache.has(cacheKey)) cache.set(cacheKey, load(lang, creds));
  return cache.get(cacheKey)!;
}

/** scarica la foto profilo (una volta sola) e la salva come WebP 80×80; restituisce /reviews/<id>.webp */
async function localPhoto(src?: string): Promise<string | undefined> {
  if (!src) return undefined;
  const id = photoId(src);
  const file = photoPath(id);
  if (!existsSync(file)) {
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      mkdirSync(PHOTO_DIR, { recursive: true });
      writeFileSync(file, await sharp(Buffer.from(await res.arrayBuffer())).resize(80, 80, { fit: 'cover' }).webp({ quality: 80 }).toBuffer());
    } catch (e) {
      console.warn('[places] Foto profilo non scaricata:', (e as Error).message);
      return undefined; // al suo posto compare l'iniziale del nome
    }
  }
  return `/reviews/${id}.webp`;
}

/** completa le foto locali (riscaricando quelle mancanti, es. cache delle foto cancellata) */
const withPhotos = async (d: PlaceData): Promise<PlaceData> => ({
  ...d,
  reviews: await Promise.all(d.reviews.map(async (r) => ({ ...r, photoUri: await localPhoto(r.photoSrc) }))),
});

async function load(lang: string, creds: { placeId?: string | null }): Promise<PlaceData | null> {
  // la chiave API sta solo nel file .env, mai nei contenuti
  const key = import.meta.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const id = creds.placeId?.trim() || import.meta.env.GOOGLE_PLACE_ID || process.env.GOOGLE_PLACE_ID;
  if (!key || !id) {
    // dati di prova: sempre in sviluppo, nel build solo con PLACES_MOCK=1 (per i test)
    if (import.meta.env.DEV || process.env.PLACES_MOCK === '1') return MOCK;
    console.warn('[places] GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID mancanti: recensioni non mostrate.');
    return null;
  }

  // cache su disco: se ha meno di una settimana non si chiama Google
  const cacheFile = join(CACHE_DIR, `${createHash('sha1').update(id).digest('hex').slice(0, 12)}-${lang}.json`);
  let cached: PlaceData | null = null;
  if (existsSync(cacheFile)) {
    try { cached = JSON.parse(readFileSync(cacheFile, 'utf8')); } catch { cached = null; }
  }
  const fresh = cached && Date.now() - statSync(cacheFile).mtimeMs < WEEK && process.env.PLACES_REFRESH !== '1';
  if (cached && fresh) return withPhotos(cached);

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${lang}`, {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'rating,userRatingCount,reviews,googleMapsUri',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const d = await res.json();
    const data: PlaceData = {
      rating: d.rating ?? 0,
      count: d.userRatingCount ?? 0,
      mapsUri: d.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${id}`,
      writeReviewUri: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`,
      mock: false,
      reviews: (d.reviews ?? []).map((r: any): PlaceReview => {
        const text = r.text?.text ?? r.originalText?.text ?? '';
        const original = r.originalText?.text;
        return {
          rating: r.rating ?? 5,
          text,
          // "Mostra originale" solo se Google ha davvero tradotto la recensione
          original: original && r.originalText?.languageCode !== lang && original !== text ? original : undefined,
          author: r.authorAttribution?.displayName ?? '',
          authorUri: r.authorAttribution?.uri,
          photoSrc: r.authorAttribution?.photoUri,
          when: r.relativePublishTimeDescription ?? '',
          publishTime: r.publishTime,
        };
      }),
    };
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(cacheFile, JSON.stringify(data));
    console.log(`[places] Recensioni (${lang}) aggiornate da Google; prossimo aggiornamento tra 7 giorni.`);
    return withPhotos(data);
  } catch (e) {
    console.warn('[places] Errore nel recupero delle recensioni:', (e as Error).message);
    // meglio recensioni di qualche giorno fa che nessuna recensione
    return cached ? withPhotos(cached) : null;
  }
}

/** 5 → "5,0" */
export const formatRating = (n: number, lang = 'it') =>
  new Intl.NumberFormat(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);
