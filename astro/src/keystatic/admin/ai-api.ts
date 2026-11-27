// /api/ai — "Genera con AI" nel pannello, con l'AI scelta dall'utente (ai.ts).
//   GET                                   → { available: ['claude', …], labels }
//   POST { task: 'seo', field, location, provider } → { title, description } dal contenuto SALVATO della pagina
//   POST { task: 'alt', path, provider }            → { alt } guardando l'immagine della mediateca
import type { APIRoute } from 'astro';
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import keystaticConfig from '../../../keystatic.config';
import { LANG_NAMES } from '../../i18n/langs';
import { PROVIDERS, available, generateJSON, pick } from './ai';
import { open, errorResponse } from './workspace';

export const prerender = false;

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const singletons = keystaticConfig.singletons as Record<string, any>;
const collections = keystaticConfig.collections as Record<string, any>;

/** tutti i testi di un contenuto (per far capire all'AI di cosa parla la pagina), senza percorsi e codici */
function texts(v: unknown, out: string[] = []): string[] {
  if (typeof v === 'string') { if (v.length > 2 && !/^(\/|https?:|#|[a-z0-9-]+$)/i.test(v)) out.push(v.trim()); }
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'seo') texts(x, out);
  return out;
}

const SEO_SCHEMA = { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, required: ['title', 'description'], additionalProperties: false };
const ALT_SCHEMA = { type: 'object', properties: { alt: { type: 'string' } }, required: ['alt'], additionalProperties: false };

export const GET: APIRoute = async ({ request }) => {
  try { await open(request, { maxAge: 60_000 }); } catch (e) { return errorResponse(e); }
  return json({ available: available(), labels: Object.fromEntries(Object.entries(PROVIDERS).map(([k, v]) => [k, v.label])) });
};

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida' }, 400); }
  try {
    await open(request, { maxAge: 15_000 });
    const provider = pick(body.provider);

    if (body.task === 'seo') {
      const loc = body.location ?? {};
      const file = loc.kind === 'singleton' ? singletons[loc.key]?.path + '.json' : collections[loc.collection]?.path.replace('*', loc.slug) + '.json';
      if (!file || !existsSync(file)) return json({ error: 'Salva la pagina almeno una volta: l’AI legge il contenuto salvato.' }, 400);
      const data = JSON.parse(readFileSync(file, 'utf8'));
      const key = String(loc.kind === 'singleton' ? loc.key : loc.collection);
      const lang = /^([a-z]{2})_/.exec(key)?.[1] ?? 'it';
      const content = texts(data).join('\n').slice(0, 12000);
      const out = await generateJSON<{ title: string; description: string }>({
        provider,
        effort: 'medium',
        maxTokens: 4000,
        system: `You are the SEO copywriter of bortolin.dev, the website of Antonio Bortolin, a freelance web designer, developer and SEO consultant. Write in ${LANG_NAMES[lang] ?? 'Italian'}.
- "title": the page's meta title, 35–65 characters INCLUDING the suffix " | bortolin.dev", main keyword first, specific and compelling, no clickbait.
- "description": the meta description, 80–160 characters, a concrete benefit and a soft call to action, no quotes, no emoji.
Use the vocabulary people really search for. Do not invent facts, prices or claims that are not in the content.`,
        user: `Page content:\n${content}\n\nCurrent meta title: ${data.seo?.title ?? '(none)'}\nCurrent meta description: ${data.seo?.description ?? '(none)'}`,
        schema: SEO_SCHEMA,
      });
      return json({ ...out, provider });
    }

    if (body.task === 'alt') {
      const root = resolve(process.cwd(), 'src/assets/images');
      const file = resolve(process.cwd(), String(body.path ?? '').replace(/^\/+/, ''));
      if (!file.startsWith(root + sep) || !existsSync(file)) return json({ error: 'Immagine non trovata.' }, 404);
      // le AI vogliono immagini raster non troppo grandi: tutto diventa JPEG max 1024 px (SVG compresi)
      const sharp = (await import('sharp')).default;
      const raw = readFileSync(file);
      const jpeg = await sharp(raw, { density: extname(file).toLowerCase() === '.svg' ? 200 : undefined }).flatten({ background: '#ffffff' }).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      const lang = LANG_NAMES[body.lang] ?? 'Italian';
      const out = await generateJSON<{ alt: string }>({
        provider,
        effort: 'medium',
        maxTokens: 2000,
        system: `You write alt text for images on bortolin.dev (web design, SEO, performance, AI). Write in ${lang}.
- Describe what matters in the image for a person who cannot see it, in at most 125 characters, one sentence, no full stop at the end.
- Do not start with "Image of", "Photo of" or similar. No keyword stuffing. If it is a logo, say "Logo <brand>". If it is a screenshot of a website or a chart, say what it shows.`,
        user: `File name: ${file.split(sep).pop()}. Write the alt text.`,
        image: { data: jpeg.toString('base64'), mime: 'image/jpeg' },
        schema: ALT_SCHEMA,
      });
      return json({ alt: out.alt.trim(), provider });
    }

    return json({ error: 'Operazione non prevista' }, 400);
  } catch (e) {
    if ((e as any)?.status) return errorResponse(e);
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
};
