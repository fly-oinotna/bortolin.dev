// "Chiedi all'AI" (solo nel pannello): ChatGPT, Claude o Gemini in una finestra stretta a destra dello schermo,
// con il login del browser. Non sono incorporabili in un iframe (i tre siti lo vietano: X-Frame-Options),
// quindi si usa una finestra separata. Nota: i tre siti usano anche Cross-Origin-Opener-Policy, che taglia il legame
// con il pannello appena la chat si carica: il pannello non può riportare in primo piano una finestra già aperta,
// quindi ogni clic ne apre una nuova.
// Nessuna chiave API e nessun collegamento con i contenuti del sito.
const CHATS = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
];
const WIDTH = 480;

const CSS = `
.bd-ai { margin: 0 0 16px 24px; font: 600 11px/1.3 var(--kui-typography-font-family-base, system-ui, sans-serif); }
.bd-ai p { margin: 0 0 6px; text-transform: uppercase; letter-spacing: .05em; color: var(--kui-color-foreground-neutral-tertiary); }
.bd-ai div { display: flex; flex-wrap: wrap; gap: 6px; }
.bd-ai button { all: unset; cursor: pointer; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--kui-color-border-muted); color: var(--kui-color-foreground-neutral-secondary); font-size: 12px; }
.bd-ai button:hover { border-color: var(--bd-accent); color: var(--kui-color-foreground-neutral-emphasis); }
.bd-ai button:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 2px; }
`;

const windows: Record<string, Window | null> = {};
function openChat(c: (typeof CHATS)[number]) {
  const w = windows[c.id];
  if (w && !w.closed) { w.focus(); return; }
  const h = screen.availHeight;
  const left = (screen as any).availLeft + screen.availWidth - WIDTH;
  const top = (screen as any).availTop ?? 0;
  windows[c.id] = window.open(c.url, `bd-ai-${c.id}`, `popup=yes,width=${WIDTH},height=${h},left=${left},top=${top}`);
}

function mount() {
  const lang = document.querySelector('.bd-lang');
  if (!lang || document.querySelector('.bd-ai')) return;
  const box = document.createElement('div');
  box.className = 'bd-ai';
  box.innerHTML = '<p>Chiedi all’AI</p><div></div>';
  for (const c of CHATS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = c.label;
    b.title = `Apri ${c.label} in una finestra a lato`;
    b.addEventListener('click', () => openChat(c));
    box.lastElementChild!.append(b);
  }
  lang.after(box);
}

const style = document.createElement('style');
style.textContent = CSS;
document.head.append(style);
new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
mount();
