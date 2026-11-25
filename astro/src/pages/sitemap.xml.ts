// /sitemap.xml generata a ogni build (pagine da src/lib/pages.ts, escluse quelle "fuori sitemap" o in noindex),
// con le versioni nelle altre lingue (xhtml:link hreflang)
import type { APIRoute } from 'astro';
import { sitemapEntries } from '../lib/sitemap';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site }) => {
  const base = (site?.href ?? 'https://bortolin.dev/').replace(/\/$/, '');
  const urls = (await sitemapEntries())
    .map((e) => [
      '  <url>',
      `    <loc>${esc(base + e.url)}</loc>`,
      ...(e.lastmod ? [`    <lastmod>${e.lastmod}</lastmod>`] : []),
      ...e.alternates.map(([l, u]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${esc(base + u)}"/>`),
      '  </url>',
    ].join('\n'))
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
