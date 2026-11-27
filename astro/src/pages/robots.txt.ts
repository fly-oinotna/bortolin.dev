// /robots.txt: tutto accessibile tranne il pannello (/admin) e le API, con il link alla sitemap
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://bortolin.dev/').replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
