// PANNELLO DEI CLIENTI (window.__bdClient, impostato da page.astro): niente "SEO e strumenti" e "Configurazione",
// niente "Elimina" nella mediateca e "Crea redirect"; nome del cliente ed "Esci" nella sidebar.
// È solo l'interfaccia: i permessi veri li controlla il server (keystatic-api.ts, media-api.ts, translate-api.ts…).
const client = (window as any).__bdClient as { name: string; email: string } | null;

const HIDDEN_GROUPS = ['seo e strumenti', 'configurazione'];
const HIDDEN_KEYS = /\/singleton\/(?:[a-z]{2}_)?(cookies|google|redirects|reviews|schemaMarkup|settings)$/;

const CSS = `
.bd-client [data-act="delete"], .bd-client [data-act="redirect"] { display: none !important; }
.bd-who { margin: 0 12px 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 8px; font: 13px/1.3 var(--kui-typography-font-family-base, system-ui, sans-serif); color: var(--kui-color-foreground-neutral-secondary); }
.bd-who a { color: var(--kui-color-foreground-neutral-emphasis); font-weight: 600; text-decoration: none; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--kui-color-border-muted); }
.bd-who a:hover { border-color: var(--bd-accent); }
`;

function hide() {
  // voci delle sezioni riservate
  document.querySelectorAll<HTMLAnchorElement>('nav a[href*="/singleton/"]').forEach((a) => {
    if (HIDDEN_KEYS.test(a.getAttribute('href') ?? '')) (a.closest('li') ?? a).setAttribute('hidden', '');
  });
  // titoli dei gruppi "SEO e strumenti" e "Configurazione"
  document.querySelectorAll<HTMLElement>('nav *').forEach((el) => {
    if (el.children.length === 0 && HIDDEN_GROUPS.includes(el.textContent?.trim().toLowerCase() ?? '')) {
      const group = el.closest('div, section, li') ?? el;
      // si nasconde il gruppo intero solo se non contiene voci consentite
      const visible = [...group.querySelectorAll('a')].some((a) => !a.closest('[hidden]'));
      (visible ? el : group).setAttribute('hidden', '');
    }
  });
  // nome ed "Esci", sotto i pulsanti dell'AI (o sotto le lingue)
  const anchor = document.querySelector('.bd-ai') ?? document.querySelector('.bd-lang');
  if (anchor && !document.querySelector('.bd-who')) {
    const box = document.createElement('div');
    box.className = 'bd-who';
    box.innerHTML = `<span></span><a href="/admin/login?esci">Esci</a>`;
    box.querySelector('span')!.textContent = client!.name;
    anchor.after(box);
  }
}

if (client) {
  document.documentElement.classList.add('bd-client');
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  new MutationObserver(hide).observe(document.body, { childList: true, subtree: true });
  hide();
}
