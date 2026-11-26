// /_redirects per Netlify, generato a ogni build da Keystatic → Redirect (come AM Tools 3 → Redirects).
// Formato Netlify: "/da  /a  301" (con "!" = forza, anche se la pagina vecchia esiste ancora).
// Nota: le route che iniziano con "_" sono ignorate da Astro, per questo il nome del file è un parametro.
import type { APIRoute, GetStaticPaths } from 'astro';
import { read } from '../lib/content';
import { href } from '../lib/links';
import { TRANSLATIONS } from '../i18n/langs';

export const getStaticPaths: GetStaticPaths = () => [{ params: { redirects: '_redirects' } }];

export const GET: APIRoute = async () => {
  const data = await read('redirects');
  const seen = new Set<string>();
  const lines: string[] = ['# Generato da Keystatic → Redirect: non modificare a mano'];
  for (const r of data.list.items) {
    const from = r.from.trim();
    let to = href(r.to).trim();
    // un'ancora da sola (es. "#contatti") in un redirect non ha senso: punta alla sezione in Home
    if (to.startsWith('#')) to = `/${to}`;
    if (!from.startsWith('/') || !/^(\/|https?:\/\/)\S*$/.test(to)) {
      console.warn(`[redirect] ignorato, percorso o destinazione non validi: "${from}" → "${to}"`);
      continue;
    }
    if (seen.has(from)) {
      console.warn(`[redirect] "${from}" compare più volte: vale solo il primo`);
      continue;
    }
    seen.add(from);
    lines.push(`${from}  ${to}  ${r.type}${r.force ? '!' : ''}`);
  }
  // pagina 404 nella lingua giusta: valgono solo per gli indirizzi che non esistono (regole non forzate, in fondo)
  lines.push('', '# Pagina 404 per lingua (Keystatic → Pagina 404)');
  for (const lang of TRANSLATIONS) lines.push(`/${lang}/*  /${lang}/404/index.html  404`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
