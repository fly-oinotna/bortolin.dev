// UTENTI (solo admin): clienti che entrano nel pannello con email e password. Voce "Utenti" sotto "Impostazioni" e pagina
// /admin/…/utenti: crea, reimposta password, disattiva, elimina. Dati: /api/users.
import { adminBase } from './base';
import { t, fmtLocale, UI_LANGS } from './ui-i18n';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const df = new Intl.DateTimeFormat(fmtLocale(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const isPage = () => /^\/admin(?:\/branch\/[^/]+)?\/utenti\/?$/.test(location.pathname);
const href = () => `${adminBase()}/utenti`;
/** password sicura da 16 caratteri, senza caratteri ambigui */
const genPassword = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%'; const a = crypto.getRandomValues(new Uint32Array(16)); return [...a].map((n) => c[n % c.length]).join(''); };

const CSS = `
.bd-users { padding: 32px; box-sizing: border-box; width: 100%; max-width: 1000px; display: grid; gap: 18px; font: 14px/1.5 var(--kui-typography-font-family-base, system-ui, sans-serif); color: var(--kui-color-foreground-neutral); }
.bd-users h2 { margin: 0; font-size: 20px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-users .muted { color: var(--kui-color-foreground-neutral-tertiary); font-size: 13px; }
.bd-users form { display: grid; grid-template-columns: 1fr 1fr 1fr 140px auto; gap: 8px; align-items: end; padding: 16px; border: 1px solid var(--kui-color-border-muted); border-radius: 14px; background: var(--kui-color-background-surface); }
.bd-users label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; }
.bd-users input, .bd-users select { box-sizing: border-box; width: 100%; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--kui-color-border-muted); background: transparent; color: inherit; font: inherit; }
.bd-users button { all: unset; cursor: pointer; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--kui-color-border-muted); font-size: 13px; font-weight: 600; white-space: nowrap; }
.bd-users button.primary { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); }
.bd-users .lab { display: flex; justify-content: space-between; align-items: baseline; }
.bd-users button.link { border: 0; padding: 2px 0; color: var(--kui-color-foreground-accent); font-size: 12px; }
.bd-users button.danger { color: #e5484d; }
.bd-users table { width: 100%; border-collapse: collapse; }
.bd-users th { text-align: left; font-size: 12px; color: var(--kui-color-foreground-neutral-tertiary); padding: 6px 8px; border-bottom: 1px solid var(--kui-color-border-muted); }
.bd-users td { padding: 10px 8px; border-bottom: 1px solid var(--kui-color-border-muted); vertical-align: middle; }
.bd-users td select { width: auto; padding: 5px 8px; }
.bd-users td.act { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.bd-users .off { opacity: .5; }
@media (max-width: 860px) { .bd-users form { grid-template-columns: 1fr; } }
[data-bd-users-host] > :not(.bd-users) { display: none !important; }
`;

async function api(method: string, body?: object) {
  const r = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(out.error || `Errore ${r.status}`);
  return out;
}

async function render(box: HTMLElement, note = '') {
  let items: any[] = [];
  try { items = (await api('GET')).items; } catch (e) { box.innerHTML = `<h2>${esc(t('Utenti'))}</h2><p class="muted">${esc((e as Error).message)}</p>`; return; }
  const langOptions = (sel: string) => Object.entries(UI_LANGS).map(([k, l]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${l}</option>`).join('');
  box.innerHTML = `<div><h2>${esc(t('Utenti'))}</h2><p class="muted">${esc(t('I clienti entrano su /admin/login con email e password: vedono contenuti, Dashboard e Richieste, possono pubblicare, ma non “SEO e strumenti”, “Configurazione” ed eliminazione di immagini. Gli amministratori entrano con GitHub. La lingua vale per i comandi del pannello; i campi restano come sono scritti.'))}</p></div>
    <form><label>${esc(t('Nome'))}<input name="name" required></label><label>Email<input name="email" type="email" required></label>
      <label><span class="lab">Password <button type="button" class="link" data-gen>${esc(t('genera'))}</button></span><input name="password" required minlength="10" autocomplete="new-password"></label>
      <label>${esc(t('Lingua del pannello'))}<select name="lang">${langOptions('it')}</select></label>
      <button type="submit" class="primary">${esc(t('Crea utente'))}</button></form>
    ${note ? `<p class="muted" role="status">${note}</p>` : ''}
    ${items.length ? `<table><thead><tr><th>${esc(t('Nome'))}</th><th>Email</th><th>${esc(t('Lingua'))}</th><th>${esc(t('Ultimo accesso'))}</th><th></th></tr></thead><tbody>
      ${items.map((u) => `<tr class="${u.active ? '' : 'off'}" data-email="${esc(u.email)}"><td><b>${esc(u.name)}</b>${u.active ? '' : ` · ${esc(t('disattivato'))}`}</td><td>${esc(u.email)}</td>
      <td><select data-act="lang" aria-label="${esc(t('Lingua del pannello'))}">${langOptions(u.lang ?? 'it')}</select></td><td>${u.lastLogin ? esc(df.format(new Date(u.lastLogin))) : '—'}</td>
      <td class="act"><button type="button" data-act="pw">${esc(t('Nuova password'))}</button><button type="button" data-act="toggle">${esc(t(u.active ? 'Disattiva' : 'Riattiva'))}</button><button type="button" class="danger" data-act="del">${esc(t('Elimina'))}</button></td></tr>`).join('')}
      </tbody></table>` : `<p class="muted">${esc(t('Nessun cliente per ora.'))}</p>`}`;

  const form = box.querySelector('form')!;
  form.querySelector('[data-gen]')!.addEventListener('click', () => { (form.password as HTMLInputElement).value = genPassword(); (form.password as HTMLInputElement).type = 'text'; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (form.name as any).value, email = (form.email as HTMLInputElement).value, password = (form.password as HTMLInputElement).value, lang = (form.lang as HTMLSelectElement).value;
    try { await api('POST', { name, email, password, lang }); render(box, `${esc(t('Creato {email}. Mandagli l’indirizzo {url} e la password:', { email, url: `${location.host}/admin/login` }))} <b>${esc(password)}</b> (${esc(t('copiala ora, non sarà più visibile'))}).`); }
    catch (err) { alert((err as Error).message); }
  });
  box.querySelectorAll<HTMLTableRowElement>('tr[data-email]').forEach((tr) => {
    const email = tr.dataset.email!;
    tr.querySelector('[data-act="pw"]')!.addEventListener('click', async () => {
      const password = genPassword();
      if (!confirm(t('Impostare una nuova password per {email}?', { email }))) return;
      try { await api('PATCH', { email, password }); render(box, `${esc(t('Nuova password per {email}:', { email }))} <b>${esc(password)}</b> (${esc(t('copiala ora, non sarà più visibile'))}).`); } catch (err) { alert((err as Error).message); }
    });
    tr.querySelector<HTMLSelectElement>('[data-act="lang"]')!.addEventListener('change', async (e) => {
      try { await api('PATCH', { email, lang: (e.target as HTMLSelectElement).value }); } catch (err) { alert((err as Error).message); render(box); }
    });
    tr.querySelector('[data-act="toggle"]')!.addEventListener('click', async () => {
      try { await api('PATCH', { email, active: tr.classList.contains('off') }); render(box); } catch (err) { alert((err as Error).message); }
    });
    tr.querySelector('[data-act="del"]')!.addEventListener('click', async () => {
      if (!confirm(t('Eliminare l’utente {email}? Non potrà più entrare.', { email }))) return;
      try { await api('DELETE', { email }); render(box); } catch (err) { alert((err as Error).message); }
    });
  });
}

function sync() {
  // voce "Utenti" nella sidebar, nel gruppo "Configurazione" sotto "Impostazioni"
  const settings = [...document.querySelectorAll<HTMLAnchorElement>('nav a[href*="/singleton/"]')].find((a) => /\/singleton\/(?:[a-z]{2}_)?settings$/.test(a.getAttribute('href') ?? ''));
  if (settings && !document.querySelector('.bd-users-link')) {
    const li = settings.closest('li') ?? settings;
    const copy = li.cloneNode(true) as HTMLElement;
    const a = (copy.matches('a') ? copy : copy.querySelector('a')) as HTMLAnchorElement;
    a.classList.add('bd-users-link');
    a.href = href();
    a.removeAttribute('aria-current');
    const walker = document.createTreeWalker(a, NodeFilter.SHOW_TEXT);
    let first = true;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue?.trim()) { n.nodeValue = first ? t('Utenti') : ''; first = false; }
    a.addEventListener('click', (e) => { e.preventDefault(); history.pushState(null, '', href()); dispatchEvent(new PopStateEvent('popstate')); });
    li.after(copy);
  }
  const link = document.querySelector('.bd-users-link');
  if (link) { if (isPage()) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); }

  const host = document.querySelector<HTMLElement>('#keystatic-main-panel > :last-child');
  const existing = document.querySelector<HTMLElement>('.bd-users');
  if (!isPage() || !host) { existing?.remove(); document.querySelectorAll('[data-bd-users-host]').forEach((h) => h.removeAttribute('data-bd-users-host')); return; }
  if (existing && existing.parentElement === host) return;
  existing?.remove();
  host.setAttribute('data-bd-users-host', '');
  const box = document.createElement('div');
  box.className = 'bd-users';
  box.innerHTML = `<p class="muted">${esc(t('Caricamento…'))}</p>`;
  host.append(box);
  render(box);
}

if (!(window as any).__bdClient) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  addEventListener('popstate', () => setTimeout(sync, 50));
  sync();
}
