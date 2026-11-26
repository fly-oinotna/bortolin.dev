import { adminBase } from './base';
import { getProvider } from './ai-pref';
// TRADUZIONI nel pannello Keystatic:
//  - selettore di lingua in cima alla sidebar (IT · EN): mostra solo le voci della lingua scelta
//    (le traduzioni sono le voci "en_…" della config, vedi src/keystatic/i18n.ts; quelle condivise restano sempre visibili);
//    cambiando lingua si passa alla stessa pagina nell'altra lingua;
//  - nell'intestazione di ogni contenuto traducibile: link alla versione nell'altra lingua e pulsante "Traduci con AI"
//    (POST /api/translate, vedi translate-api.ts).
type Status = {
  langs: string[];
  names: Record<string, string>;
  fixed: { key: string; label: string }[];
  translations: Record<string, { singletons: Record<string, boolean>; collections: Record<string, Record<string, string>> }>;
};

const LS = 'bd-lang';
/** nomi delle lingue nei testi del pannello ("la versione inglese") */
const ADJ: Record<string, string> = { it: 'italiana', en: 'inglese', de: 'tedesca', es: 'spagnola' };
const NAME_IT: Record<string, string> = { it: 'italiano', en: 'inglese', de: 'tedesco', es: 'spagnolo' };
const DEFAULT = 'it';
let status: Status | null = null;
let busy = false;

const CSS = `
.bd-lang { display: flex; gap: 4px; margin: 0 0 12px 8px; /* testo "IT" allineato alle voci del menu (24 px) */ padding: 4px; border-radius: 999px; background: var(--kui-color-background-surface-secondary, rgba(127,127,127,.12)); width: fit-content; }
.bd-lang button { all: unset; cursor: pointer; padding: 4px 12px; border-radius: 999px; font: 600 12px/1.4 var(--kui-typography-font-family-base, system-ui, sans-serif); letter-spacing: .04em; color: var(--kui-color-foreground-neutral-secondary); }
.bd-lang button[aria-pressed="true"] { background: var(--bd-accent); color: var(--bd-on-accent); }
.bd-lang button:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 2px; }
#page-title { white-space: nowrap; }
.bd-tr-bar { display: inline-flex; flex-shrink: 0; align-items: center; gap: 8px; margin-left: 12px; font: 500 12.5px/1.3 var(--kui-typography-font-family-base, system-ui, sans-serif); white-space: nowrap; }
.bd-tr-bar a, .bd-tr-bar button { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--kui-color-border-muted, rgba(127,127,127,.35)); color: var(--kui-color-foreground-neutral); }
.bd-tr-bar a:hover, .bd-tr-bar button:hover { border-color: var(--bd-accent); }
.bd-tr-bar .bd-ai { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); font-weight: 600; }
.bd-tr-bar .bd-ai[aria-busy="true"] { opacity: .7; cursor: progress; }
.bd-tr-bar .bd-flag { font-weight: 700; letter-spacing: .04em; }
.bd-tr-overlay { position: fixed; inset: 0; z-index: 99998; display: grid; place-items: center; background: rgba(0,0,0,.45); }
.bd-tr-overlay div { max-width: 360px; padding: 22px 26px; border-radius: 12px; background: #fff; color: #1d2327; text-align: center; font: 14px/1.5 system-ui, sans-serif; box-shadow: 0 12px 40px rgba(0,0,0,.3); }
.bd-tr-overlay i { display: block; width: 28px; height: 28px; margin: 0 auto 12px; border: 3px solid var(--bd-accent); border-right-color: transparent; border-radius: 50%; animation: bd-spin .8s linear infinite; }
@keyframes bd-spin { to { transform: rotate(360deg); } }
`;

// ---------------------------------------------------------------- dove siamo
type Loc = { type: 'singleton' | 'collection' | 'item' | 'other'; key: string; slug?: string };
function where(): Loc {
  const p = location.pathname;
  let m = p.match(/\/singleton\/([^/]+)/);
  if (m) return { type: 'singleton', key: decodeURIComponent(m[1]) };
  m = p.match(/\/collection\/([^/]+)\/item\/([^/]+)/);
  if (m) return { type: 'item', key: decodeURIComponent(m[1]), slug: decodeURIComponent(m[2]) };
  m = p.match(/\/collection\/([^/]+)/);
  if (m) return { type: 'collection', key: decodeURIComponent(m[1]) };
  return { type: 'other', key: '' };
}
const split = (key: string) => {
  const m = key.match(/^([a-z]{2})_(.+)$/);
  return m && status?.langs.includes(m[1]) ? { lang: m[1], base: m[2] } : { lang: DEFAULT, base: key };
};
const isTranslatable = (base: string) => !!status && (base in Object.values(status.translations)[0].singletons || base in Object.values(status.translations)[0].collections);

/** lingua attiva: quella del contenuto aperto, altrimenti l'ultima scelta */
function current(): string {
  const loc = where();
  if (loc.type !== 'other' && status) {
    const { lang, base } = split(loc.key);
    if (lang !== DEFAULT || isTranslatable(base)) { try { localStorage.setItem(LS, lang); } catch {} return lang; }
  }
  try { return localStorage.getItem(LS) || DEFAULT; } catch { return DEFAULT; }
}

const goTo = (href: string) => { history.pushState(null, '', href); dispatchEvent(new PopStateEvent('popstate')); };
const keyIn = (lang: string, base: string) => (lang === DEFAULT ? base : `${lang}_${base}`);

/** la stessa pagina nell'altra lingua (o l'elenco, se la voce non è tradotta) */
function counterpart(to: string): string {
  const loc = where();
  if (loc.type === 'other' || !status) return location.pathname;
  const { lang, base } = split(loc.key);
  if (!isTranslatable(base)) return location.pathname;
  if (loc.type === 'collection') return `${adminBase()}/collection/${keyIn(to, base)}`;
  if (loc.type === 'singleton') {
    if (to !== DEFAULT && !status.translations[to].singletons[base] && status.fixed.some((f) => f.key === base)) return `${adminBase()}/collection/${keyIn(to, 'pages')}`;
    return `${adminBase()}/singleton/${keyIn(to, base)}`;
  }
  // voce di una collection: slug italiano ⇄ slug tradotto
  const itSlug = lang === DEFAULT ? loc.slug! : Object.entries(status.translations[lang].collections[base] ?? {}).find(([, s]) => s === loc.slug)?.[0];
  const target = !itSlug ? undefined : to === DEFAULT ? itSlug : status.translations[to].collections[base]?.[itSlug];
  return target ? `${adminBase()}/collection/${keyIn(to, base)}/item/${encodeURIComponent(target)}` : `${adminBase()}/collection/${keyIn(to, base)}`;
}

// ---------------------------------------------------------------- sidebar
function applyNav() {
  if (!status) return;
  const lang = current();
  const nav = document.querySelector<HTMLElement>('nav');
  const first = nav?.querySelector<HTMLAnchorElement>(`a[href="${adminBase()}"]`);
  if (nav && first && !nav.querySelector('.bd-lang')) {
    const box = document.createElement('div');
    box.className = 'bd-lang';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Lingua dei contenuti');
    for (const l of [DEFAULT, ...status.langs]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.lang = l;
      b.textContent = l.toUpperCase();
      b.title = status.names[l] ?? l;
      b.addEventListener('click', () => {
        try { localStorage.setItem(LS, l); } catch {}
        const href = counterpart(l);
        if (href !== location.pathname) goTo(href); else apply();
      });
      box.append(b);
    }
    const host = first.closest('li')?.parentElement ?? first.parentElement!;
    host.before(box);
  }
  nav?.querySelectorAll<HTMLButtonElement>('.bd-lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  // voci della sidebar e della dashboard: solo quelle della lingua scelta (le condivise sempre)
  document.querySelectorAll<HTMLAnchorElement>('a[href*="/collection/"], a[href*="/singleton/"]').forEach((a) => {
    if (a.closest('.bd-fixed, .bd-tr-bar')) return;
    const m = a.getAttribute('href')!.match(/\/(?:collection|singleton)\/([^/]+)$/);
    if (!m) return;
    const { lang: l, base } = split(decodeURIComponent(m[1]));
    const hide = l !== DEFAULT ? l !== lang : lang !== DEFAULT && isTranslatable(base);
    const item = (a.closest('li') ?? a) as HTMLElement;
    const display = hide ? 'none' : '';
    if (item.style.display !== display) item.style.display = display;
  });
}

// ---------------------------------------------------------------- intestazione: altra lingua + traduci con AI
async function translate(opts: { lang: string; key?: string; collection?: string; slug?: string; force?: boolean }, label: string) {
  if (busy) return;
  if (opts.force && !confirm(`Ritradurre "${label}" con l'AI?\nLa traduzione attuale verrà sostituita (le modifiche fatte a mano si perdono).`)) return;
  busy = true;
  const overlay = Object.assign(document.createElement('div'), { className: 'bd-tr-overlay' });
  overlay.innerHTML = `<div><i></i><strong>Traduzione in corso…</strong><br>“${label}” in ${NAME_IT[opts.lang] ?? opts.lang}.<br><small>Può richiedere uno o due minuti.</small></div>`;
  document.body.append(overlay);
  try {
    const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: getProvider(), ...opts }) });
    const data = await res.json();
    if (!res.ok) {
      if (data.exists && data.href) { goTo(data.href); return; }
      throw new Error(data.error || `Errore ${res.status}`);
    }
    await load();
    // ricarica completa: Keystatic rilegge il file appena creato
    location.href = data.href;
  } catch (e) {
    alert(`Traduzione non riuscita.\n${(e as Error).message}`);
  } finally {
    busy = false;
    overlay.remove();
  }
}

function applyBar() {
  const header = document.querySelector<HTMLElement>('main header');
  // singleton: accanto al titolo; voce di una collection: dopo il percorso (breadcrumb)
  const crumbs = header?.querySelector<HTMLElement>('nav[class*="Breadcrumbs"]');
  const title = header?.querySelector('#page-title')?.parentElement ?? crumbs;
  const loc = where();
  const old = header?.querySelector<HTMLElement>('.bd-tr-bar');
  if (!status || !title || (loc.type !== 'singleton' && loc.type !== 'item')) { old?.remove(); return; }
  const { lang, base } = split(loc.key);
  if (!isTranslatable(base)) { old?.remove(); return; }
  const label = document.querySelector('#page-title')?.textContent?.trim() || loc.slug || base;
  const coll = loc.type === 'item';
  const parts: string[] = [];
  const actions: (() => void)[] = [];
  if (lang === DEFAULT) {
    for (const l of status.langs) {
      const href = counterpart(l);
      const exists = coll ? !!status.translations[l].collections[base]?.[loc.slug!] : status.translations[l].singletons[base];
      if (exists) parts.push(`<a href="${href}" data-go><span class="bd-flag">${l.toUpperCase()}</span> Apri la versione ${ADJ[l] ?? l} →</a>`);
      else {
        parts.push(`<button type="button" class="bd-ai" data-act="${actions.length}"><span class="bd-flag">${l.toUpperCase()}</span> Traduci con AI</button>`);
        actions.push(() => translate(coll ? { lang: l, collection: base, slug: loc.slug } : { lang: l, key: base }, label));
      }
    }
  } else {
    const itSlug = coll ? Object.entries(status.translations[lang].collections[base] ?? {}).find(([, s]) => s === loc.slug)?.[0] : base;
    const exists = coll ? !!itSlug : status.translations[lang].singletons[base];
    parts.push(`<a href="${counterpart(DEFAULT)}" data-go>← <span class="bd-flag">IT</span> Versione italiana</a>`);
    if (itSlug || !coll) {
      parts.push(`<button type="button" class="bd-ai" data-act="${actions.length}">${exists ? 'Ritraduci con AI' : 'Traduci con AI'}</button>`);
      actions.push(() => translate(coll ? { lang, collection: base, slug: itSlug, force: true } : { lang, key: base, force: exists }, label));
    }
  }
  const sig = location.pathname + parts.join('');
  if (old?.dataset.sig === sig) return;
  const bar = document.createElement('span');
  bar.className = 'bd-tr-bar';
  bar.dataset.sig = sig;
  bar.innerHTML = parts.join('');
  bar.querySelectorAll<HTMLAnchorElement>('a[data-go]').forEach((a) => a.addEventListener('click', (e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); goTo(a.getAttribute('href')!); }));
  bar.querySelectorAll<HTMLButtonElement>('button[data-act]').forEach((b) => b.addEventListener('click', () => actions[Number(b.dataset.act)]()));
  if (old) old.replaceWith(bar); else if (title === crumbs) title.after(bar); else title.append(bar);
}

function apply() {
  applyNav();
  applyBar();
}

async function load() {
  try {
    status = await (await fetch('/api/translate', { cache: 'no-store' })).json();
    (window as any).bdI18n = { status, translate, current, DEFAULT };
    apply();
  } catch { /* server non raggiungibile: si riprova */ }
}

(window as any).bdI18n = { status, translate, current, DEFAULT };
document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; apply(); });
}).observe(document.body, { childList: true, subtree: true });
addEventListener('popstate', () => requestAnimationFrame(apply));
setInterval(load, 5000);
addEventListener('focus', load);
load();
