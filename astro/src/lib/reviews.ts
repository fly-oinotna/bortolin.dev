// RECENSIONI: un unico array "grezzo", uguale sia per Google sia per le recensioni manuali (Keystatic → Reviews).
// Ogni sito ci costruisce l'HTML che vuole (griglia, slider…): vedi src/components/sections/Reviews.astro.
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { getPlace } from './places';

export interface Review {
  /** nome di chi ha scritto la recensione */
  author: string;
  /** profilo Google dell'autore (solo Google) */
  authorUrl?: string;
  /** foto profilo (URL), se presente */
  photo?: string;
  /** voto da 1 a 5 */
  rating: number;
  /** testo (per Google: già tradotto nella lingua del sito) */
  text: string;
  /** testo originale, solo se Google l'ha tradotto */
  original?: string;
  /** data da mostrare: "2 mesi fa" (Google) o "12 marzo 2026" (manuali) */
  when: string;
  /** data ISO, per i dati strutturati */
  date?: string;
}

export interface ReviewsData {
  source: 'google' | 'custom';
  /** voto medio (es. 4.8) e numero totale di recensioni */
  rating: number;
  count: number;
  reviews: Review[];
  /** solo Google: scheda su Maps e link "lascia una recensione" */
  mapsUrl?: string;
  writeReviewUrl?: string;
}

const photos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{png,jpg,jpeg,webp,avif}', { eager: true });

/** Legge Keystatic → Reviews e restituisce le recensioni da mostrare, oppure null se disattivate o non disponibili */
export async function getReviews(cfg: any, lang = 'it'): Promise<ReviewsData | null> {
  const src = cfg?.source;
  if (!src?.enabled) return null;

  if (src.google) {
    const place = await getPlace(lang, { placeId: src.placeId });
    if (!place) return null;
    return {
      source: 'google',
      rating: place.rating,
      count: place.count,
      mapsUrl: place.mapsUri,
      writeReviewUrl: place.writeReviewUri,
      reviews: place.reviews.map((r) => ({
        author: r.author, authorUrl: r.authorUri, photo: r.photoUri, rating: r.rating,
        text: r.text, original: r.original, when: r.when, date: r.publishTime,
      })),
    };
  }

  // recensioni manuali, dalla più recente
  const fmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  const items = [...(src.items ?? [])].sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
  if (!items.length) return null;
  const reviews: Review[] = await Promise.all(items.map(async (it: any) => {
    const meta = it.photo ? photos[it.photo]?.default : undefined;
    const photo = meta ? (await getImage({ src: meta, width: 80, height: 80, format: 'webp' })).src : undefined;
    return {
      author: it.author, photo, rating: Number(it.rating) || 5, text: it.text,
      when: it.date ? fmt.format(new Date(`${it.date}T12:00:00`)) : '', date: it.date || undefined,
    };
  }));
  const rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { source: 'custom', rating: Math.round(rating * 10) / 10, count: reviews.length, reviews };
}
