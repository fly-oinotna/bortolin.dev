// Immagini social automatiche: /og/<id>.jpg per ogni pagina senza "OG Image personalizzata" (vedi lib/og.ts)
import type { APIRoute } from 'astro';
import { allPages } from '../../lib/pages';
import { entry } from '../../lib/content';
import { t } from '../../i18n/ui';
import { prefix } from '../../i18n/langs';
import { renderOg, type OgData } from '../../lib/og';
import { categoryLabel, readingTime } from '../../lib/blog';

/** percorso dell'immagine (/src/assets/…) → file su disco */
const disk = (p?: string | null) => (p ? p.replace(/^\//, '') : undefined);
/** titolo SEO senza il nome del sito ("… | bortolin.dev") */
const bare = (t?: string | null) => (t ?? '').replace(/\s*[|–-]\s*bortolin\.dev\s*$/i, '').trim();

export async function getStaticPaths() {
  return (await allPages()).filter((p) => !p.seo?.ogImage).map((p) => ({ params: { id: p.id }, props: { page: p } }));
}

export const GET: APIRoute = async ({ props }) => {
  const p = (props as any).page as Awaited<ReturnType<typeof allPages>>[number];
  // tipo e slug dalla pagina italiana corrispondente; testi nella lingua della pagina
  const [kind, slug] = p.itId.includes('/') ? p.itId.split('/') : ['fixed', p.itId];
  const ui = t(p.lang);
  const site = `bortolin.dev${prefix(p.lang)}`;
  let data: OgData;
  if (kind === 'posts') {
    const e = (await entry('posts', slug, p.lang))!.entry;
    data = { eyebrow: `Blog · ${categoryLabel(e.content.category, p.lang)}`, title: e.title, meta: `${readingTime(e.content)} ${ui.readingTime} · ${site}/blog`, photo: disk(e.content.image) };
  } else if (kind === 'caseStudies') {
    const e = (await entry('caseStudies', slug, p.lang))!.entry;
    data = { eyebrow: e.hero.eyebrow || ui.caseStudy, title: e.title, chips: [...e.hero.tags], screenshot: e.card.desktopImage ? { file: disk(e.card.desktopImage)!, domain: e.card.domain ?? '' } : undefined };
  } else if (kind === 'pages') {
    data = { eyebrow: ui.page, title: p.title, meta: `bortolin.dev${p.url}` };
  } else {
    data = { eyebrow: p.ogLabel ?? p.label ?? 'bortolin.dev', title: bare(p.seo?.title) || p.ogLabel || p.title };
  }
  return new Response(new Uint8Array(await renderOg(data)), { headers: { 'Content-Type': 'image/jpeg' } });
};
