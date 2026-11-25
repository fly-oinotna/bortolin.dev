// Foto profilo delle recensioni Google, servite dal sito: /reviews/<id>.webp
// Le scarica lib/places.ts durante il build (al massimo una volta a settimana, poi restano in cache):
// il browser dei visitatori non contatta mai i server di Google.
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { LANGS } from '../../i18n/langs';
import { read } from '../../lib/content';
import { getReviews } from '../../lib/reviews';
import { photoPath } from '../../lib/places';

export async function getStaticPaths() {
  const cfg = await read('reviews');
  const ids = new Set<string>();
  for (const lang of LANGS) {
    const data = await getReviews(cfg, lang);
    if (data?.source !== 'google') continue;
    for (const r of data.reviews) {
      const m = r.photo?.match(/^\/reviews\/([a-f0-9]+)\.webp$/);
      if (m) ids.add(m[1]);
    }
  }
  return [...ids].map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) =>
  new Response(new Uint8Array(readFileSync(photoPath(params.file!))), {
    headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
