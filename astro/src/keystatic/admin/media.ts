// MEDIATECA del pannello (solo sviluppo), sul modello della libreria media di WordPress.
// - voce "Media" nella sidebar → gestione: griglia, ricerca, caricamento (anche trascinando), alt predefinito, dove è usata, elimina
// - campi immagine (src/keystatic/fields.ts → image()) → stessa finestra in modalità "scegli"
// Dati e file passano da /api/media (src/keystatic/admin/media-api.ts).

type Item = { path: string; name: string; folder: string; size: number; mtime: number; alt: string; ai: string; usedIn: string[] };

/** Marcatura AI (AI Act, art. 50), come AM Tools 3: il badge compare sull'immagine nel sito */
const AI_CHOICES = [
  { value: 'none', label: 'Nessuna' },
  { value: 'ai', label: 'Realizzata con AI' },
  { value: 'modified', label: 'Modificata con AI' },
  { value: 'generated', label: 'Generata con AI' },
];
type OpenOptions = { selected?: string; onSelect?: (path: string) => void };

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const thumb = (p: string, v?: number) => `/api/media?file=${encodeURIComponent(p)}${v ? `&v=${Math.round(v)}` : ''}`;

const CSS = `
.bd-media { position: fixed; inset: 0; z-index: 100000; display: grid; place-items: center; background: rgba(0,0,0,.6); padding: 24px;
  font: 14px/1.4 var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); color: var(--m-fg);
  /* colori del tema di Keystatic (chiaro, scuro o automatico): la libreria segue il pannello */
  --m-bg: var(--kui-color-background-surface, #fff);
  --m-card: var(--kui-color-background-surface-secondary, #f3f4f6);
  --m-side: var(--kui-color-background-canvas, #fafafa);
  --m-fg: var(--kui-color-foreground-neutral-emphasis, #1d2327);
  --m-fg2: var(--kui-color-foreground-neutral-secondary, #6b7280);
  --m-border: var(--kui-color-border-neutral, #d1d5db);
  --m-line: var(--kui-color-border-muted, #e5e7eb);
  --m-ok: var(--kui-color-foreground-positive, #15803d);
  --m-ko: var(--kui-color-foreground-critical, #b91c1c);
  --m-check: repeating-conic-gradient(var(--m-line) 0 25%, var(--m-bg) 0 50%) 0 0/14px 14px; }
.bd-media[hidden] { display: none; }
.bd-media-box { width: min(1200px, 100%); height: min(860px, 100%); background: var(--m-bg); border-radius: 12px; display: grid; grid-template-rows: auto 1fr; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
.bd-media-head { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-bottom: 1px solid var(--m-line); }
.bd-media-head h2 { margin: 0 auto 0 0; font-size: 18px; }
.bd-media-head input[type=search] { width: 260px; padding: 8px 10px; border: 1px solid var(--m-border); border-radius: 8px; font: inherit; background: var(--m-bg); color: var(--m-fg); }
.bd-media button { font: inherit; cursor: pointer; border-radius: 8px; padding: 8px 14px; border: 1px solid var(--m-border); background: var(--m-bg); color: var(--m-fg); }
.bd-media button.primary { background: var(--m-fg); color: var(--m-bg); border-color: var(--m-fg); }
.bd-media button.green { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); font-weight: 600; }
.bd-media button.danger { color: var(--m-ko); border-color: color-mix(in srgb, var(--m-ko) 45%, transparent); }
.bd-media button:disabled { opacity: .45; cursor: not-allowed; }
.bd-media-body { display: grid; grid-template-columns: 1fr 320px; min-height: 0; }
.bd-media-grid { overflow: auto; padding: 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; align-content: start; grid-auto-rows: max-content; position: relative; }
.bd-media-grid.drag::after { content: "Rilascia per caricare"; position: absolute; inset: 8px; border: 3px dashed var(--bd-accent); border-radius: 12px; display: grid; place-items: center; font-size: 18px; font-weight: 700; background: rgba(153,234,72,.12); }
.bd-media-card { all: unset; box-sizing: border-box; cursor: pointer; border-radius: 10px; border: 2px solid transparent; background: var(--m-card); overflow: hidden; display: grid; align-content: start; min-height: max-content; }
.bd-media-card:focus-visible, .bd-media-card[aria-pressed="true"] { border-color: var(--m-fg); }
.bd-media-card .t { width: 100%; aspect-ratio: 4/3; min-height: 0; overflow: hidden; background: var(--m-check); }
.bd-media-card img { display: block; width: 100%; height: 100%; object-fit: contain; }
.bd-media-card .n { padding: 6px 8px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bd-media-card .u { margin: 0 8px 8px; font-size: 11px; font-weight: 600; color: var(--m-ok); }
.bd-media-card .u.no { color: var(--m-ko); }
.bd-media-side { border-left: 1px solid var(--m-line); overflow: auto; padding: 16px; display: grid; gap: 12px; align-content: start; grid-auto-rows: max-content; background: var(--m-side); }
.bd-media-side .prev { width: 100%; aspect-ratio: 4/3; flex-shrink: 0; border-radius: 10px; background: var(--m-check); overflow: hidden; }
.bd-media-side .prev img { display: block; width: 100%; height: 100%; object-fit: contain; }
.bd-media-side textarea { background: var(--m-bg); color: var(--m-fg); }
.bd-media-side textarea { width: 100%; box-sizing: border-box; min-height: 70px; padding: 8px; border: 1px solid var(--m-border); border-radius: 8px; font: inherit; }
.bd-media-side small { color: var(--m-fg2); }
.bd-media-side ul { margin: 0; padding-left: 18px; }
.bd-media-msg { color: var(--m-ko); font-size: 13px; }
.bd-media-msg.ok { color: var(--m-ok); }
.bd-media-side .row { display: flex; gap: 6px; }
.bd-media-side .row input { flex: 1; min-width: 0; padding: 8px; border: 1px solid var(--m-border); border-radius: 8px; font: inherit; background: var(--m-bg); color: var(--m-fg); }
.bd-media-ai { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.bd-media-ai label { display: flex; align-items: center; gap: 6px; padding: 7px 9px; border: 1px solid var(--m-border); border-radius: 8px; cursor: pointer; font-size: 13px; background: var(--m-bg); }
.bd-media-ai label:has(input:checked) { border-color: var(--m-fg); background: var(--m-fg); color: var(--m-bg); }
.bd-media-card .ai { margin: 0 8px 8px; font-size: 10px; font-weight: 700; color: var(--m-bg); background: var(--m-fg); border-radius: 999px; padding: 2px 7px; justify-self: start; }
.bd-media-empty { grid-column: 1 / -1; color: var(--m-fg2); padding: 40px; text-align: center; }
`;

let items: Item[] = [];
let current: Item | null = null;
let opts: OpenOptions = {};
let root: HTMLDivElement | null = null;

async function load() {
  const res = await fetch('/api/media', { cache: 'no-store' });
  items = (await res.json()).items ?? [];
}

function build() {
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
  root = document.createElement('div');
  root.className = 'bd-media';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Mediateca');
  root.innerHTML = `
    <div class="bd-media-box">
      <div class="bd-media-head">
        <h2>Media</h2>
        <input type="search" placeholder="Cerca per nome, cartella o testo alternativo" aria-label="Cerca immagini">
        <button type="button" class="primary" data-act="upload">Carica immagini</button>
        <input type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.avif,.gif" multiple hidden>
        <button type="button" data-act="close" aria-label="Chiudi">✕</button>
      </div>
      <div class="bd-media-body">
        <div class="bd-media-grid" role="list"></div>
        <aside class="bd-media-side"></aside>
      </div>
    </div>`;
  document.body.appendChild(root);
  const grid = root.querySelector<HTMLElement>('.bd-media-grid')!;
  const search = root.querySelector<HTMLInputElement>('input[type=search]')!;
  const file = root.querySelector<HTMLInputElement>('input[type=file]')!;
  search.addEventListener('input', renderGrid);
  root.addEventListener('click', (e) => {
    const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (act === 'close' || e.target === root) close();
    if (act === 'upload') file.click();
  });
  file.addEventListener('change', () => { upload(Array.from(file.files ?? [])); file.value = ''; });
  // carica trascinando i file sulla griglia
  grid.addEventListener('dragover', (e) => { e.preventDefault(); grid.classList.add('drag'); });
  grid.addEventListener('dragleave', () => grid.classList.remove('drag'));
  grid.addEventListener('drop', (e) => { e.preventDefault(); grid.classList.remove('drag'); upload(Array.from(e.dataTransfer?.files ?? [])); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root && !root.hidden) close(); });
}

function renderGrid() {
  const grid = root!.querySelector<HTMLElement>('.bd-media-grid')!;
  const q = root!.querySelector<HTMLInputElement>('input[type=search]')!.value.trim().toLowerCase();
  const list = items.filter((i) => !q || `${i.name} ${i.folder} ${i.alt}`.toLowerCase().includes(q));
  grid.innerHTML = list.length ? '' : '<p class="bd-media-empty">Nessuna immagine. Caricane una con il pulsante in alto o trascinandola qui.</p>';
  for (const it of list) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bd-media-card';
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-pressed', String(current?.path === it.path));
    b.innerHTML = `<span class="t"><img src="${thumb(it.path, it.mtime)}" alt="" loading="lazy"></span><span class="n" title="${esc(it.name)}">${esc(it.name)}</span>
      <span class="u ${it.usedIn.length ? '' : 'no'}">${it.usedIn.length ? `Usata in ${it.usedIn.length}` : 'Non usata'}</span>
      ${it.ai !== 'none' ? `<span class="ai">${esc(AI_CHOICES.find((c) => c.value === it.ai)?.label)}</span>` : ''}`;
    b.addEventListener('click', () => { current = it; renderGrid(); renderSide(); });
    b.addEventListener('dblclick', () => { if (opts.onSelect) choose(it); });
    grid.appendChild(b);
  }
}

function renderSide(msg = '', ok = false) {
  const side = root!.querySelector<HTMLElement>('.bd-media-side')!;
  if (!current) {
    side.innerHTML = `<p><strong>${opts.onSelect ? 'Scegli un’immagine' : 'Mediateca'}</strong></p><small>Clicca un’immagine per vederne i dettagli${opts.onSelect ? ', doppio clic per sceglierla al volo' : ''}.</small>`;
    return;
  }
  const it = current;
  side.innerHTML = `
    <div class="prev"><img src="${thumb(it.path, it.mtime)}" alt=""></div>
    <div><strong style="word-break:break-all">${esc(it.name)}</strong><br><small>${esc(it.folder || '/')} · ${kb(it.size)} <span data-dim></span></small></div>
    ${opts.onSelect ? '<button type="button" class="green" data-act="choose">Usa questa immagine</button>' : ''}
    <label><strong>Testo alternativo predefinito</strong><br><small>Usato quando la pagina non ne indica uno.</small>
      <textarea>${esc(it.alt)}</textarea></label>
    <button type="button" data-act="alt">Salva il testo alternativo</button>
    <div><strong>Nome del file</strong><br><small>Tutti i riferimenti nei contenuti vengono aggiornati. Salva prima eventuali pagine aperte con modifiche in corso.</small>
      <div class="row"><input type="text" value="${esc(it.name.replace(/\.[^.]+$/, ''))}" aria-label="Nuovo nome del file"><button type="button" data-act="rename">Rinomina</button></div></div>
    <div><strong>Marcatura AI</strong><br><small>AI Act (UE), art. 50: segnala le immagini generate o modificate con l’intelligenza artificiale. Nel sito compare un’etichetta sull’immagine.</small>
      <div class="bd-media-ai" role="radiogroup" aria-label="Marcatura AI">${AI_CHOICES.map((c) => `<label><input type="radio" name="bd-ai" value="${c.value}" ${it.ai === c.value ? 'checked' : ''}>${c.label}</label>`).join('')}</div></div>
    <div><strong>Dove è usata</strong>${it.usedIn.length ? `<ul>${it.usedIn.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>` : '<br><small>In nessuna pagina.</small>'}</div>
    <button type="button" class="danger" data-act="delete" ${it.usedIn.length ? 'disabled title="Toglila prima dalle pagine in cui è usata"' : ''}>Elimina definitivamente</button>
    ${msg ? `<p class="bd-media-msg ${ok ? 'ok' : ''}">${esc(msg)}</p>` : ''}`;
  const img = side.querySelector<HTMLImageElement>('.prev img')!;
  img.addEventListener('load', () => { side.querySelector('[data-dim]')!.textContent = `· ${img.naturalWidth}×${img.naturalHeight}`; });
  side.querySelector('[data-act="choose"]')?.addEventListener('click', () => choose(it));
  side.querySelector('[data-act="alt"]')!.addEventListener('click', async () => {
    const alt = side.querySelector('textarea')!.value;
    const res = await fetch(`/api/media?path=${encodeURIComponent(it.path)}`, { method: 'PUT', body: JSON.stringify({ alt }) });
    if (res.ok) { it.alt = alt.trim(); renderSide('Testo alternativo salvato.', true); }
  });
  side.querySelector('[data-act="rename"]')!.addEventListener('click', async () => {
    const name = side.querySelector<HTMLInputElement>('.row input')!.value.trim();
    const res = await fetch(`/api/media?path=${encodeURIComponent(it.path)}&name=${encodeURIComponent(name)}`, { method: 'PATCH' });
    const data = await res.json();
    if (!res.ok) return renderSide(data.error);
    await load();
    current = items.find((i) => i.path === data.path) ?? null;
    renderGrid();
    renderSide(`Rinominato${data.updated ? `: aggiornati i riferimenti in ${data.updated} ${data.updated === 1 ? 'file' : 'file'} di contenuti` : ''}.`, true);
  });
  side.querySelectorAll<HTMLInputElement>('input[name="bd-ai"]').forEach((r) => r.addEventListener('change', async () => {
    const res = await fetch(`/api/media?path=${encodeURIComponent(it.path)}`, { method: 'PUT', body: JSON.stringify({ ai: r.value }) });
    if (res.ok) { it.ai = r.value; renderGrid(); renderSide('Marcatura AI salvata.', true); }
  }));
  side.querySelector('[data-act="delete"]')!.addEventListener('click', async () => {
    if (!confirm(`Eliminare definitivamente ${it.name}?`)) return;
    const res = await fetch(`/api/media?path=${encodeURIComponent(it.path)}`, { method: 'DELETE' });
    if (!res.ok) return renderSide((await res.json()).error);
    items = items.filter((x) => x !== it);
    current = null;
    renderGrid();
    renderSide();
  });
}

async function upload(files: File[]) {
  const errors: string[] = [];
  let last: string | null = null;
  for (const f of files) {
    const res = await fetch(`/api/media?name=${encodeURIComponent(f.name)}`, { method: 'POST', body: f });
    const data = await res.json();
    if (!res.ok) errors.push(`${f.name}: ${data.error}`);
    else last = data.path;
  }
  await load();
  current = items.find((i) => i.path === last) ?? current;
  renderGrid();
  renderSide(errors.join(' · '));
}

function choose(it: Item) {
  opts.onSelect?.(it.path);
  close();
}

async function open(o: OpenOptions = {}) {
  opts = o;
  if (!root) build();
  await load();
  current = items.find((i) => i.path === o.selected) ?? null;
  root!.querySelector('h2')!.textContent = o.onSelect ? 'Scegli dalla mediateca' : 'Media';
  root!.hidden = false;
  renderGrid();
  renderSide();
  root!.querySelector<HTMLInputElement>('input[type=search]')!.focus();
}

function close() {
  if (root) root.hidden = true;
  opts = {};
}

(window as any).bdMedia = { open };

// ---- voce "Media" nella sidebar, in fondo al primo gruppo (dopo Pagine, Post, Casi studio…), stesso aspetto delle altre voci
function addSidebarItem() {
  const post = document.querySelector<HTMLAnchorElement>('nav a[href$="/collection/posts"]');
  const li = post?.closest('li');
  if (!li || li.parentElement?.querySelector('[data-bd-media]')) return;
  const item = li.cloneNode(true) as HTMLLIElement;
  item.dataset.bdMedia = '';
  const a = item.querySelector('a')!;
  a.removeAttribute('aria-current');
  a.removeAttribute('data-selected');
  a.setAttribute('href', '#media');
  a.querySelectorAll('span, div').forEach((el) => { if (el.children.length === 0 && el.textContent?.trim() === 'Post') el.textContent = 'Media'; });
  a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); open(); });
  // ultima voce del gruppo: Media resta in fondo anche quando si aggiungono altre collection
  let last: Element = li;
  while (last.nextElementSibling && last.nextElementSibling.querySelector('a[href*="/collection/"]')) last = last.nextElementSibling;
  last.after(item);
}
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; addSidebarItem(); });
}).observe(document.body, { childList: true, subtree: true });
addSidebarItem();

export {};
