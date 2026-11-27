// Pulsante "Pubblica sul sito" (solo nel pannello online, vedi publish-api.ts).
// I salvataggi del pannello vanno nel ramo "contenuti"; il sito cambia solo quando si preme questo pulsante.
// Si aggiorna da solo ogni 20 secondi e quando si torna sulla scheda del browser.

import { deployBadge } from './project';
import { t } from './ui-i18n';

type State = { enabled?: boolean; commits?: number; files?: string[]; error?: string };

const LIVE_BRANCH = 'main';
const WORK_BRANCH = 'contenuti';

// se Keystatic apre il ramo del sito, si torna su quello dei contenuti
const guardBranch = () => {
  const m = location.pathname.match(/^\/admin\/branch\/([^/]+)(.*)$/);
  if (m && decodeURIComponent(m[1]) === LIVE_BRANCH) location.replace(`/admin/branch/${WORK_BRANCH}${m[2]}`);
};

/** "src/content/en/servizi/siti-web.json" → "EN · servizi/siti-web" */
const label = (f: string) => {
  const m = f.match(/^src\/content\/([a-z]{2})\/(.+)\.json$/);
  if (m) return `${m[1].toUpperCase()} · ${m[2]}`;
  if (f.startsWith('src/assets/images/')) return `${t('Immagine')} · ${f.split('/').pop()}`;
  return f;
};

function mount() {
  const box = document.createElement('div');
  box.className = 'bd-publish';
  box.innerHTML = `<style>
    .bd-publish{position:fixed;right:20px;bottom:20px;z-index:2147483000;font:600 14px/1.2 system-ui,-apple-system,sans-serif}
    .bd-publish button{display:flex;align-items:center;gap:10px;border:0;border-radius:999px;padding:12px 18px;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.18);background:var(--bd-accent);color:var(--bd-on-accent)}
    .bd-publish button[hidden]{display:none}
    .bd-publish button[disabled]{cursor:default;background:#f1f1f1;color:#555;box-shadow:0 2px 10px rgba(0,0,0,.08)}
    .bd-publish .n{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--bd-on-accent);color:var(--bd-accent);font-size:12px}
    .bd-publish .msg{position:absolute;right:0;bottom:56px;width:300px;padding:12px 14px;border-radius:12px;background:#000;color:#fff;font-weight:500;line-height:1.4;box-shadow:0 6px 24px rgba(0,0,0,.25)}
    .bd-publish .msg[hidden]{display:none}
    .bd-publish .deploy{position:absolute;right:0;bottom:54px;display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:var(--kui-color-background-surface,#fff);box-shadow:0 2px 10px rgba(0,0,0,.15);font-weight:500;font-size:12px;white-space:nowrap}
    .bd-publish .deploy[hidden]{display:none}
    .bd-publish .deploy img{display:block}
  </style><p class="msg" hidden role="status"></p><div class="deploy" hidden></div><button type="button" hidden></button>`;
  document.body.append(box);
  const btn = box.querySelector('button')!;
  const msg = box.querySelector<HTMLElement>('.msg')!;
  const deploy = box.querySelector<HTMLElement>('.deploy')!;
  // dopo "Pubblica": il badge di Netlify si aggiorna ogni 10 s per 5 minuti (In corso → Riuscito / Errore)
  const watchDeploy = () => {
    const draw = () => { deploy.innerHTML = `<span>Deploy</span>${deployBadge()}`; };
    deploy.hidden = false; draw();
    const timer = setInterval(draw, 10000);
    setTimeout(() => { clearInterval(timer); deploy.hidden = true; }, 5 * 60 * 1000);
  };
  let state: State = {};
  let busy = false;

  const say = (text: string, ms = 6000) => { msg.textContent = text; msg.hidden = false; if (ms) setTimeout(() => { msg.hidden = true; }, ms); };
  const render = () => {
    if (!state.enabled) { btn.hidden = true; return; }
    btn.hidden = false;
    const n = state.files?.length ?? 0;
    btn.disabled = busy || n === 0;
    btn.title = n ? state.files!.map(label).join('\n') : '';
    btn.innerHTML = busy ? t('Pubblicazione…') : n ? `${t('Pubblica sul sito')} <span class="n">${n}</span>` : `${t('Tutto pubblicato')} ✓`;
  };
  const refresh = async () => {
    try {
      const res = await fetch('/api/publish', { cache: 'no-store' });
      state = await res.json();
      if (!res.ok) state = { enabled: false };
    } catch { /* offline: si riprova al prossimo giro */ }
    render();
  };

  btn.addEventListener('click', async () => {
    const files = state.files ?? [];
    const list = files.slice(0, 10).map((f) => `• ${label(f)}`).join('\n') + (files.length > 10 ? `\n${t('… e altri {n}', { n: files.length - 10 })}` : '');
    if (!confirm(`${t('Pubblicare sul sito {n} file modificati?', { n: files.length })}\n\n${list}\n\n${t('Il sito si aggiorna in 1–2 minuti.')}`)) return;
    busy = true; render();
    try {
      const res = await fetch('/api/publish', { method: 'POST' });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || t('Errore {n}', { n: res.status }));
      say(t('Pubblicato! Il sito si sta aggiornando: sarà online in 1–2 minuti.'));
      setTimeout(watchDeploy, 6000); // dopo il messaggio, il badge dello stato del deploy
    } catch (e) {
      say(t('Pubblicazione non riuscita: {e}', { e: (e as Error).message }), 0);
    } finally {
      busy = false;
      await refresh();
    }
  });

  refresh();
  setInterval(() => { guardBranch(); if (!document.hidden && !busy) refresh(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
}

/**
 * Selettore del ramo e menu Git nascosti per tutti: si lavora sempre su "contenuti" e si pubblica col pulsante.
 * Si nasconde la riga che li contiene entrambi (il più piccolo contenitore comune).
 */
function hideBranchPicker() {
  const picker = document.querySelector<HTMLElement>('[aria-label="Current branch"], [aria-label="Ramo attuale"]');
  const git = document.querySelector<HTMLElement>('[aria-label="git actions"]');
  if (!picker || picker.closest('[data-bd-git-hidden]')) return;
  let row: HTMLElement = picker;
  if (git) while (row.parentElement && !row.contains(git)) row = row.parentElement;
  if (row.querySelector('nav')) row = picker; // per sicurezza: mai la sidebar intera
  row.setAttribute('data-bd-git-hidden', '');
  row.style.display = 'none';
}

// solo nel pannello online (indirizzi /admin/branch/…)
if (location.pathname.startsWith('/admin/branch/')) {
  guardBranch(); mount();
  new MutationObserver(hideBranchPicker).observe(document.body, { childList: true, subtree: true });
  hideBranchPicker();
}
else if ((window as any).__bdClient) mount(); // clienti: pannello senza ramo nell'indirizzo, ma pubblicano anche loro
