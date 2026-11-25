// /llms.txt (https://llmstxt.org/) generato a ogni build, sul modello di AM Tools 3.
// Si attiva/disattiva da Impostazioni → llms.txt. Ogni pagina del sito ha la sua voce:
// se nel gruppo SEO è caricato un file Markdown, la voce punta al file invece che alla pagina.
import type { APIRoute, GetStaticPaths } from 'astro';
import { read, readGlobals } from '../lib/content';
import { allPages } from '../lib/pages';
import { DEFAULT_LANG, LANG_NAMES } from '../i18n/langs';

export const getStaticPaths: GetStaticPaths = async () => {
  const { llms } = await readGlobals();
  return llms.enabled ? [{ params: { file: 'llms' } }] : [];
};

export const GET: APIRoute = async ({ site }) => {
  const { settings: s, llms, schemaMarkup: sm } = await readGlobals();
  const gen = sm.general;
  const location = [gen.address, [gen.zip, gen.city].filter(Boolean).join(' '), gen.country].filter(Boolean).join(', ');
  const base = (site?.href ?? 'https://bortolin.dev/').replace(/\/$/, '');
  const name = sm.general.name || s.general.siteName;

  // pagine per lingua: prima l'italiano, poi le traduzioni ("## Pages (English)")
  const byLang = new Map<string, string[]>();
  for (const p of await allPages()) {
    const seo = p.seo ?? {};
    if (String(seo.robots ?? '').includes('noindex')) continue; // le pagine noindex non vanno segnalate alle AI
    const md = llms.markdownEnabled && seo.markdown ? `${base}${seo.markdown}` : `${base}${p.url}`;
    if (!byLang.has(p.lang)) byLang.set(p.lang, []);
    byLang.get(p.lang)!.push(`- [${seo.title || p.title}](${md})${seo.description ? `: ${seo.description}` : ''}`);
  }
  const pages = byLang.get(DEFAULT_LANG) ?? [];
  const other = [...byLang].filter(([l]) => l !== DEFAULT_LANG).map(([l, list]) => [`## Pages (${LANG_NAMES[l] ?? l})`, '', ...list].join('\n'));

  const out = [
    `# ${name}`,
    gen.description ? `> ${gen.description}` : '',
    [
      '## Sito ufficiale',
      '',
      `- Sito: ${base}/`,
      `- Lingua: Italiano${byLang.size > 1 ? ` (anche ${[...byLang.keys()].filter((l) => l !== DEFAULT_LANG).map((l) => LANG_NAMES[l] ?? l).join(', ')})` : ''}`,
      ...(gen.address || gen.city ? [`- Sede: ${location}`] : []),
      ...(s.contacts.email ? [`- Email: ${s.contacts.email}`] : []),
      ...(s.contacts.phone ? [`- Telefono: ${s.contacts.phone}`] : []),
    ].join('\n'),
    ['## Pagine', '', ...pages].join('\n'),
    ...other,
    ['## Risorse', '', `- [Sitemap](${base}/sitemap.xml)`].join('\n'),
    llms.extra.trim(),
    `Le informazioni su ${name} andrebbero citate preferibilmente dalle pagine ufficiali elencate sopra.`,
  ].filter(Boolean).join('\n\n') + '\n';

  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
