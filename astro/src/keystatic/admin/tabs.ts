// Tab verticali a sinistra in stile ACF (placement: left) per le pagine fatte solo di gruppi (Home, Impostazioni…).
// Cambia solo la visualizzazione: i dati non vengono toccati. Ricorda l'ultima tab aperta per ogni pagina;
// una tab con un campo non valido diventa rossa e, al salvataggio, si apre da sola.

const CSS = `
.bd-tabs-host { display: grid !important; grid-template-columns: 210px minmax(0, 1fr); gap: 32px; align-items: start; }
.bd-tabs { position: sticky; top: 16px; display: flex; flex-direction: column; gap: 2px; padding-top: 0;
  font: 500 14px/1.3 var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif); }
.bd-tabs button { all: unset; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
  padding: 9px 12px; border-left: 3px solid transparent; border-radius: 0 6px 6px 0; cursor: pointer; color: inherit; opacity: .75; }
.bd-tabs button:hover { opacity: 1; background: rgba(127,127,127,.12); }
.bd-tabs button[aria-selected="true"] { opacity: 1; font-weight: 700; border-left-color: var(--bd-accent); background: color-mix(in srgb, transparent, var(--bd-accent) 14%); }
.bd-tabs button:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: -2px; }
.bd-tabs button.bd-tab-error { color: #f44336; opacity: 1; }
.bd-tabs button.bd-tab-error::after { content: "●"; font-size: 10px; }
.bd-tab-hidden { display: none !important; }
/* con le tab il gruppo aperto parte in alto, allineato alla prima tab (Keystatic gli dà margin-block) */
.bd-tabs-host > div:not(.bd-tabs) > * > [role="group"] { margin-block: 0 !important; }
.bd-tabs-host > div:not(.bd-tabs) > * > [role="group"] > div:empty { display: none !important; }
.bd-tab-heading { display: none !important; }
`;

const storeKey = () => `bd-tab:${location.pathname}`;
const load = () => { try { return Number(localStorage.getItem(storeKey()) ?? 0) || 0; } catch { return 0; } };
const save = (i: number) => { try { localStorage.setItem(storeKey(), String(i)); } catch { /* storage non disponibile */ } };

let active = load();
let lastPath = location.pathname;

function topGrid(form: HTMLElement) {
  return Array.from(form.querySelectorAll<HTMLElement>('div')).find((d) => getComputedStyle(d).display === 'grid' && !d.classList.contains('bd-tabs-host')) ?? null;
}

function setup() {
  if (location.pathname !== lastPath) { lastPath = location.pathname; active = load(); }
  // singleton (#singleton-form) o voce di una collection (Pagine, Post): il modulo dentro il pannello principale
  const form = document.getElementById('singleton-form') ?? document.querySelector<HTMLElement>('main form');
  if (!form) return;
  const grid = topGrid(form);
  if (!grid) return;
  const allCells = Array.from(grid.children).filter((c) => !c.classList.contains('bd-tabs')) as HTMLElement[];
  // i gruppi diventano tab; i campi fuori dai gruppi (es. il titolo di pagine e post) restano sempre visibili sopra
  const cells = allCells.filter((c) => c.querySelector(':scope > [role="group"]'));
  const groups = cells.map((c) => c.querySelector<HTMLElement>(':scope > [role="group"]'));
  if (cells.length < 2) return;

  const labels = groups.map((g) => {
    const heading = document.getElementById(g!.getAttribute('aria-labelledby') ?? '');
    heading?.classList.add('bd-tab-heading');
    return heading?.textContent?.trim() || '—';
  });
  if (active >= cells.length) active = 0;

  const host = grid.parentElement!;
  host.classList.add('bd-tabs-host');
  let nav = host.querySelector<HTMLElement>(':scope > .bd-tabs');
  if (!nav || nav.dataset.labels !== labels.join('|')) {
    nav?.remove();
    nav = document.createElement('nav');
    nav.className = 'bd-tabs';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-orientation', 'vertical');
    nav.dataset.labels = labels.join('|');
    labels.forEach((label, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.textContent = label;
      b.addEventListener('click', () => { active = i; save(i); setup(); });
      nav!.appendChild(b);
    });
    host.insertBefore(nav, grid);
  }

  const buttons = Array.from(nav.children) as HTMLButtonElement[];
  cells.forEach((cell, i) => {
    cell.classList.toggle('bd-tab-hidden', i !== active);
    buttons[i]?.setAttribute('aria-selected', String(i === active));
    buttons[i]?.classList.toggle('bd-tab-error', !!cell.querySelector('[aria-invalid="true"]'));
  });
}

/** Dopo un salvataggio con errori, apre la prima tab che contiene un campo non valido */
function jumpToError() {
  setTimeout(() => {
    const nav = document.querySelector('.bd-tabs');
    if (!nav) return;
    const buttons = Array.from(nav.children) as HTMLButtonElement[];
    setup();
    const i = buttons.findIndex((b) => b.classList.contains('bd-tab-error'));
    if (i >= 0 && i !== active) { active = i; save(i); setup(); }
  }, 350);
}

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
document.addEventListener('submit', jumpToError, true);
document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button');
  if (b && (b.getAttribute('form') || ['Save', 'Salva', 'Guardar', 'Speichern'].includes(b.textContent?.trim() ?? ''))) jumpToError();
}, true);

let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; setup(); });
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-invalid'] });
setup();

export {}; // modulo: le variabili restano locali al file
