// Badge SEO sotto il nome di ogni pagina nella sidebar e nella dashboard di Keystatic, come la colonna "SEO" di AM Tools 3:
// MT (Meta Title) · MD (Meta Description) · R (Robots) · OG (OG Image) · SM (Schema Markup) · XML (sitemap).
// Al passaggio del mouse compare il tooltip con tutti i dettagli. I dati arrivano da /api/seo-status e si aggiornano da soli.
import type { SeoReport } from '../../lib/seo';
import { adminBase } from './base';

const COLORS = { red: '#f44336', green: '#4caf50', gray: '#777777' };
type Entry = SeoReport & { url: string; href: string; pageTitle: string; kind?: string; label?: string; lang?: string; itId?: string };
let pages: Record<string, Entry> = {};

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const CSS = `
.bd-fixed { margin: 20px 0 22px; font-family: var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); }
.bd-group-title { margin: 0 0 8px; font: 600 12px/1.3 var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); letter-spacing: .04em; text-transform: uppercase; color: var(--kui-color-foreground-neutral-secondary); }
.bd-fixed-list { border: 1px solid var(--kui-color-border-muted); border-radius: var(--kui-size-radius-medium, 6px); overflow: hidden; }
.bd-fixed-item { display: block; padding: 8px 16px; color: var(--kui-color-foreground-neutral); text-decoration: none; cursor: pointer; }
.bd-fixed-item + .bd-fixed-item { border-top: 1px solid var(--kui-color-border-muted); }
.bd-fixed-item:hover, .bd-fixed-item:focus-visible { background: var(--kui-color-background-surface-secondary); outline: none; }
.bd-fixed-item[hidden] { display: none; }
.bd-other-title { margin-top: 0; }
.bd-seo-host { flex-wrap: wrap !important; height: auto !important; row-gap: 5px; padding-block: 8px !important; }
.bd-seo { flex-basis: 100%; display: flex; width: fit-content; gap: 3px; margin-top: 2px; cursor: help; position: relative; z-index: 3; pointer-events: auto; }
.bd-seo b { display: inline-grid; place-items: center; min-width: 22px; height: 13px; padding: 0 3px; border-radius: 3px;
  font: 300 9px/1 system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: .03em; color: #fff; }
.bd-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: 16px; width: 100%; min-width: 0; line-height: 1.2; font-family: var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); font-size: 14px; }
.bd-row-title { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-row-meta { display: flex; align-items: center; gap: 8px; min-width: 0; }
.bd-row-meta a { font-size: 11.5px; opacity: .75; color: inherit; text-decoration: underline; text-underline-offset: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-row-meta a:hover { opacity: 1; }
.bd-row-text { display: grid; gap: 4px; min-width: 0; }
.bd-row .bd-row-side > .bd-seo { margin-top: 0; flex-basis: auto; justify-content: flex-end; flex-wrap: nowrap; }
.bd-row-host { width: 100%; }
.bd-row-host > :not(.bd-row) { display: none !important; }
.bd-swap-host > :not(.bd-swap) { display: none !important; }
.bd-swap-host { display: flex; align-items: center; }
.bd-swap { font: 400 14px/1.3 var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); color: var(--kui-color-foreground-neutral); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bd-swap.main { font-weight: 600; }
.bd-swap.head { color: var(--kui-color-foreground-neutral-secondary); }
.bd-tip { position: fixed; z-index: 99999; width: 320px; padding: 12px 14px; border-radius: 8px; background: #fff; color: #1d2327;
  box-shadow: 0 8px 28px rgba(0,0,0,.28); font: 12px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; pointer-events: none; }
.bd-tip p { margin: 0 0 8px; } .bd-tip p:last-child, .bd-tip ul { margin-bottom: 0; }
.bd-tip .t { color: #50575e; word-break: break-word; }
.bd-row-side { display: grid; gap: 5px; justify-items: end; }
.bd-trs { display: flex; gap: 4px; }
.bd-tr { display: inline-grid; place-items: center; min-width: 24px; height: 15px; padding: 0 6px; box-sizing: border-box; border-radius: 999px; border: 1px solid; font: 500 9px/1 system-ui, -apple-system, "Segoe UI", sans-serif; letter-spacing: .06em; text-decoration: none; cursor: default; }
.bd-tr.ok { border-color: var(--bd-accent, #4caf50); background: color-mix(in srgb, var(--bd-accent, #4caf50) 18%, transparent); color: var(--kui-color-foreground-neutral-emphasis); cursor: pointer; }
.bd-tr.ok:hover { background: var(--bd-accent, #4caf50); color: var(--bd-on-accent, #000); }
.bd-tr.no { border-style: dashed; border-color: var(--kui-color-foreground-neutral-tertiary, #777); color: var(--kui-color-foreground-neutral-tertiary, #777); }
.bd-fixed-item.bd-missing .bd-row-title { opacity: .6; }
.bd-fixed-ai { all: unset; cursor: pointer; padding: 4px 10px; border-radius: 999px; background: var(--bd-accent); color: var(--bd-on-accent); font: 600 12px/1.3 var(--kui-typography-font-family-base, system-ui, sans-serif); white-space: nowrap; }
.bd-tip ul { margin: 2px 0 0; padding-left: 16px; }
`;

function badges(r: SeoReport) {
  const b = (label: string, color: string) => `<b style="background:${color}">${label}</b>`;
  return b('MT', r.title.color) + b('MD', r.description.color) + b('R', r.robots.color) + b('OG', r.og.color) + b('SM', r.schema.color) + b('XML', r.sitemap.color);
}

function tooltip(r: SeoReport) {
  const line = (name: string, x: SeoReport['title']) =>
    `<p><strong>${name}</strong> <span style="color:${x.color}">- ${x.length} caratteri - ${esc(x.label)}</span><br><span class="t">${esc(x.text) || '—'}</span></p>`;
  const md = !r.markdown.enabled
    ? `<span style="color:${COLORS.gray}">Disattivato</span>`
    : r.markdown.custom
      ? `<span style="color:${COLORS.green}">Personalizzato</span>`
      : `<span style="color:${COLORS.red}">Predefinito</span>`;
  const auto = (r.schema.auto ?? []).map((t) => `<li style="color:${COLORS.green}">${esc(t)} (automatico)</li>`).join('');
  const types = auto + r.schema.types
    .map((t) => `<li style="color:${t.enabled ? COLORS.green : COLORS.gray}">${t.label} ${t.enabled ? 'attivo' : 'non attivo'}</li>`)
    .join('');
  const custom = r.schema.custom
    ? `<li style="color:${COLORS.green}">Markup personalizzato attivo</li>`
    : `<li style="color:${COLORS.gray}">Nessun markup personalizzato</li>`;
  return [
    line('Meta Title', r.title),
    line('Meta Description', r.description),
    `<p><strong>Robots:</strong> <span style="color:${r.robots.color}">${esc(r.robots.label)}</span></p>`,
    `<p><strong>OG Image:</strong> <span style="color:${COLORS.green}">${r.og.custom ? 'Personalizzata' : 'Automatica (generata dalla pagina)'}</span></p>`,
    `<p><strong>Sitemap XML:</strong> <span style="color:${r.sitemap.color}">${esc(r.sitemap.label)}</span></p>`,
    `<p><strong>Markdown (llms.txt):</strong> ${md}</p>`,
    `<p><strong>Schema Markup:</strong></p><ul>${types}${custom}</ul>`,
  ].join('');
}

// ---------------------------------------------------------------- tooltip
let tip: HTMLDivElement | null = null;
function showTip(el: HTMLElement) {
  const r = pages[el.dataset.key ?? ''];
  if (!r) return;
  tip ??= Object.assign(document.createElement('div'), { className: 'bd-tip', role: 'tooltip' });
  tip.innerHTML = tooltip(r);
  document.body.appendChild(tip);
  const box = el.getBoundingClientRect();
  const h = tip.offsetHeight;
  tip.style.left = `${Math.min(box.left, innerWidth - 336)}px`;
  tip.style.top = `${box.bottom + 8 + h > innerHeight ? Math.max(8, box.top - h - 8) : box.bottom + 8}px`;
}
const hideTip = () => tip?.remove();

// ---------------------------------------------------------------- badge
const badgeRow = (key: string, r: Entry) => {
  const row = document.createElement('span');
  row.className = 'bd-seo';
  row.dataset.key = key;
  row.innerHTML = badges(r);
  row.setAttribute('aria-label', `SEO: Meta Title ${r.title.label}, Meta Description ${r.description.label}, Robots ${r.robots.label}`);
  // tooltip solo passando sopra i riquadri SEO
  row.addEventListener('mouseenter', () => showTip(row));
  row.addEventListener('mouseleave', hideTip);
  return row;
};

/**
 * Traduzioni (solo voci italiane): un riquadro per lingua accanto ai badge SEO, verde se la pagina è tradotta
 * (clic → la traduzione), grigio se non lo è ancora. Dati da admin/i18n.ts (window.bdI18n).
 */
function trPills(itId: string) {
  const st = (window as any).bdI18n?.status;
  if (!st) return null;
  const box = document.createElement('span');
  box.className = 'bd-trs';
  for (const l of st.langs as string[]) {
    const [col, slug] = itId.includes('/') ? itId.split('/') : [null, itId];
    const tr = st.translations[l];
    const target = col ? tr.collections[col]?.[slug] : tr.singletons[slug] ? slug : undefined;
    const pill = document.createElement(target ? 'a' : 'span');
    pill.className = `bd-tr ${target ? 'ok' : 'no'}`;
    pill.textContent = l.toUpperCase();
    pill.title = target ? `Tradotta (${l.toUpperCase()}): apri la traduzione` : `Non ancora tradotta (${l.toUpperCase()})`;
    if (target) {
      const href = col ? `${adminBase()}/collection/${l}_${col}/item/${encodeURIComponent(target)}` : `${adminBase()}/singleton/${l}_${slug}`;
      (pill as HTMLAnchorElement).href = href;
      ['pointerdown', 'mousedown', 'keydown'].forEach((ev) => pill.addEventListener(ev, (e) => e.stopPropagation()));
      pill.addEventListener('click', (e) => { e.stopPropagation(); if (e.metaKey || e.ctrlKey) return; e.preventDefault(); goTo(href); });
    }
    box.append(pill);
  }
  return box;
}

/** colonna destra degli elenchi: riquadri SEO e, sotto, le traduzioni (staccate: il passaggio del mouse non apre la SEO) */
function side(seo: HTMLElement, pills: HTMLElement | null) {
  const col = document.createElement('span');
  col.className = 'bd-row-side';
  col.append(seo);
  if (pills) col.append(pills);
  return col;
}

/** Sidebar e dashboard: pagine a layout fisso (Home…) */
function applySingletons() {
  for (const [key, r] of Object.entries(pages)) {
    if (key.includes('/')) continue;
    const sig = JSON.stringify(r);
    document.querySelectorAll<HTMLAnchorElement>(`a[href$="/singleton/${key}"]`).forEach((a) => {
      if (a.closest('.bd-fixed, .bd-dash')) return; // "Pagine a layout fisso" ha già i suoi badge; la Dashboard non ne vuole
      // sidebar: <a><div>Nome</div></a> → badge dentro il <div>, sotto il nome
      // dashboard: <span class="ellipsis"><a>Nome</a></span> → badge subito dopo il testo (che altrimenti li taglierebbe)
      const inner = a.firstElementChild instanceof HTMLDivElement ? a.firstElementChild : null;
      const host = inner ?? a.parentElement?.parentElement ?? a;
      const old = inner ? inner.querySelector<HTMLSpanElement>(':scope > .bd-seo') : host.nextElementSibling?.classList.contains('bd-seo') ? (host.nextElementSibling as HTMLSpanElement) : null;
      if (old?.dataset.sig === sig) return;
      const row = badgeRow(key, r);
      row.dataset.sig = sig;
      if (old) old.replaceWith(row);
      else if (inner) { inner.classList.add('bd-seo-host'); inner.appendChild(row); }
      else host.after(row);
    });
  }
}

/** Elenchi di Pagine e Post: titolo, sotto l'indirizzo cliccabile (nuova scheda) e i badge SEO */
function applyCollections() {
  const m = location.pathname.match(/\/collection\/([^/]+)\/?$/);
  if (!m) return;
  const kind = decodeURIComponent(m[1]);
  document.querySelectorAll<HTMLElement>('[role="row"][data-key^="key:"]').forEach((rowEl) => {
    const slug = rowEl.dataset.key!.slice(4);
    const r = pages[`${kind}/${slug}`];
    const cell = rowEl.querySelector<HTMLElement>('[role="rowheader"], [role="gridcell"]');
    if (!r || !cell) return;
    const sig = JSON.stringify(r) + JSON.stringify((window as any).bdI18n?.status?.translations ?? null);
    const old = cell.querySelector<HTMLElement>(':scope > .bd-row');
    if (old?.dataset.sig === sig) return;
    const box = document.createElement('span');
    box.className = 'bd-row';
    box.dataset.sig = sig;
    const title = document.createElement('span');
    title.className = 'bd-row-title';
    title.textContent = r.pageTitle;
    const meta = document.createElement('span');
    meta.className = 'bd-row-meta';
    const link = document.createElement('a');
    link.href = r.href;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = `${r.url} ↗`;
    // il clic sul link apre la pagina e non deve aprire anche la voce nel pannello
    ['pointerdown', 'mousedown', 'click', 'keydown'].forEach((ev) => link.addEventListener(ev, (e) => e.stopPropagation()));
    meta.append(link);
    // a sinistra titolo e indirizzo, a destra i riquadri SEO
    const text = document.createElement('span');
    text.className = 'bd-row-text';
    text.append(title, meta);
    box.append(text, side(badgeRow(`${kind}/${slug}`, r), r.lang === 'it' && r.itId ? trPills(r.itId) : null));
    cell.classList.add('bd-row-host');
    if (old) old.replaceWith(box); else cell.appendChild(box);
  });
}

/**
 * Elenco "Pagine": sopra la tabella di Keystatic il gruppo "Pagine a layout fisso" (Home, Servizi…, che non sono nella sidebar),
 * poi il titolo "Altre pagine". La tabella di Keystatic è virtualizzata: i nostri riquadri stanno fuori, con lo stesso aspetto.
 */
const FIXED_TITLE = 'Pagine a layout fisso';
const OTHER_TITLE = 'Altre pagine';
const goTo = (href: string) => { history.pushState(null, '', href); dispatchEvent(new PopStateEvent('popstate')); };

function applyFixedList() {
  const m = location.pathname.match(/\/collection\/(?:([a-z]{2})_)?pages\/?$/);
  const grid = document.querySelector<HTMLElement>('main [role="grid"]');
  const old = document.querySelector<HTMLElement>('.bd-fixed');
  if (!m || !grid) { old?.remove(); return; }
  const lang = m[1] ?? 'it';
  const st = (window as any).bdI18n?.status;
  // italiano: le pagine fisse; traduzioni: tutte le pagine fisse, quelle non ancora tradotte con il pulsante "Traduci con AI"
  const fixed: [string, Entry | null, string][] = lang === 'it'
    ? Object.entries(pages).filter(([, r]) => r.kind === 'fixed' && (r.lang ?? 'it') === 'it').map(([k, r]) => [k, r, k])
    : (st?.fixed ?? []).map((f: { key: string; label: string }) => [`${lang}_${f.key}`, pages[`${lang}_${f.key}`] ?? null, f.key]);
  const sig = JSON.stringify(fixed) + JSON.stringify(st?.translations ?? null);
  if (old && old.dataset.sig === sig && old.nextElementSibling?.classList.contains('bd-other-title')) { filterFixed(); fitGrid(grid); return; }
  old?.remove();
  document.querySelector('.bd-other-title')?.remove();
  const box = document.createElement('section');
  box.className = 'bd-fixed';
  box.dataset.sig = sig;
  box.innerHTML = `<h2 class="bd-group-title">${FIXED_TITLE}</h2><div class="bd-fixed-list"></div>`;
  const list = box.querySelector('div')!;
  for (const [key, r, itKey] of fixed) {
    if (!r) {
      // pagina fissa non ancora tradotta
      const label = st.fixed.find((f: { key: string }) => f.key === itKey)?.label ?? itKey;
      const item = document.createElement('div');
      item.className = 'bd-fixed-item bd-missing';
      item.dataset.search = label.toLowerCase();
      item.innerHTML = `<span class="bd-row"><span class="bd-row-text"><span class="bd-row-title"></span><span class="bd-row-meta">Non ancora tradotta</span></span><button type="button" class="bd-fixed-ai">Traduci con AI</button></span>`;
      item.querySelector('.bd-row-title')!.textContent = label;
      item.querySelector('button')!.addEventListener('click', () => (window as any).bdI18n?.translate({ lang, key: itKey }, label));
      list.append(item);
      continue;
    }
    const item = document.createElement('a');
    item.className = 'bd-fixed-item';
    item.href = `${adminBase()}/singleton/${key}`;
    item.dataset.search = `${r.label ?? ''} ${r.pageTitle} ${r.url}`.toLowerCase();
    item.addEventListener('click', (e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); goTo(item.href); });
    const row = document.createElement('span');
    row.className = 'bd-row';
    const text = document.createElement('span');
    text.className = 'bd-row-text';
    const title = document.createElement('span');
    title.className = 'bd-row-title';
    title.textContent = r.label ?? r.pageTitle;
    const meta = document.createElement('span');
    meta.className = 'bd-row-meta';
    const link = document.createElement('a');
    link.href = r.href; link.target = '_blank'; link.rel = 'noopener';
    link.textContent = `${r.url} ↗`;
    ['pointerdown', 'mousedown', 'click', 'keydown'].forEach((ev) => link.addEventListener(ev, (e) => e.stopPropagation()));
    meta.append(link);
    text.append(title, meta);
    row.append(text, side(badgeRow(key, r), lang === 'it' ? trPills(itKey) : null));
    item.append(row);
    list.append(item);
  }
  const other = document.createElement('h2');
  other.className = 'bd-group-title bd-other-title';
  other.textContent = OTHER_TITLE;
  grid.before(box, other);
  // stessi margini laterali della tabella di Keystatic
  const g = grid.getBoundingClientRect(), parent = grid.parentElement!.getBoundingClientRect();
  for (const el of [box, other]) { el.style.marginLeft = `${Math.round(g.left - parent.left)}px`; el.style.marginRight = `${Math.round(parent.right - g.right)}px`; }
  filterFixed();
  fitGrid(grid);
}

/** la ricerca dell'elenco filtra anche le pagine a layout fisso */
function filterFixed() {
  const input = document.querySelector<HTMLInputElement>('main input[type="search"]');
  const q = (input?.value ?? '').trim().toLowerCase();
  document.querySelectorAll<HTMLElement>('.bd-fixed-item').forEach((it) => (it.hidden = !!q && !it.dataset.search!.includes(q)));
  const box = document.querySelector<HTMLElement>('.bd-fixed');
  if (box) box.hidden = !!q && !box.querySelector('.bd-fixed-item:not([hidden])');
  if (input && !input.dataset.bdFixed) { input.dataset.bdFixed = ''; input.addEventListener('input', filterFixed); }
}

/**
 * "Altre pagine" è una tabella fissa, non un riquadro con lo scorrimento: la tabella di Keystatic prende l'altezza
 * di tutte le sue righe e scorre l'intera pagina (insieme al gruppo "Pagine a layout fisso").
 */
function fitGrid(grid: HTMLElement) {
  const main = grid.closest('main') as HTMLElement | null;
  const body = [...grid.querySelectorAll<HTMLElement>('[role="rowgroup"]')].find((el) => /(auto|scroll)/.test(getComputedStyle(el).overflowY) || el.scrollHeight > el.clientHeight);
  if (!main || !body) return;
  main.style.overflowY = 'auto';
  body.style.overflowY = 'hidden';
  const inner = body.firstElementChild as HTMLElement | null;
  const content = Math.max(parseFloat(inner?.style.height ?? '') || 0, body.scrollHeight);
  const chrome = grid.getBoundingClientRect().height - body.getBoundingClientRect().height; // intestazione + bordi
  const h = Math.ceil(chrome + content);
  if (grid.style.height !== `${h}px`) { grid.style.flex = 'none'; grid.style.height = `${h}px`; }
}

/** aprendo una pagina a layout fisso, nella sidebar resta evidenziato "Pagine" (della stessa lingua) */
function markPagesNav() {
  const m = location.pathname.match(/\/singleton\/([^/]+)/);
  const key = m ? decodeURIComponent(m[1]) : '';
  const lm = key.match(/^([a-z]{2})_/);
  const fixedKey = lm ? key.slice(3) : key;
  const st = (window as any).bdI18n?.status;
  const isFixed = !!m && (pages[key]?.kind === 'fixed' || !!st?.fixed.some((f: { key: string }) => f.key === fixedKey));
  const listKey = lm ? `${lm[1]}_pages` : 'pages';
  document.querySelectorAll<HTMLAnchorElement>('nav a[href$="/collection/pages"], nav a[href$="_pages"]').forEach((link) => {
    const mine = isFixed && link.getAttribute('href')!.endsWith(`/collection/${listKey}`);
    if (mine && link.getAttribute('aria-current') !== 'page') { link.setAttribute('aria-current', 'page'); link.dataset.bdCurrent = ''; }
    else if (!mine && 'bdCurrent' in link.dataset) { delete link.dataset.bdCurrent; if (!location.pathname.endsWith(link.getAttribute('href')!)) link.removeAttribute('aria-current'); }
  });
}

/**
 * Offerte: Keystatic mette sempre lo slug nella prima colonna. Si mostra prima il nome dell'offerta, poi lo slug
 * (solo l'aspetto: si nasconde il contenuto originale delle celle e si aggiunge il testo scambiato).
 */
function applyOffers() {
  if (!/\/collection\/offers\/?$/.test(location.pathname)) return;
  document.querySelectorAll<HTMLElement>('main [role="row"]').forEach((row) => {
    const cells = [...row.querySelectorAll<HTMLElement>('[role="rowheader"], [role="gridcell"], [role="columnheader"]')];
    if (cells.length < 2) return;
    const [a, b] = cells;
    // testo originale della cella (sempre quello attuale di Keystatic, che carica i nomi dopo gli slug)
    const text = (c: HTMLElement) => [...c.childNodes].filter((n) => !(n instanceof HTMLElement && n.classList.contains('bd-swap'))).map((n) => n.textContent).join('').trim();
    const ta = text(a), tb = text(b);
    const head = a.getAttribute('role') === 'columnheader';
    for (const [cell, show] of [[a, tb], [b, ta]] as const) {
      const old = cell.querySelector<HTMLElement>(':scope > .bd-swap');
      if (old && old.textContent === show) continue;
      const span = old ?? Object.assign(document.createElement('span'), { className: `bd-swap${head ? ' head' : cell === a ? ' main' : ''}` });
      span.textContent = show;
      cell.classList.add('bd-swap-host');
      if (!old) cell.append(span);
    }
  });
}

function apply() {
  applyOffers();
  applySingletons();
  applyCollections();
  applyFixedList();
  markPagesNav();
}

async function load() {
  try {
    const res = await fetch('/api/seo-status', { cache: 'no-store' });
    pages = (await res.json()).pages ?? {};
    apply();
  } catch {
    /* server di sviluppo non raggiungibile: si riprova al prossimo giro */
  }
}

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
// Keystatic ridisegna spesso la sidebar: si rimettono i badge quando cambia il DOM
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; apply(); });
}).observe(document.body, { childList: true, subtree: true });
// aggiornamento dopo i salvataggi
setInterval(load, 4000);
addEventListener('focus', load);
load();
