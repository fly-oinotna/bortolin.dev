// /robots.txt: tutto accessibile, con il link alla sitemap
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://bortolin.dev/').replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
