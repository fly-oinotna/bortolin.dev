// DASHBOARD del pannello: al posto dell'elenco di Keystatic ("2 entries"…), strumenti utili.
//   1. Salute SEO: punteggio globale dai controlli dei badge (meta title, description, robots, sitemap, schema)
//   2. Pubblicazione: modifiche in attesa (online) o modalità locale
//   3. Contenuti e traduzioni: quante pagine per tipo e quanto è completa ogni lingua
//   4. Strumenti di test sulla pagina scelta: PageSpeed Insights, Schema Validator (Google e schema.org), Facebook
//   5. Google Search Console, Google Analytics 4 e Google Ads tramite GA4 (ultimi 28 giorni, /api/google-data)
//   6. Pagine da sistemare, con il link per modificarle
//   7. Opportunità SEO: ricerche tra la 4ª e la 20ª posizione (Search Console) con la pagina da migliorare
//   8. Pagine non trovate (404 registrate dal sito) con "Crea redirect" verso una pagina scelta
//   9. Controllo del sito dell'ultima build (/_bd/site-check.json, scritto da site-check.mjs)
//  10. Monitor Lighthouse: misure settimanali di PageSpeed (mobile) con andamento e "Misura ora" (/api/lighthouse)
//  11. AI del pannello: Claude, ChatGPT o Gemini per traduzioni e "Genera con AI" (scelta salvata nel browser)
// Dati: /api/seo-status, /api/publish, /api/google-data. Colori: variabili di Keystar + --bd-accent (theme.ts).
import { adminBase } from './base';
import { getProvider, setProvider } from './ai-pref';
import { deployBadge } from './project';
import { t, fmtLocale } from './ui-i18n';

type Report = any;
type Page = Report & { url: string; pageTitle: string; kind: string; label?: string; lang: string; itId: string };

const GREEN = '#4caf50';
const LANG_NAMES: Record<string, string> = { it: 'Italiano', en: 'English', es: 'Español', de: 'Deutsch' };
const TYPE_NAMES: Record<string, string> = { fixed: 'Pagine a layout fisso', pages: 'Pagine', posts: 'Post', caseStudies: 'Casi studio' };
const nf = new Intl.NumberFormat(fmtLocale());
const pf = new Intl.NumberFormat(fmtLocale(), { style: 'percent', maximumFractionDigits: 1 });
/** numero con un decimale nel formato della lingua */
const dec = (n: number, d = 1) => new Intl.NumberFormat(fmtLocale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const CSS = `
.bd-dash { padding: 32px; display: grid; gap: 20px; max-width: 1280px; font: 14px/1.45 var(--kui-typography-font-family-base, system-ui, sans-serif); color: var(--kui-color-foreground-neutral); }
.bd-dash * { box-sizing: border-box; }
.bd-dash h2 { margin: 0 0 4px; font-size: 15px; font-weight: 700; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-dash h3 { margin: 16px 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--kui-color-foreground-neutral-tertiary); }
.bd-dash p { margin: 0; }
.bd-dash .muted { color: var(--kui-color-foreground-neutral-tertiary); font-size: 13px; }
.bd-dash .row { display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.bd-card { background: var(--kui-color-background-surface); border: 1px solid var(--kui-color-border-muted); border-radius: 14px; padding: 20px; min-width: 0; }
.bd-card.wide { grid-column: 1 / -1; }
.bd-dash .row.two { grid-template-columns: 1fr 1fr; }
@media (max-width: 900px) { .bd-dash .row.two { grid-template-columns: 1fr; } }
.bd-hello { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
.bd-hello-side { display: inline-flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bd-deploy img { display: block; }
.bd-hello strong { font-size: 22px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-score { display: flex; flex-direction: column; gap: 16px; align-items: center; margin-top: 12px; }
.bd-ring { flex-shrink: 0; }
.bd-ring text { font: 800 26px var(--kui-typography-font-family-base, system-ui); fill: var(--kui-color-foreground-neutral-emphasis); }
.bd-checks { display: grid; gap: 6px; width: 100%; }
.bd-check { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; font-size: 13px; }
.bd-bar { height: 6px; border-radius: 99px; background: var(--kui-color-background-surface-secondary, rgba(127,127,127,.15)); overflow: hidden; grid-column: 1 / -1; }
.bd-bar i { display: block; height: 100%; border-radius: 99px; background: var(--bd-accent); }
.bd-bar i.warn { background: #f5a623; } .bd-bar i.bad { background: #e5484d; }
.bd-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 12px; margin-top: 12px; }
.bd-kpi b { display: block; font-size: 22px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-kpi span { font-size: 12px; color: var(--kui-color-foreground-neutral-tertiary); }
.bd-kpi em { font-style: normal; font-size: 12px; font-weight: 600; margin-left: 4px; }
.bd-kpi em.up { color: ${GREEN}; } .bd-kpi em.down { color: #e5484d; }
.bd-spark { width: 100%; height: 56px; margin-top: 12px; display: block; }
.bd-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; font-size: 13px; }
.bd-list li { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; border-bottom: 1px solid var(--kui-color-border-muted); }
.bd-list li span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-list li span:last-child { flex-shrink: 0; font-variant-numeric: tabular-nums; color: var(--kui-color-foreground-neutral-secondary); }
.bd-tools { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.bd-dash select { all: unset; box-sizing: border-box; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 10px 36px 10px 12px; border-radius: 10px; border: 1px solid var(--kui-color-border-neutral, var(--kui-color-border-muted)); background: var(--kui-color-background-canvas, transparent) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; cursor: pointer; font-size: 14px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-dash select:focus-visible, .bd-dash a.bd-btn:focus-visible, .bd-dash button:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 2px; }
.bd-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 99px; border: 1px solid var(--kui-color-border-muted); color: var(--kui-color-foreground-neutral-emphasis); text-decoration: none; font-weight: 600; font-size: 13px; background: transparent; cursor: pointer; }
.bd-btn:hover { border-color: var(--bd-accent); }
.bd-btn.primary { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); }
.bd-langs { display: grid; gap: 10px; margin-top: 12px; }
.bd-issues { width: 100%; border-collapse: collapse; font-size: 13px; }
.bd-issues th { text-align: left; font-weight: 600; color: var(--kui-color-foreground-neutral-tertiary); padding: 6px 8px; border-bottom: 1px solid var(--kui-color-border-muted); }
.bd-issues td { padding: 8px; border-bottom: 1px solid var(--kui-color-border-muted); vertical-align: top; }
.bd-issues a { color: var(--kui-color-foreground-accent); font-weight: 600; text-decoration: none; }
.bd-pill { display: inline-block; padding: 1px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; background: var(--kui-color-background-surface-secondary, rgba(127,127,127,.15)); margin: 0 4px 4px 0; }
.bd-pill.bad { background: color-mix(in srgb, transparent, #e5484d 18%); color: #e5484d; }
.bd-pill.warn { background: color-mix(in srgb, transparent, #f5a623 22%); color: #b7791f; }
.bd-aiopt { display: grid; gap: 8px; margin-top: 12px; }
.bd-aiopt label { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--kui-color-border-muted); border-radius: 10px; cursor: pointer; }
.bd-aiopt label:has(input:checked) { border-color: var(--bd-accent); background: color-mix(in srgb, transparent, var(--bd-accent) 12%); }
.bd-aiopt label.off { opacity: .55; cursor: not-allowed; }
.bd-aiopt input { accent-color: var(--bd-accent); }
.bd-aiopt small { margin-left: auto; color: var(--kui-color-foreground-neutral-tertiary); }
.bd-404 select { min-width: 220px; padding: 6px 30px 6px 10px; font-size: 13px; }
.bd-setup ol { margin: 8px 0 0; padding-left: 20px; display: grid; gap: 6px; font-size: 13px; }
.bd-setup a { color: var(--kui-color-foreground-accent); }
.bd-setup code { font-size: 12px; padding: 1px 5px; border-radius: 4px; background: var(--kui-color-background-surface-secondary, rgba(127,127,127,.15)); }
[data-bd-dash-host] > :not(.bd-dash) { display: none !important; }
`;

// ---------------------------------------------------------------- calcoli
const lenScore = (x: any) => (x?.label === 'Buono' ? 1 : x?.label === 'Corto' ? 0.6 : 0);
/** controlli SEO di una pagina: [nome, peso, voto 0–1, dettaglio] */
function checks(r: Report): [string, number, number, string][] {
  return [
    ['Meta title', 25, lenScore(r.title), r.title?.text ? `${t(r.title.label)} (${r.title.length})` : t('Mancante')],
    ['Meta description', 25, lenScore(r.description), r.description?.text ? `${t(r.description.label)} (${r.description.length})` : t('Mancante')],
    ['Robots', 15, r.robots?.color === GREEN ? 1 : 0, r.robots?.label ?? ''],
    ['Sitemap', 10, r.sitemap?.included ? 1 : 0, t(r.sitemap?.label ?? '')],
    [t('Dati strutturati'), 15, r.schema?.color === GREEN ? 1 : 0.5, r.schema?.color === GREEN ? t('Presenti') : t('Nessuno')],
    [t('Immagine social'), 10, 1, r.og?.custom ? t('Personalizzata') : t('Automatica')],
  ];
}
const pageScore = (r: Report) => Math.floor(checks(r).reduce((s, [, w, v]) => s + w * v, 0));
/** tipo di contenuto dall'id: "en_posts/slug" → posts, "en_sitiWeb" → fixed */
/** titolo della pagina senza il nome del sito in fondo */
const shortTitle = (p: Page) => String(p.pageTitle || p.label || p.url).replace(/\s*[|–-]\s*bortolin\.dev\s*$/i, '');
const typeOf = (p: Page) => (p.kind === 'fixed' ? 'fixed' : p.itId.split('/')[0]);
const editHref = (id: string, p: Page) => (p.kind === 'fixed' ? `${adminBase()}/singleton/${id}` : `${adminBase()}/collection/${id.split('/')[0]}/item/${encodeURIComponent(id.split('/')[1])}`);

// ---------------------------------------------------------------- pezzi di interfaccia
function ring(score: number) {
  const r = 42, c = 2 * Math.PI * r;
  const color = score >= 90 ? 'var(--bd-accent)' : score >= 50 ? '#f5a623' : '#e5484d';
  return `<svg class="bd-ring" width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="${esc(t('Punteggio SEO {n} su 100', { n: score }))}">
    <circle cx="55" cy="55" r="${r}" fill="none" stroke="color-mix(in srgb, transparent, currentColor 12%)" stroke-width="10"/>
    <circle cx="55" cy="55" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${(c * score) / 100} ${c}" transform="rotate(-90 55 55)"/>
    <text x="55" y="64" text-anchor="middle">${score}</text></svg>`;
}
const bar = (pct: number) => `<span class="bd-bar"><i class="${pct >= 0.9 ? '' : pct >= 0.5 ? 'warn' : 'bad'}" style="width:${Math.round(pct * 100)}%"></i></span>`;
function spark(values: number[]) {
  if (values.length < 2) return '';
  const max = Math.max(...values, 1), w = 300, h = 56;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - 4 - (v / max) * (h - 8)).toFixed(1)}`);
  return `<svg class="bd-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <polyline points="0,${h} ${pts.join(' ')} ${w},${h}" fill="color-mix(in srgb, transparent, var(--bd-accent) 18%)" stroke="none"/>
    <polyline points="${pts.join(' ')}" fill="none" stroke="var(--bd-accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function kpi(label: string, value: number, prev: number | undefined, fmt: (n: number) => string = (n) => nf.format(Math.round(n)), lowerIsBetter = false) {
  let delta = '';
  if (prev && prev > 0) {
    const d = (value - prev) / prev;
    const good = lowerIsBetter ? d < 0 : d > 0;
    if (Math.abs(d) >= 0.005) delta = `<em class="${good ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${pf.format(Math.abs(d))}</em>`;
  }
  return `<div class="bd-kpi"><b>${fmt(value)}${delta}</b><span>${esc(label)}</span></div>`;
}

// istruzioni per l'amministratore: i clienti non configurano Google, vedono solo che i dati non ci sono ancora
const setupGoogle = (s: any) => (window as any).__bdClient ? `<p class="muted">${esc(t('Dati non ancora collegati.'))}</p>` : `<div class="bd-setup">
  <p class="muted">Per vedere qui visite, clic e ricerche degli ultimi 28 giorni:</p>
  <ol>
    <li>In <a class="bd-link" href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud</a> crea un <b>account di servizio</b>, abilita le API <i>Google Analytics Data</i> e <i>Google Search Console</i> e scarica la chiave JSON.</li>
    <li>Mettila nella variabile d’ambiente <code>GOOGLE_SERVICE_ACCOUNT</code> (file <code>.env</code> e Netlify, su una riga) ${s.serviceAccount ? '<b>✓ fatto</b>' : ''}.</li>
    <li>Aggiungi l’e-mail dell’account ${s.email ? `(<code>${esc(s.email)}</code>)` : ''} come <b>Visualizzatore</b> della proprietà GA4 e come <b>utente</b> della proprietà di Search Console.</li>
    <li>In <a class="bd-link" href="${adminBase()}/singleton/google">Google</a> compila “ID proprietà Google Analytics 4” ${s.ga4 ? '<b>✓</b>' : ''} e “Proprietà per la Dashboard” ${s.gsc ? '<b>✓</b>' : ''}.</li>
  </ol></div>`;

const EMPTY = () => `<li><span class="muted">${esc(t('Ancora nessun dato nel periodo'))}</span><span></span></li>`;
const unavailable = (title: string, d: any, wide = false) => `<div class="bd-card${wide ? ' wide' : ''}"><h2>${title}</h2><p class="muted">${esc(t('Dati non disponibili: {e}', { e: d?.error ?? t('errore') }))}</p></div>`;

function gscCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.gsc) return `<div class="bd-card"><h2>Google Search Console</h2>${setupGoogle(setup)}</div>`;
  if (!d || d.error) return unavailable('Google Search Console', d);
  const tot = d.totals, p = d.previous;
  return `<div class="bd-card"><h2>Google Search Console</h2><p class="muted">${esc(t('Ultimi 28 giorni (i dati di Google arrivano con 2–3 giorni di ritardo)'))}</p>
    <div class="bd-kpis">${kpi(t('Clic'), tot.clicks, p.clicks)}${kpi(t('Impressioni'), tot.impressions, p.impressions)}${kpi('CTR', tot.ctr, p.ctr, (n) => pf.format(n))}${kpi(t('Posizione media'), tot.position, p.position, (n) => dec(n), true)}</div>
    <h3>${esc(t('Impressioni al giorno'))}</h3>${spark(d.daily.map((x: any) => x.impressions))}
    <h3>${esc(t('Ricerche principali'))}</h3><ul class="bd-list">${d.queries.map((q: any) => `<li><span>${esc(q.query)}</span><span>${esc(t('{c} clic · {i} impr. · pos. {p}', { c: nf.format(q.clicks), i: nf.format(q.impressions), p: dec(q.position) }))}</span></li>`).join('') || EMPTY()}</ul></div>`;
}

function gaCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.ga4) return `<div class="bd-card"><h2>Google Analytics 4</h2>${setupGoogle(setup)}</div>`;
  if (!d || d.error) return unavailable('Google Analytics 4', d);
  const tot = d.totals, p = d.previous;
  return `<div class="bd-card"><h2>Google Analytics 4</h2><p class="muted">${esc(t('Ultimi 28 giorni, rispetto ai 28 precedenti (solo visitatori che hanno accettato i cookie statistici)'))}</p>
    <div class="bd-kpis">${kpi(t('Utenti'), tot.activeUsers, p.activeUsers)}${kpi(t('Sessioni'), tot.sessions, p.sessions)}${kpi(t('Visualizzazioni'), tot.screenPageViews, p.screenPageViews)}${kpi(t('Eventi chiave'), tot.keyEvents, p.keyEvents)}</div>
    ${d.daily.length ? `<h3>${esc(t('Sessioni al giorno'))}</h3>${spark(d.daily.map((x: any) => x.value))}` : ''}
    <h3>${esc(t('Pagine più viste'))}</h3><ul class="bd-list">${d.pages.map((x: any) => `<li><span>${esc(x.path)}</span><span>${nf.format(x.value)}</span></li>`).join('') || EMPTY()}</ul>
    <h3>${esc(t('Canali'))}</h3><ul class="bd-list">${d.channels.map((x: any) => `<li><span>${esc(x.name)}</span><span>${esc(t('{n} sessioni', { n: nf.format(x.value) }))}</span></li>`).join('') || EMPTY()}</ul></div>`;
}

function adsCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.ga4) return '';
  if (!d || d.error) return unavailable('Google Ads', d, true);
  const tot = d.totals, p = d.previous;
  const money = (n: number) => new Intl.NumberFormat(fmtLocale(), { style: 'currency', currency: d.currency || 'EUR' }).format(n);
  if (!tot.cost && !tot.clicks && !tot.impressions && !p.cost) {
    if ((window as any).__bdClient) return `<div class="bd-card wide"><h2>Google Ads</h2><p class="muted">${esc(t('Nessun dato negli ultimi 28 giorni.'))}</p></div>`;
    return `<div class="bd-card wide"><h2>Google Ads</h2><div class="bd-setup"><p class="muted">Nessun dato negli ultimi 28 giorni. Se hai campagne attive, collega Google Ads alla proprietà GA4:</p>
      <ol><li>In Google Analytics: <b>Amministrazione → Collegamenti a prodotti → Collegamenti a Google Ads</b> → <b>Collega</b>.</li>
      <li>Scegli l’account Google Ads e conferma (lascia attiva la condivisione dei dati).</li>
      <li>I dati compaiono qui entro 24–48 ore.</li></ol></div></div>`;
  }
  const cpc = (x: any) => (x.clicks ? x.cost / x.clicks : 0);
  const cpa = (x: any) => (x.conversions ? x.cost / x.conversions : 0);
  return `<div class="bd-card wide"><h2>Google Ads</h2><p class="muted">${esc(t('Ultimi 28 giorni, rispetto ai 28 precedenti (dati da Google Analytics)'))}</p>
    <div class="bd-kpis">${kpi(t('Spesa'), tot.cost, p.cost, money)}${kpi(t('Clic'), tot.clicks, p.clicks)}${kpi(t('Costo per clic'), cpc(tot), cpc(p), money, true)}${kpi(t('Conversioni'), tot.conversions, p.conversions)}${tot.conversions ? kpi(t('Costo per conversione'), cpa(tot), cpa(p), money, true) : ''}</div>
    <h3>${esc(t('Campagne'))}</h3><ul class="bd-list">${d.campaigns.map((c: any) => `<li><span>${esc(c.name)}</span><span>${money(c.cost)} · ${esc(t('{n} clic', { n: nf.format(c.clicks) }))}</span></li>`).join('') || EMPTY()}</ul></div>`;
}

/** Opportunità SEO: ricerche vicine alla prima pagina, con la pagina del sito e cosa fare */
function oppCard(d: any, pages: [string, Page][]) {
  if (!d || d.error || !d.opportunities) return '';
  const byPath = new Map(pages.map(([id, p]) => [p.url, { id, p }]));
  const rows = d.opportunities.map((o: any) => {
    let path = o.page; try { path = new URL(o.page).pathname; } catch { /* già un percorso */ }
    const hit = byPath.get(path) ?? byPath.get(path.endsWith('/') ? path : `${path}/`);
    const tip = o.position <= 10 ? t('Sei già in prima pagina: un titolo e una descrizione più invitanti portano più clic.') : t('Quasi in prima pagina: rafforza il contenuto su questa ricerca (testo, domande frequenti, link interni).');
    return `<tr><td><b>${esc(o.query)}</b><br><span class="muted">${esc(tip)}</span></td>
      <td>${hit ? `<a href="${editHref(hit.id, hit.p)}">${esc(path)}</a>` : esc(path)}</td>
      <td>${dec(o.position)}</td><td>${nf.format(o.impressions)}</td><td>${nf.format(o.clicks)}</td></tr>`;
  }).join('');
  return `<div class="bd-card wide"><h2>${esc(t('Opportunità SEO'))}</h2><p class="muted">${esc(t('Ricerche in cui il sito è tra la 4ª e la 20ª posizione negli ultimi 28 giorni: con poco lavoro possono portare visite.'))}</p>
    ${rows ? `<table class="bd-issues"><thead><tr><th>${esc(t('Ricerca e cosa fare'))}</th><th>${esc(t('Pagina'))}</th><th>${esc(t('Posizione'))}</th><th>${esc(t('Impressioni'))}</th><th>${esc(t('Clic'))}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="muted" style="margin-top:8px">${esc(t('Nessuna per ora: servono più impressioni su Google. Ricontrolla tra qualche settimana.'))}</p>`}</div>`;
}

/** Pagine non trovate: indirizzi aperti che non esistono, con redirect in un clic */
function notFoundCard(d: any, pages: [string, Page][]) {
  const title = `<h2>${esc(t('Pagine non trovate'))}</h2>`;
  if (!d?.enabled) return `<div class="bd-card">${title}<p class="muted">${esc(t('Gli indirizzi inesistenti aperti dai visitatori sono registrati online: li vedi qui nel pannello online.'))}</p></div>`;
  if (!d.items.length) return `<div class="bd-card">${title}<p class="muted">${esc(t('Nessuna pagina 404 visitata di recente.'))} 👍</p></div>`;
  const options = `<option value="">${esc(t('Scegli la destinazione…'))}</option>` + pages.filter(([, p]) => p.lang === 'it').sort((a, b) => a[1].url.localeCompare(b[1].url)).map(([, p]) => `<option value="${esc(p.url)}">${esc(p.url)} · ${esc(shortTitle(p))}</option>`).join('');
  const df = new Intl.DateTimeFormat(fmtLocale(), { day: 'numeric', month: 'short' });
  return `<div class="bd-card">${title}<p class="muted">${esc(t('Indirizzi inesistenti aperti dai visitatori (link vecchi, errori di battitura, vecchio sito). Un redirect 301 li porta alla pagina giusta e recupera il valore SEO.'))}</p>
    <table class="bd-issues bd-404"><thead><tr><th>${esc(t('Indirizzo'))}</th><th>${esc(t('Visite'))}</th><th>${esc(t('Ultima'))}</th><th>${esc(t('Redirect verso'))}</th><th></th></tr></thead><tbody>
    ${d.items.map((x: any) => `<tr data-path="${esc(x.path)}"><td><b>${esc(x.path)}</b>${Object.keys(x.refs ?? {}).length ? `<br><span class="muted">${esc(t('da {s}', { s: Object.keys(x.refs).join(', ') }))}</span>` : ''}</td>
      <td>${nf.format(x.count)}</td><td>${esc(df.format(new Date(x.last)))}</td>
      <td><select aria-label="${esc(t('Destinazione del redirect'))}">${options}</select></td>
      <td style="white-space:nowrap"><button type="button" class="bd-btn primary" data-act="redirect">${esc(t('Crea redirect'))}</button> <button type="button" class="bd-btn" data-act="ignore">${esc(t('Ignora'))}</button></td></tr>`).join('')}
    </tbody></table></div>`;
}

function bindNotFound(box: HTMLElement) {
  box.querySelectorAll<HTMLTableRowElement>('.bd-404 tr[data-path]').forEach((tr) => {
    const path = tr.dataset.path!;
    const call = async (method: string, body: object) => {
      const r = await fetch('/api/not-found', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const out = await r.json().catch(() => ({}));
      if (!r.ok) { alert(out.error || t('Errore {n}', { n: r.status })); return false; }
      tr.remove();
      return true;
    };
    tr.querySelector('[data-act="redirect"]')!.addEventListener('click', async () => {
      const to = tr.querySelector('select')!.value;
      if (!to) { alert(t('Scegli prima la pagina di destinazione.')); return; }
      if (await call('POST', { path, to })) alert(t('Redirect creato: {from} → {to}. Sarà online dopo “Pubblica sul sito”.', { from: path, to }));
    });
    tr.querySelector('[data-act="ignore"]')!.addEventListener('click', () => call('DELETE', { path }));
  });
}

/** Controllo del sito: risultato dell'ultima build (link rotti, alt, H1, titoli e descrizioni, immagini pesanti) */
function siteCheckCard(r: any) {
  const title = `<h2>${esc(t('Controllo del sito'))}</h2>`;
  if (!r) return `<div class="bd-card">${title}<p class="muted">${esc(t('Il controllo gira a ogni build del sito pubblicato: i risultati compaiono qui nel pannello online.'))}</p></div>`;
  const when = new Intl.DateTimeFormat(fmtLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(r.generated));
  const groups: [string, any[], (x: any) => string][] = [
    [t('Link interni rotti'), r.brokenLinks, (x) => `${esc(x.url)} → ${x.links.map(esc).join(', ')}`],
    [t('Immagini senza testo alternativo'), r.missingAlt, (x) => `${esc(x.url)}: ${x.images.map(esc).join(', ')}`],
    [t('Pagine senza un solo H1'), r.h1, (x) => `${esc(x.url)} (${x.count} H1)`],
    [t('Pagine senza titolo'), r.noTitle.map((url: string) => ({ url })), (x) => esc(x.url)],
    [t('Pagine senza meta description'), r.noDescription.map((url: string) => ({ url })), (x) => esc(x.url)],
    [t('Titoli duplicati'), r.duplicateTitles, (x) => `“${esc(x.text)}”: ${x.urls.map(esc).join(', ')}`],
    [t('Descrizioni duplicate'), r.duplicateDescriptions, (x) => `“${esc(x.text.slice(0, 60))}…”: ${x.urls.map(esc).join(', ')}`],
    [t('Immagini più pesanti di 300 KB'), r.heavyImages, (x) => `${esc(x.file)} (${x.kb} KB)`],
  ];
  const bad = groups.filter(([, list]) => list.length);
  return `<div class="bd-card">${title}<p class="muted">${esc(t('Ultima build: {when} · {n} pagine controllate', { when, n: r.pages }))}</p>
    ${bad.length ? bad.map(([title, list, line]) => `<h3>${esc(title)} (${list.length})</h3><ul class="bd-list">${list.slice(0, 8).map((x) => `<li><span>${line(x)}</span><span></span></li>`).join('')}</ul>`).join('')
      : `<p style="margin-top:8px">${esc(t('Tutto a posto: nessun link rotto, testi alternativi presenti, un H1 per pagina, titoli e descrizioni unici, immagini leggere.'))} ✓</p>`}</div>`;
}

/** Monitor Lighthouse: ultime misure (mobile), andamento della Performance media, "Misura ora" */
function lighthouseCard(d: any) {
  if (!d?.enabled) return `<div class="bd-card wide"><h2>Monitor Lighthouse</h2><p class="muted">${esc(t('Ogni lunedì le pagine principali vengono misurate con PageSpeed Insights (mobile): i risultati li vedi qui nel pannello online.'))}</p></div>`;
  const btn = `<button type="button" class="bd-btn primary" data-act="lh-run">${esc(t('Misura ora'))}</button>`;
  if (!d.runs.length) return `<div class="bd-card wide"><h2>Monitor Lighthouse</h2><p class="muted">${esc(t('Ancora nessuna misura: la prima arriva lunedì, oppure avviala adesso (2–3 minuti).'))}${d.key || (window as any).__bdClient ? '' : ' (manca PAGESPEED_API_KEY su Netlify)'}</p><div class="bd-tools">${btn}</div></div>`;
  const last = d.runs[0];
  const when = new Intl.DateTimeFormat(fmtLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(last.date));
  const avg = (run: any) => { const ok = run.results.filter((r: any) => r.scores); return ok.length ? ok.reduce((t: number, r: any) => t + r.scores.performance, 0) / ok.length : 0; };
  const trend = d.runs.slice().reverse().map(avg);
  const score = (n: number) => `<b style="color:${n >= 90 ? 'var(--kui-color-foreground-accent)' : n >= 50 ? '#b7791f' : '#e5484d'}">${n}</b>`;
  const ms = (n?: number) => (n == null ? '—' : `${dec(n / 1000)} s`);
  return `<div class="bd-card wide"><h2>Monitor Lighthouse</h2><p class="muted">${esc(t('Ultima misura: {when} · mobile · {n} misure in archivio', { when, n: d.runs.length }))}</p>
    ${trend.length > 1 ? `<h3>${esc(t('Performance media nel tempo'))}</h3>${spark(trend)}` : ''}
    <table class="bd-issues"><thead><tr><th>${esc(t('Pagina'))}</th><th>Perf.</th><th>Access.</th><th>Best pr.</th><th>SEO</th><th>LCP</th><th>CLS</th><th>${esc(t('Utenti reali (CrUX)'))}</th></tr></thead><tbody>
    ${last.results.map((r: any) => r.error ? `<tr><td>${esc(r.path)}</td><td colspan="7" class="muted">${esc(r.error)}</td></tr>` : `<tr><td>${esc(r.path)}</td><td>${score(r.scores.performance)}</td><td>${score(r.scores.accessibility)}</td><td>${score(r.scores['best-practices'])}</td><td>${score(r.scores.seo)}</td><td>${ms(r.lab.lcp)}</td><td>${r.lab.cls == null ? '—' : dec(r.lab.cls, 2)}</td><td>${r.field ? `LCP ${ms(r.field.lcp)} · INP ${r.field.inp ?? '—'} ms · CLS ${dec(r.field.cls ?? 0, 2)}` : `<span class="muted">${esc(t('poche visite: dati non ancora disponibili'))}</span>`}</td></tr>`).join('')}
    </tbody></table><div class="bd-tools">${btn}</div></div>`;
}

function bindLighthouse(box: HTMLElement) {
  box.querySelector<HTMLButtonElement>('[data-act="lh-run"]')?.addEventListener('click', async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    b.disabled = true; b.textContent = t('Avvio…');
    const r = await fetch('/api/lighthouse', { method: 'POST' }).catch(() => null);
    b.textContent = r?.ok ? t('Misura avviata: ricarica la Dashboard tra 2–3 minuti') : t('Avvio non riuscito: riprova');
  });
}

// ---------------------------------------------------------------- montaggio
const isDashboard = () => /^\/admin(?:\/branch\/[^/]+)?\/?$/.test(location.pathname);

async function render(box: HTMLElement) {
  box.innerHTML = `<p class="muted">${esc(t('Caricamento della Dashboard…'))}</p>`;
  const get = (u: string) => fetch(u, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [seo, pub, ai] = await Promise.all([get('/api/seo-status'), get('/api/publish'), get('/api/ai')]);
  if (!seo) { box.innerHTML = `<div class="bd-card"><h2>Dashboard</h2><p class="muted">${esc(t('Dati non disponibili: ricarica la pagina o accedi di nuovo.'))}</p></div>`; return; }
  const site: string = seo.site || location.origin;
  const pages = Object.entries(seo.pages as Record<string, Page>);

  // punteggio globale: media dei punteggi delle pagine; per ogni controllo la quota di pagine a posto
  const scores = pages.map(([id, p]) => ({ id, p, score: pageScore(p), checks: checks(p) }));
  const global = Math.floor(scores.reduce((s, x) => s + x.score, 0) / Math.max(1, scores.length));
  const names = checks(pages[0]?.[1] ?? {}).map(([n]) => n);
  const perCheck = names.map((n, i) => ({ n, ok: scores.filter((x) => x.checks[i][2] >= 1).length }));
  const issues = scores.filter((x) => x.score < 100).sort((a, b) => a.score - b.score);

  // contenuti: per tipo (italiano) e completezza delle traduzioni
  const langs = [...new Set(pages.map(([, p]) => p.lang))];
  const count = (lang: string, type?: string) => pages.filter(([, p]) => p.lang === lang && (!type || typeOf(p) === type)).length;
  const types = ['fixed', 'pages', 'posts', 'caseStudies'].filter((t) => count('it', t));

  // pagine per gli strumenti di test, per lingua
  const options = langs.map((l) => `<optgroup label="${esc(LANG_NAMES[l] ?? l)}">${pages.filter(([, p]) => p.lang === l).sort((a, b) => a[1].url.localeCompare(b[1].url)).map(([id, p]) => `<option value="${esc(id)}">${esc(p.url)} · ${esc(shortTitle(p))}</option>`).join('')}</optgroup>`).join('');

  const now = new Date();
  const hello = t(now.getHours() < 13 ? 'Buongiorno' : now.getHours() < 18 ? 'Buon pomeriggio' : 'Buonasera');
  const pubText = !pub?.enabled
    ? t('Modalità locale: le modifiche vanno direttamente nei file del progetto.')
    : pub.files?.length ? t('{n} file modificati da pubblicare: usa “Pubblica sul sito” in basso a destra.', { n: pub.files.length }) : t('Tutto pubblicato: il sito è aggiornato.');

  box.innerHTML = `
  <div class="bd-hello"><strong>${hello}!</strong><span class="muted bd-hello-side">${esc(pubText)} ${deployBadge()}</span></div>
  <div class="row">
    <div class="bd-card"><h2>${esc(t('Salute SEO del sito'))}</h2><p class="muted">${esc(t('{n} pagine in {l} lingue', { n: scores.length, l: langs.length }))}</p>
      <div class="bd-score">${ring(global)}<div class="bd-checks">${perCheck.map((c) => `<div class="bd-check"><span>${esc(c.n)}</span><span class="muted">${c.ok}/${scores.length}</span>${bar(c.ok / scores.length)}</div>`).join('')}</div></div>
    </div>
    <div class="bd-card"><h2>${esc(t('Contenuti e traduzioni'))}</h2>
      <div class="bd-kpis">${types.map((ty) => `<div class="bd-kpi"><b>${count('it', ty)}</b><span>${esc(t(TYPE_NAMES[ty]))}</span></div>`).join('')}</div>
      <h3>${esc(t('Traduzioni'))}</h3><div class="bd-langs">${langs.filter((l) => l !== 'it').map((l) => { const pct = count(l) / Math.max(1, count('it')); return `<div class="bd-check"><span>${esc(LANG_NAMES[l] ?? l)}</span><span class="muted">${count(l)}/${count('it')} · ${pf.format(pct)}</span>${bar(pct)}</div>`; }).join('')}</div>
    </div>
    <div class="bd-card"><h2>${esc(t('Strumenti di test'))}</h2><p class="muted">${esc(t('Scegli una pagina pubblicata e aprila negli strumenti di test.'))}</p>
      <div style="margin-top:12px"><select data-bd-page aria-label="${esc(t('Pagina da analizzare'))}">${options}</select></div>
      <div class="bd-tools" data-bd-tools></div>
    </div>
    <div class="bd-card"><h2>${esc(t('AI del pannello'))}</h2><p class="muted">${esc(t('Per le traduzioni e i pulsanti “Genera con AI”. Si usano solo le AI con la chiave configurata.'))}</p>
      <div class="bd-aiopt" role="radiogroup" aria-label="${esc(t('AI del pannello'))}">${(['claude', 'openai', 'gemini'] as const).map((p) => { const on = ai?.available?.includes(p); return `<label class="${on ? '' : 'off'}"><input type="radio" name="bd-ai-provider" value="${p}" ${on ? '' : 'disabled'}>${esc(ai?.labels?.[p] ?? p)}<small>${esc(t(on ? 'chiave presente' : 'chiave mancante'))}</small></label>`; }).join('')}</div>
    </div>
  </div>
  <div class="row two" data-bd-google>${['Google Search Console', 'Google Analytics 4', 'Google Ads'].map((n, i) => `<div class="bd-card${i === 2 ? ' wide' : ''}"><h2>${n}</h2><p class="muted">${esc(t('Caricamento…'))}</p></div>`).join('')}</div>
  <div data-bd-lh></div>
  <div class="row two"><div data-bd-404></div><div data-bd-check></div></div>
  <div class="bd-card wide"><h2>${esc(t('Pagine da sistemare'))}</h2>
    ${issues.length ? `<p class="muted">${esc(t('{n} pagine sotto 100: le più urgenti per prime.', { n: issues.length }))}</p>
    <table class="bd-issues"><thead><tr><th>${esc(t('Pagina'))}</th><th>${esc(t('Lingua'))}</th><th>${esc(t('Punteggio'))}</th><th>${esc(t('Da sistemare'))}</th></tr></thead><tbody>
    ${issues.slice(0, 15).map((x) => `<tr><td><a href="${editHref(x.id, x.p)}">${esc(shortTitle(x.p))}</a><br><span class="muted">${esc(x.p.url)}</span></td><td>${esc(x.p.lang.toUpperCase())}</td><td>${x.score}</td><td>${x.checks.filter((c) => c[2] < 1).map((c) => `<span class="bd-pill ${c[2] === 0 ? 'bad' : 'warn'}">${esc(c[0])}: ${esc(c[3])}</span>`).join('')}</td></tr>`).join('')}
    </tbody></table>${issues.length > 15 ? `<p class="muted" style="margin-top:8px">${esc(t('… e altre {n}.', { n: issues.length - 15 }))}</p>` : ''}` : `<p class="muted">${esc(t('Nessuna: tutte le pagine hanno 100.'))} 🎉</p>`}
  </div>`;

  // strumenti di test sulla pagina scelta
  const select = box.querySelector<HTMLSelectElement>('[data-bd-page]')!;
  const tools = box.querySelector<HTMLElement>('[data-bd-tools]')!;
  const drawTools = () => {
    const p = (seo.pages as Record<string, Page>)[select.value];
    if (!p) return;
    const u = encodeURIComponent(site + p.url);
    const links: [string, string, boolean?][] = [
      // PageSpeed parte dalla versione mobile (da lì si passa al desktop con un clic)
      ['PageSpeed Insights', `https://pagespeed.web.dev/analysis?url=${u}&form_factor=mobile`, true],
      ['Schema Validator (Google)', `https://search.google.com/test/rich-results?url=${u}`],
      ['Schema Validator (schema.org)', `https://validator.schema.org/#url=${u}`],
      [t('Anteprima Facebook'), `https://developers.facebook.com/tools/debug/?q=${u}`],
      [t('Apri la pagina'), site + p.url],
    ];
    tools.innerHTML = links.map(([l, h, primary]) => `<a class="bd-btn${primary ? ' primary' : ''}" href="${esc(h)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('')
      + `<a class="bd-btn" href="${editHref(select.value, p)}">${esc(t('Modifica'))}</a>`;
  };
  select.addEventListener('change', drawTools);
  drawTools();

  // AI del pannello: la scelta salvata, oppure la prima disponibile
  const avail: string[] = ai?.available ?? [];
  const chosen = avail.includes(getProvider()) ? getProvider() : avail[0];
  box.querySelectorAll<HTMLInputElement>('input[name="bd-ai-provider"]').forEach((r) => {
    r.checked = r.value === chosen;
    r.addEventListener('change', () => setProvider(r.value));
  });

  // Google: dopo, perché può richiedere qualche secondo
  const google = await get('/api/google-data');
  const g = box.querySelector<HTMLElement>('[data-bd-google]');
  if (g) {
    const setup = google?.setup ?? { serviceAccount: false, ga4: false, gsc: false };
    g.innerHTML = !setup.serviceAccount || (!setup.ga4 && !setup.gsc)
      ? `<div class="bd-card wide"><h2>Google Search Console ${esc(t('e'))} Analytics</h2>${setupGoogle(setup)}</div>`
      : gscCard(google?.gsc, setup) + gaCard(google?.ga4, setup) + adsCard(google?.ads, setup) + oppCard(google?.gsc, pages);
  }
  const lh = box.querySelector<HTMLElement>('[data-bd-lh]');
  if (lh) { lh.outerHTML = lighthouseCard(await get('/api/lighthouse')); bindLighthouse(box); }
  const check = box.querySelector<HTMLElement>('[data-bd-check]');
  if (check) check.outerHTML = siteCheckCard(await get('/_bd/site-check.json'));
  const nf404 = box.querySelector<HTMLElement>('[data-bd-404]');
  if (nf404) { nf404.outerHTML = notFoundCard(await get('/api/not-found'), pages); bindNotFound(box); }
}

function sync() {
  const host = document.querySelector<HTMLElement>('#keystatic-main-panel > :nth-child(2)');
  const existing = document.querySelector<HTMLElement>('.bd-dash');
  if (!isDashboard() || !host) {
    existing?.remove();
    document.querySelectorAll('[data-bd-dash-host]').forEach((h) => h.removeAttribute('data-bd-dash-host'));
    return;
  }
  if (existing && existing.parentElement === host) return;
  existing?.remove();
  host.setAttribute('data-bd-dash-host', '');
  const box = document.createElement('div');
  box.className = 'bd-dash';
  host.append(box);
  render(box);
}

const style = document.createElement('style');
style.textContent = CSS;
document.head.append(style);
new MutationObserver(() => sync()).observe(document.body, { childList: true, subtree: true });
sync();
