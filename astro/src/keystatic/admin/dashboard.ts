// DASHBOARD del pannello: al posto dell'elenco di Keystatic ("2 entries"…), strumenti utili.
//   1. Salute SEO: punteggio globale dai controlli dei badge (meta title, description, robots, sitemap, schema)
//   2. Pubblicazione: modifiche in attesa (online) o modalità locale
//   3. Contenuti e traduzioni: quante pagine per tipo e quanto è completa ogni lingua
//   4. Strumenti di test sulla pagina scelta: PageSpeed Insights, Schema Validator (Google e schema.org), Facebook
//   5. Google Search Console, Google Analytics 4 e Google Ads tramite GA4 (ultimi 28 giorni, /api/google-data)
//   6. Pagine da sistemare, con il link per modificarle
// Dati: /api/seo-status, /api/publish, /api/google-data. Colori: variabili di Keystar + --bd-accent (theme.ts).
import { adminBase } from './base';

type Report = any;
type Page = Report & { url: string; pageTitle: string; kind: string; label?: string; lang: string; itId: string };

const GREEN = '#4caf50';
const LANG_NAMES: Record<string, string> = { it: 'Italiano', en: 'English', es: 'Español', de: 'Deutsch' };
const TYPE_NAMES: Record<string, string> = { fixed: 'Pagine a layout fisso', pages: 'Pagine', posts: 'Post', caseStudies: 'Casi studio' };
const nf = new Intl.NumberFormat('it-IT');
const pf = new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 1 });
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
.bd-hello { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px; }
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
    ['Meta title', 25, lenScore(r.title), r.title?.text ? `${r.title.label} (${r.title.length})` : 'Mancante'],
    ['Meta description', 25, lenScore(r.description), r.description?.text ? `${r.description.label} (${r.description.length})` : 'Mancante'],
    ['Robots', 15, r.robots?.color === GREEN ? 1 : 0, r.robots?.label ?? ''],
    ['Sitemap', 10, r.sitemap?.included ? 1 : 0, r.sitemap?.label ?? ''],
    ['Dati strutturati', 15, r.schema?.color === GREEN ? 1 : 0.5, r.schema?.color === GREEN ? 'Presenti' : 'Nessuno'],
    ['Immagine social', 10, 1, r.og?.custom ? 'Personalizzata' : 'Automatica'],
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
  return `<svg class="bd-ring" width="110" height="110" viewBox="0 0 110 110" role="img" aria-label="Punteggio SEO ${score} su 100">
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

const setupGoogle = (s: any) => `<div class="bd-setup">
  <p class="muted">Per vedere qui visite, clic e ricerche degli ultimi 28 giorni:</p>
  <ol>
    <li>In <a class="bd-link" href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud</a> crea un <b>account di servizio</b>, abilita le API <i>Google Analytics Data</i> e <i>Google Search Console</i> e scarica la chiave JSON.</li>
    <li>Mettila nella variabile d’ambiente <code>GOOGLE_SERVICE_ACCOUNT</code> (file <code>.env</code> e Netlify, su una riga) ${s.serviceAccount ? '<b>✓ fatto</b>' : ''}.</li>
    <li>Aggiungi l’e-mail dell’account ${s.email ? `(<code>${esc(s.email)}</code>)` : ''} come <b>Visualizzatore</b> della proprietà GA4 e come <b>utente</b> della proprietà di Search Console.</li>
    <li>In <a class="bd-link" href="${adminBase()}/singleton/google">Google</a> compila “ID proprietà Google Analytics 4” ${s.ga4 ? '<b>✓</b>' : ''} e “Proprietà per la Dashboard” ${s.gsc ? '<b>✓</b>' : ''}.</li>
  </ol></div>`;

const EMPTY = '<li><span class="muted">Ancora nessun dato nel periodo</span><span></span></li>';

function gscCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.gsc) return `<div class="bd-card"><h2>Google Search Console</h2>${setupGoogle(setup)}</div>`;
  if (!d || d.error) return `<div class="bd-card"><h2>Google Search Console</h2><p class="muted">Dati non disponibili: ${esc(d?.error ?? 'errore')}</p></div>`;
  const t = d.totals, p = d.previous;
  return `<div class="bd-card"><h2>Google Search Console</h2><p class="muted">Ultimi 28 giorni (i dati di Google arrivano con 2–3 giorni di ritardo)</p>
    <div class="bd-kpis">${kpi('Clic', t.clicks, p.clicks)}${kpi('Impressioni', t.impressions, p.impressions)}${kpi('CTR', t.ctr, p.ctr, (n) => pf.format(n))}${kpi('Posizione media', t.position, p.position, (n) => n.toFixed(1).replace('.', ','), true)}</div>
    <h3>Impressioni al giorno</h3>${spark(d.daily.map((x: any) => x.impressions))}
    <h3>Ricerche principali</h3><ul class="bd-list">${d.queries.map((q: any) => `<li><span>${esc(q.query)}</span><span>${nf.format(q.clicks)} clic · ${nf.format(q.impressions)} impr. · pos. ${q.position.toFixed(1).replace('.', ',')}</span></li>`).join('') || EMPTY}</ul></div>`;
}

function gaCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.ga4) return `<div class="bd-card"><h2>Google Analytics 4</h2>${setupGoogle(setup)}</div>`;
  if (!d || d.error) return `<div class="bd-card"><h2>Google Analytics 4</h2><p class="muted">Dati non disponibili: ${esc(d?.error ?? 'errore')}</p></div>`;
  const t = d.totals, p = d.previous;
  return `<div class="bd-card"><h2>Google Analytics 4</h2><p class="muted">Ultimi 28 giorni, rispetto ai 28 precedenti (solo visitatori che hanno accettato i cookie statistici)</p>
    <div class="bd-kpis">${kpi('Utenti', t.activeUsers, p.activeUsers)}${kpi('Sessioni', t.sessions, p.sessions)}${kpi('Visualizzazioni', t.screenPageViews, p.screenPageViews)}${kpi('Eventi chiave', t.keyEvents, p.keyEvents)}</div>
    ${d.daily.length ? `<h3>Sessioni al giorno</h3>${spark(d.daily.map((x: any) => x.value))}` : ''}
    <h3>Pagine più viste</h3><ul class="bd-list">${d.pages.map((x: any) => `<li><span>${esc(x.path)}</span><span>${nf.format(x.value)}</span></li>`).join('') || EMPTY}</ul>
    <h3>Canali</h3><ul class="bd-list">${d.channels.map((x: any) => `<li><span>${esc(x.name)}</span><span>${nf.format(x.value)} sessioni</span></li>`).join('') || EMPTY}</ul></div>`;
}

function adsCard(d: any, setup: any) {
  if (!setup.serviceAccount || !setup.ga4) return '';
  if (!d || d.error) return `<div class="bd-card"><h2>Google Ads</h2><p class="muted">Dati non disponibili: ${esc(d?.error ?? 'errore')}</p></div>`;
  const t = d.totals, p = d.previous;
  const money = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: d.currency || 'EUR' }).format(n);
  if (!t.cost && !t.clicks && !t.impressions && !p.cost) {
    return `<div class="bd-card"><h2>Google Ads</h2><div class="bd-setup"><p class="muted">Nessun dato negli ultimi 28 giorni. Se hai campagne attive, collega Google Ads alla proprietà GA4:</p>
      <ol><li>In Google Analytics: <b>Amministrazione → Collegamenti a prodotti → Collegamenti a Google Ads</b> → <b>Collega</b>.</li>
      <li>Scegli l’account Google Ads e conferma (lascia attiva la condivisione dei dati).</li>
      <li>I dati compaiono qui entro 24–48 ore.</li></ol></div></div>`;
  }
  const cpc = (x: any) => (x.clicks ? x.cost / x.clicks : 0);
  const cpa = (x: any) => (x.conversions ? x.cost / x.conversions : 0);
  return `<div class="bd-card"><h2>Google Ads</h2><p class="muted">Ultimi 28 giorni, rispetto ai 28 precedenti (dati da Google Analytics)</p>
    <div class="bd-kpis">${kpi('Spesa', t.cost, p.cost, money)}${kpi('Clic', t.clicks, p.clicks)}${kpi('Costo per clic', cpc(t), cpc(p), money, true)}${kpi('Conversioni', t.conversions, p.conversions)}${t.conversions ? kpi('Costo per conversione', cpa(t), cpa(p), money, true) : ''}</div>
    <h3>Campagne</h3><ul class="bd-list">${d.campaigns.map((c: any) => `<li><span>${esc(c.name)}</span><span>${money(c.cost)} · ${nf.format(c.clicks)} clic</span></li>`).join('') || EMPTY}</ul></div>`;
}

// ---------------------------------------------------------------- montaggio
const isDashboard = () => /^\/admin(?:\/branch\/[^/]+)?\/?$/.test(location.pathname);

async function render(box: HTMLElement) {
  box.innerHTML = '<p class="muted">Caricamento della Dashboard…</p>';
  const get = (u: string) => fetch(u, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [seo, pub] = await Promise.all([get('/api/seo-status'), get('/api/publish')]);
  if (!seo) { box.innerHTML = '<div class="bd-card"><h2>Dashboard</h2><p class="muted">Dati non disponibili: ricarica la pagina (se sei online, accedi di nuovo con GitHub).</p></div>'; return; }
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
  const hello = now.getHours() < 13 ? 'Buongiorno' : now.getHours() < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const pubText = !pub?.enabled
    ? 'Modalità locale: le modifiche vanno direttamente nei file del progetto.'
    : pub.files?.length ? `${pub.files.length} file modificati da pubblicare: usa “Pubblica sul sito” in basso a destra.` : 'Tutto pubblicato: il sito è aggiornato.';

  box.innerHTML = `
  <div class="bd-hello"><strong>${hello}!</strong><span class="muted">${esc(pubText)}</span></div>
  <div class="row">
    <div class="bd-card"><h2>Salute SEO del sito</h2><p class="muted">${scores.length} pagine in ${langs.length} lingue</p>
      <div class="bd-score">${ring(global)}<div class="bd-checks">${perCheck.map((c) => `<div class="bd-check"><span>${esc(c.n)}</span><span class="muted">${c.ok}/${scores.length}</span>${bar(c.ok / scores.length)}</div>`).join('')}</div></div>
    </div>
    <div class="bd-card"><h2>Contenuti e traduzioni</h2>
      <div class="bd-kpis">${types.map((t) => `<div class="bd-kpi"><b>${count('it', t)}</b><span>${esc(TYPE_NAMES[t])}</span></div>`).join('')}</div>
      <h3>Traduzioni</h3><div class="bd-langs">${langs.filter((l) => l !== 'it').map((l) => { const pct = count(l) / Math.max(1, count('it')); return `<div class="bd-check"><span>${esc(LANG_NAMES[l] ?? l)}</span><span class="muted">${count(l)}/${count('it')} · ${pf.format(pct)}</span>${bar(pct)}</div>`; }).join('')}</div>
    </div>
    <div class="bd-card"><h2>Strumenti di test</h2><p class="muted">Scegli una pagina pubblicata e aprila negli strumenti di test.</p>
      <div style="margin-top:12px"><select data-bd-page aria-label="Pagina da analizzare">${options}</select></div>
      <div class="bd-tools" data-bd-tools></div>
    </div>
  </div>
  <div class="row" data-bd-google><div class="bd-card"><h2>Google Search Console</h2><p class="muted">Caricamento…</p></div><div class="bd-card"><h2>Google Analytics 4</h2><p class="muted">Caricamento…</p></div><div class="bd-card"><h2>Google Ads</h2><p class="muted">Caricamento…</p></div></div>
  <div class="bd-card wide"><h2>Pagine da sistemare</h2>
    ${issues.length ? `<p class="muted">${issues.length} pagine sotto 100: le più urgenti per prime.</p>
    <table class="bd-issues"><thead><tr><th>Pagina</th><th>Lingua</th><th>Punteggio</th><th>Da sistemare</th></tr></thead><tbody>
    ${issues.slice(0, 15).map((x) => `<tr><td><a href="${editHref(x.id, x.p)}">${esc(shortTitle(x.p))}</a><br><span class="muted">${esc(x.p.url)}</span></td><td>${esc(x.p.lang.toUpperCase())}</td><td>${x.score}</td><td>${x.checks.filter((c) => c[2] < 1).map((c) => `<span class="bd-pill ${c[2] === 0 ? 'bad' : 'warn'}">${esc(c[0])}: ${esc(c[3])}</span>`).join('')}</td></tr>`).join('')}
    </tbody></table>${issues.length > 15 ? `<p class="muted" style="margin-top:8px">… e altre ${issues.length - 15}.</p>` : ''}` : '<p class="muted">Nessuna: tutte le pagine hanno 100. 🎉</p>'}
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
      ['Anteprima Facebook', `https://developers.facebook.com/tools/debug/?q=${u}`],
      ['Apri la pagina', site + p.url],
    ];
    tools.innerHTML = links.map(([l, h, primary]) => `<a class="bd-btn${primary ? ' primary' : ''}" href="${esc(h)}" target="_blank" rel="noopener">${esc(l)} ↗</a>`).join('')
      + `<a class="bd-btn" href="${editHref(select.value, p)}">Modifica</a>`;
  };
  select.addEventListener('change', drawTools);
  drawTools();

  // Google: dopo, perché può richiedere qualche secondo
  const google = await get('/api/google-data');
  const g = box.querySelector<HTMLElement>('[data-bd-google]');
  if (g) {
    const setup = google?.setup ?? { serviceAccount: false, ga4: false, gsc: false };
    g.innerHTML = !setup.serviceAccount || (!setup.ga4 && !setup.gsc)
      ? `<div class="bd-card wide"><h2>Google Search Console e Analytics</h2>${setupGoogle(setup)}</div>`
      : gscCard(google?.gsc, setup) + gaCard(google?.ga4, setup) + adsCard(google?.ads, setup);
  }
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
