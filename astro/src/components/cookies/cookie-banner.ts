// Comportamento del banner cookie (markup in ./CookieBanner.astro), come AM Tools 3 → Cookies:
// 1. Google Consent Mode v2: valori predefiniti dei tipi di consenso (obbligatori = concessi)
// 2. visita senza scelta salvata → il banner compare dopo il ritardo impostato
// 3. scelta salvata nel browser → applicata subito; GTM parte solo se c'è almeno un consenso non obbligatorio
// 4. anteprima di Tag Assistant (?gtm_debug=… nell'indirizzo, poi per tutta la sessione): GTM parte subito,
//    con i consensi ancora "denied", così l'anteprima si collega anche senza toccare il banner
type ConsentType = { type: string; default: 'denied' | 'granted' | 'required' };
type State = Record<string, 'granted' | 'denied'>;

declare global {
  interface Window { dataLayer: unknown[]; gtag: (...args: unknown[]) => void }
}

const KEY = 'bd-cookie-consent';
const root = document.getElementById('bd-cookies');

if (root) {
  const types: ConsentType[] = JSON.parse(root.dataset.types || '[]');
  const delay = Math.max(0, Number(root.dataset.delay) || 0);
  const gtmId = root.dataset.gtm || '';
  const banner = root.querySelector<HTMLElement>('[data-bd-cookies-banner]')!;
  const settings = root.querySelector<HTMLElement>('[data-bd-cookies-settings]')!;
  const form = settings.querySelector('form')!;
  const trigger = root.querySelector<HTMLElement>('[data-bd-cookies="open"]')!;
  let lastFocus: HTMLElement | null = null;

  // ---- Consent Mode
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  const defaults: State = Object.fromEntries(types.map((t) => [t.type, t.default === 'denied' ? 'denied' : 'granted']));
  window.gtag('consent', 'default', { ...defaults, wait_for_update: 500 });

  const load = (): State | null => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
  const save = (s: State) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* browser senza storage: la scelta vale solo per questa pagina */ } };

  const DEBUG_KEY = 'bd-gtm-debug';
  const debug = (() => {
    try {
      if (/[?&]gtm_debug=/.test(location.search)) sessionStorage.setItem(DEBUG_KEY, '1');
      return sessionStorage.getItem(DEBUG_KEY) === '1';
    } catch { return /[?&]gtm_debug=/.test(location.search); }
  })();

  let gtmLoaded = false;
  const maybeLoadGtm = (s: State, force = false) => {
    const anyOptional = types.some((t) => t.default !== 'required' && s[t.type] === 'granted');
    if (!gtmId || gtmLoaded || (!anyOptional && !force)) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const js = document.createElement('script');
    js.async = true;
    js.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(js);
  };

  // ---- interfaccia
  const fill = (s: State) => types.forEach((t) => {
    const input = form.querySelector<HTMLInputElement>(`input[name="${CSS.escape(t.type)}"]`);
    if (input) input.checked = t.default === 'required' || s[t.type] === 'granted';
  });
  const openSettings = () => {
    lastFocus = document.activeElement as HTMLElement | null;
    fill(load() ?? defaults);
    banner.hidden = true;
    settings.hidden = false;
    form.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus();
  };
  const closeSettings = () => {
    settings.hidden = true;
    if (!load()) banner.hidden = false; // nessuna scelta ancora: torna il banner
    lastFocus?.focus();
  };
  const apply = (s: State) => {
    save(s);
    window.gtag('consent', 'update', s);
    maybeLoadGtm(s);
    banner.hidden = true;
    settings.hidden = true;
    trigger.hidden = false;
    document.dispatchEvent(new CustomEvent('bd-cookies:updated', { detail: s }));
  };
  const all = (v: 'granted' | 'denied'): State => Object.fromEntries(types.map((t) => [t.type, t.default === 'required' ? 'granted' : v]));

  root.addEventListener('click', (e) => {
    const action = (e.target as HTMLElement).closest<HTMLElement>('[data-bd-cookies]')?.dataset.bdCookies;
    if (action === 'accept') apply(all('granted'));
    else if (action === 'reject') apply(all('denied'));
    else if (action === 'settings' || action === 'open') openSettings();
    else if (action === 'close') closeSettings();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    apply(Object.fromEntries(types.map((t) => {
      const input = form.querySelector<HTMLInputElement>(`input[name="${CSS.escape(t.type)}"]`);
      return [t.type, t.default === 'required' || input?.checked ? 'granted' : 'denied'];
    })));
  });
  settings.addEventListener('click', (e) => { if (e.target === settings) closeSettings(); }); // clic sullo sfondo
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !settings.hidden) closeSettings(); });
  // link "Preferenze cookie" ovunque nel sito: <a href="#cookie-settings">
  document.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a[href$="#cookie-settings"]')) { e.preventDefault(); openSettings(); }
  });

  // ---- avvio
  if (debug) maybeLoadGtm(defaults, true);
  const stored = load();
  if (stored) {
    window.gtag('consent', 'update', stored);
    maybeLoadGtm(stored);
    trigger.hidden = false;
  } else {
    setTimeout(() => { banner.hidden = false; }, delay * 1000);
  }
}

export {};
