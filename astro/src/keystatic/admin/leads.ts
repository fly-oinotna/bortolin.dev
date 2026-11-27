// RICHIESTE nel pannello: voce "Richieste" nella sidebar (con il numero delle nuove) e pagina /admin/…/richieste
// con stato (nuova → contattato → preventivo → acquisito / perso), note ed eliminazione. Dati: /api/leads.
import { adminBase } from './base';
import { t, fmtLocale } from './ui-i18n';

const STATUS_LABEL: Record<string, string> = { nuova: 'Nuova', contattato: 'Contattato', preventivo: 'Preventivo inviato', acquisito: 'Acquisito', perso: 'Perso' };
const TOPIC_LABEL: Record<string, string> = {};
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const df = new Intl.DateTimeFormat(fmtLocale(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const CSS = `
.bd-leads-link { display: flex !important; align-items: center; justify-content: space-between; }
.bd-leads-count { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 99px; display: inline-grid; place-items: center; background: var(--bd-accent); color: var(--bd-on-accent); font: 700 11px/1 var(--kui-typography-font-family-base, system-ui); }
.bd-leads { padding: 32px; box-sizing: border-box; width: 100%; max-width: 1100px; display: grid; gap: 16px; font: 14px/1.5 var(--kui-typography-font-family-base, system-ui, sans-serif); color: var(--kui-color-foreground-neutral); }
.bd-leads h2 { margin: 0; font-size: 20px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-leads .muted { color: var(--kui-color-foreground-neutral-tertiary); font-size: 13px; }
.bd-leads .filters { display: flex; flex-wrap: wrap; gap: 6px; }
.bd-leads .filters button { all: unset; cursor: pointer; padding: 5px 12px; border-radius: 99px; border: 1px solid var(--kui-color-border-muted); font-size: 13px; }
.bd-leads .filters button[aria-pressed="true"] { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); font-weight: 600; }
.bd-lead { border: 1px solid var(--kui-color-border-muted); border-radius: 14px; padding: 16px 18px; background: var(--kui-color-background-surface); display: grid; gap: 10px; }
.bd-lead.new { border-left: 4px solid var(--bd-accent); }
.bd-lead header { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: baseline; justify-content: space-between; }
.bd-lead header b { font-size: 16px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-lead .contacts { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 13px; }
.bd-lead a { color: var(--kui-color-foreground-accent); }
.bd-lead .msg { white-space: pre-wrap; background: var(--kui-color-background-surface-secondary, rgba(127,127,127,.08)); border-radius: 10px; padding: 10px 12px; }
.bd-lead .chips span { display: inline-block; margin: 0 4px 4px 0; padding: 1px 8px; border-radius: 99px; font-size: 12px; background: color-mix(in srgb, transparent, var(--bd-accent) 20%); }
.bd-lead .tools { display: grid; grid-template-columns: 200px 1fr auto; gap: 8px; align-items: start; }
.bd-lead select, .bd-lead textarea { box-sizing: border-box; width: 100%; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--kui-color-border-muted); background: transparent; color: inherit; font: inherit; font-size: 13px; }
.bd-lead textarea { min-height: 38px; resize: vertical; }
.bd-lead button.del { all: unset; cursor: pointer; padding: 8px 12px; border-radius: 10px; font-size: 13px; color: #e5484d; }
.bd-lead .warn { color: #b7791f; font-size: 12px; }
@media (max-width: 800px) { .bd-lead .tools { grid-template-columns: 1fr; } }
[data-bd-leads-host] > :not(.bd-leads) { display: none !important; }
`;

let items: any[] = [];
let enabled = false;
let filter = 'attive';

const isLeadsPage = () => /^\/admin(?:\/branch\/[^/]+)?\/richieste\/?$/.test(location.pathname);
const leadsHref = () => `${adminBase()}/richieste`;

async function load() {
  try {
    const r = await fetch('/api/leads', { cache: 'no-store' });
    const d = await r.json();
    enabled = !!d.enabled && r.ok;
    items = enabled ? d.items : [];
  } catch { enabled = false; items = []; }
  updateCount();
}

function updateCount() {
  const link = document.querySelector<HTMLAnchorElement>('.bd-leads-link');
  if (!link) return;
  const n = items.filter((x) => x.status === 'nuova').length;
  let c = link.querySelector('.bd-leads-count');
  if (!n) { c?.remove(); return; }
  if (!c) { c = document.createElement('span'); c.className = 'bd-leads-count'; link.append(c); }
  c.textContent = String(n);
}

function render(box: HTMLElement) {
  if (!enabled) {
    box.innerHTML = `<h2>${esc(t('Richieste'))}</h2><p class="muted">${esc(t('Le richieste del modulo contatti sono salvate online: le vedi qui nel pannello online. In locale non ci sono.'))}</p>`;
    return;
  }
  const active = (x: any) => !['acquisito', 'perso'].includes(x.status);
  const groups: [string, string, (x: any) => boolean][] = [
    ['attive', t('Da seguire'), active], ['nuova', t('Nuove'), (x) => x.status === 'nuova'], ['acquisito', t('Acquisite'), (x) => x.status === 'acquisito'], ['perso', t('Perse'), (x) => x.status === 'perso'], ['tutte', t('Tutte'), () => true],
  ];
  const list = items.filter(groups.find((g) => g[0] === filter)![2]);
  box.innerHTML = `<div><h2>${esc(t('Richieste'))}</h2><p class="muted">${esc(t('Dal modulo contatti del sito. Ogni richiesta arriva anche via email.'))}</p></div>
    <div class="filters" role="group" aria-label="${esc(t('Filtra le richieste'))}">${groups.map(([k, l, fn]) => `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${l} (${items.filter(fn).length})</button>`).join('')}</div>
    ${list.length ? list.map((x) => `<article class="bd-lead${x.status === 'nuova' ? ' new' : ''}" data-id="${esc(x.id)}">
      <header><b>${esc(x.name)}</b><span class="muted">${esc(df.format(new Date(x.createdAt)))} · ${esc(String(x.lang || 'it').toUpperCase())}${x.page ? ` · ${esc(t('da {s}', { s: x.page }))}` : ''}</span></header>
      <div class="contacts"><a href="mailto:${esc(x.email)}">${esc(x.email)}</a><a href="tel:${esc(String(x.phone).replace(/\s/g, ''))}">${esc(x.phone)}</a>${x.website ? `<span>${esc(x.website)}</span>` : ''}</div>
      ${x.topics?.length ? `<div class="chips">${x.topics.map((t: string) => `<span>${esc(TOPIC_LABEL[t] ?? t)}</span>`).join('')}</div>` : ''}
      ${x.message ? `<div class="msg">${esc(x.message)}</div>` : ''}
      ${x.emailFailed ? `<p class="warn">${esc(t('L’email di notifica non era partita: questa richiesta l’hai solo qui.'))}</p>` : ''}
      <div class="tools">
        <select aria-label="${esc(t('Stato'))}">${Object.entries(STATUS_LABEL).map(([k, l]) => `<option value="${k}"${k === x.status ? ' selected' : ''}>${esc(t(l))}</option>`).join('')}</select>
        <textarea placeholder="${esc(t('Note (si salvano da sole)'))}" aria-label="${esc(t('Note'))}">${esc(x.notes)}</textarea>
        <button type="button" class="del">${esc(t('Elimina'))}</button>
      </div></article>`).join('') : `<p class="muted">${esc(t('Nessuna richiesta in questo elenco.'))}</p>`}`;

  box.querySelectorAll<HTMLButtonElement>('.filters button').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.f!; render(box); }));
  box.querySelectorAll<HTMLElement>('.bd-lead').forEach((card) => {
    const id = card.dataset.id!;
    const save = async (patch: Record<string, string>) => {
      const r = await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...patch }) });
      if (r.ok) { const { item } = await r.json(); items = items.map((x) => (x.id === id ? item : x)); updateCount(); }
      else alert(t('Salvataggio non riuscito: ricarica la pagina e riprova.'));
    };
    card.querySelector('select')!.addEventListener('change', async (e) => { await save({ status: (e.target as HTMLSelectElement).value }); render(box); });
    card.querySelector('textarea')!.addEventListener('change', (e) => save({ notes: (e.target as HTMLTextAreaElement).value }));
    card.querySelector('.del')!.addEventListener('click', async () => {
      if (!confirm(t('Eliminare definitivamente questa richiesta?'))) return;
      const r = await fetch('/api/leads', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (r.ok) { items = items.filter((x) => x.id !== id); updateCount(); render(box); }
    });
  });
}

function sync() {
  // voce nella sidebar, subito dopo "Dashboard"
  const dash = [...document.querySelectorAll<HTMLAnchorElement>('nav a')].find((a) => a.getAttribute('href') === adminBase() || a.getAttribute('href') === `${adminBase()}/`);
  if (dash && !document.querySelector('.bd-leads-link')) {
    const li = dash.closest('li') ?? dash;
    const copy = li.cloneNode(true) as HTMLElement;
    const a = (copy.matches('a') ? copy : copy.querySelector('a')) as HTMLAnchorElement;
    a.classList.add('bd-leads-link');
    a.href = leadsHref();
    a.removeAttribute('aria-current');
    // si cambia solo il testo, lasciando intatti font e stile della voce copiata
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    let first = true;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue?.trim()) { n.nodeValue = first ? t('Richieste') : ''; first = false; }
    a.addEventListener('click', (e) => { e.preventDefault(); history.pushState(null, '', leadsHref()); dispatchEvent(new PopStateEvent('popstate')); });
    li.after(copy);
    updateCount();
  }
  const link = document.querySelector<HTMLAnchorElement>('.bd-leads-link');
  if (link) { if (isLeadsPage()) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); }

  // pagina
  // pagina sconosciuta a Keystatic ("Not found"): il pannello principale ha un solo figlio, si usa quello
  const host = document.querySelector<HTMLElement>('#keystatic-main-panel > :last-child');
  const existing = document.querySelector<HTMLElement>('.bd-leads');
  if (!isLeadsPage() || !host) {
    existing?.remove();
    document.querySelectorAll('[data-bd-leads-host]').forEach((h) => h.removeAttribute('data-bd-leads-host'));
    return;
  }
  if (existing && existing.parentElement === host) return;
  existing?.remove();
  host.setAttribute('data-bd-leads-host', '');
  const box = document.createElement('div');
  box.className = 'bd-leads';
  box.innerHTML = `<p class="muted">${esc(t('Caricamento delle richieste…'))}</p>`;
  host.append(box);
  load().then(() => render(box));
}

const style = document.createElement('style');
style.textContent = CSS;
document.head.append(style);
new MutationObserver(() => sync()).observe(document.body, { childList: true, subtree: true });
addEventListener('popstate', () => setTimeout(sync, 50));
load().then(sync);
