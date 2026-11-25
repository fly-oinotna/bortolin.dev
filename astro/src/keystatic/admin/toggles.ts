// Switch "toggle" (src/keystatic/fields.ts): mostrano/nascondono A VIDEO i campi che li seguono nello stesso gruppo.
// I valori dei campi nascosti restano salvati: riaccendendo lo switch ricompaiono identici.
//
//  - toggle semplice: spento → nasconde tutto ciò che lo segue (anche altri switch più sotto)
//  - toggle "se/altrimenti" (seguito da un separatore `otherwise()`): i campi tra switch e separatore si vedono
//    con lo switch acceso, quelli dopo il separatore con lo switch spento

/** Cella della griglia di Keystatic che contiene l'elemento (un campo = una cella) */
function cellOf(el: Element): HTMLElement | null {
  let c = el as HTMLElement;
  while (c.parentElement && getComputedStyle(c.parentElement).display !== 'grid') c = c.parentElement;
  return c.parentElement ? c : null;
}

function apply() {
  // switch affiancato a un altro campo (es. Robots | Escludi dalla sitemap): allineato in basso, all'altezza del campo
  document.querySelectorAll<HTMLElement>('[data-bd-switch]').forEach((sw) => cellOf(sw)?.classList.add('bd-switch-cell'));

  const grids = new Set<HTMLElement>();
  const toggleCells = new Map<HTMLElement, HTMLElement>(); // cella → switch
  const elseCells = new Set<HTMLElement>();
  document.querySelectorAll<HTMLElement>('[data-bd-toggle]').forEach((t) => {
    const cell = cellOf(t);
    if (!cell?.parentElement) return;
    grids.add(cell.parentElement);
    toggleCells.set(cell, t);
  });
  document.querySelectorAll<HTMLElement>('[data-bd-else]').forEach((m) => { const cell = cellOf(m); if (cell) elseCells.add(cell); });

  grids.forEach((grid) => {
    const cells = Array.from(grid.children) as HTMLElement[];
    // a ogni separatore corrisponde lo switch che lo precede più da vicino
    const ifElse = new Set<HTMLElement>();
    let lastToggle: HTMLElement | null = null;
    for (const cell of cells) {
      if (toggleCells.has(cell)) lastToggle = cell;
      if (elseCells.has(cell) && lastToggle) ifElse.add(lastToggle);
    }

    let hideAll = false; // uno switch semplice spento più sopra
    let branch: { on: boolean; inElse: boolean } | null = null; // switch se/altrimenti in corso
    for (const cell of cells) {
      const isElse = elseCells.has(cell);
      if (isElse && branch) branch.inElse = true;
      const branchHides = !!branch && (branch.inElse ? branch.on : !branch.on);
      cell.classList.toggle('bd-toggle-hidden', isElse || hideAll || (branchHides && !isElse));
      const t = toggleCells.get(cell);
      if (t) {
        const on = t.dataset.on === 'true';
        if (ifElse.has(cell)) branch = { on, inElse: false };
        else if (!on) hideAll = true;
      }
    }
  });
}

document.head.appendChild(Object.assign(document.createElement('style'), { textContent: '.bd-toggle-hidden{display:none!important}.bd-switch-cell{align-self:end;padding-bottom:6px}' }));
let queued = false;
new MutationObserver(() => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; apply(); });
}).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-on'] });
apply();

export {}; // modulo: le variabili restano locali al file
