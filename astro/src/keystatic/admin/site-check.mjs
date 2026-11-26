// CONTROLLO DEL SITO a ogni build (integration.mjs → astro:build:done): analizza le pagine HTML generate e scrive
// /_bd/site-check.json, che la Dashboard mostra nella scheda "Controllo del sito". Non blocca mai la build: avvisa.
// Controlli: link interni rotti, immagini senza alt, titolo/description mancanti o duplicati, H1 (uno per pagina), immagini pesanti.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const HEAVY = 300 * 1024;

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, out); else out.push(f);
  }
  return out;
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export function siteCheck(dist) {
  const files = walk(dist);
  const html = files.filter((f) => f.endsWith('.html'));
  const urlOf = (f) => '/' + relative(dist, f).split(sep).join('/').replace(/index\.html$/, '').replace(/\.html$/, '');
  /** esiste qualcosa a questo indirizzo nel sito generato? */
  const exists = (p) => {
    const clean = decodeURI(p.split('#')[0].split('?')[0]);
    if (!clean || clean === '/') return true;
    const f = join(dist, clean);
    return existsSync(f) && (statSync(f).isFile() || existsSync(join(f, 'index.html'))) || existsSync(`${f}.html`);
  };
  // indirizzi gestiti fuori dalle pagine statiche (funzioni, redirect) o che non sono pagine
  const skip = (p) => /^\/(admin|api|\.netlify|cdn-cgi)(\/|$)/.test(p) || p.startsWith('//');
  // redirect di _redirects: un link verso un vecchio indirizzo rediretto non è "rotto"
  const redirects = existsSync(join(dist, '_redirects')) ? readFileSync(join(dist, '_redirects'), 'utf8').split('\n').map((l) => l.trim().split(/\s+/)[0]).filter((x) => x?.startsWith('/')) : [];

  const report = { generated: new Date().toISOString(), pages: 0, brokenLinks: [], missingAlt: [], noTitle: [], noDescription: [], h1: [], duplicateTitles: [], duplicateDescriptions: [], heavyImages: [] };
  const titles = new Map(), descs = new Map();

  for (const f of html) {
    const url = urlOf(f);
    if (url.startsWith('/admin')) continue;
    const src = readFileSync(f, 'utf8');
    // pagine che reindirizzano (meta refresh) non sono contenuto
    if (/<meta http-equiv="refresh"/i.test(src)) continue;
    report.pages++;
    const title = decode(src.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? '');
    const desc = decode(src.match(/<meta name="description" content="([^"]*)"/i)?.[1]?.trim() ?? '');
    if (!title) report.noTitle.push(url); else titles.set(title, [...(titles.get(title) ?? []), url]);
    if (!desc) report.noDescription.push(url); else descs.set(desc, [...(descs.get(desc) ?? []), url]);
    const h1 = (src.match(/<h1[\s>]/gi) ?? []).length;
    if (h1 !== 1 && !/\/404(\/|$)/.test(url)) report.h1.push({ url, count: h1 });
    // immagini senza attributo alt (alt="" va bene: immagine decorativa; Astro lo scrive come `alt` senza valore)
    const noAlt = [...src.matchAll(/<img\b(?![^>]*\balt(?=[\s=>\/]))[^>]*>/gi)].map((m) => m[0].match(/src="([^"]+)"/)?.[1] ?? '?');
    if (noAlt.length) report.missingAlt.push({ url, images: [...new Set(noAlt)].slice(0, 5) });
    // link interni
    const links = [...src.matchAll(/<a\b[^>]*\bhref="(\/[^"]*)"/gi)].map((m) => decode(m[1]));
    const broken = [...new Set(links.filter((l) => !skip(l) && !exists(l) && !redirects.includes(l.split('#')[0])))];
    if (broken.length) report.brokenLinks.push({ url, links: broken.slice(0, 10) });
  }
  const dup = (map) => [...map.entries()].filter(([, u]) => u.length > 1).map(([text, urls]) => ({ text, urls }));
  report.duplicateTitles = dup(titles);
  report.duplicateDescriptions = dup(descs);
  // le immagini social (og-…) non le carica la pagina: non contano per la velocità
  report.heavyImages = files.filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f) && !/(^|[\/\\])og-/.test(f) && statSync(f).size > HEAVY)
    .map((f) => ({ file: '/' + relative(dist, f).split(sep).join('/'), kb: Math.round(statSync(f).size / 1024) }))
    .sort((a, b) => b.kb - a.kb).slice(0, 20);

  mkdirSync(join(dist, '_bd'), { recursive: true });
  writeFileSync(join(dist, '_bd', 'site-check.json'), JSON.stringify(report));
  const problems = report.brokenLinks.length + report.missingAlt.length + report.noTitle.length + report.noDescription.length + report.h1.length + report.duplicateTitles.length + report.duplicateDescriptions.length + report.heavyImages.length;
  return { pages: report.pages, problems, report };
}
