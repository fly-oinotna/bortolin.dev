// UTENTI (solo admin): clienti che entrano nel pannello con email e password. Voce "Utenti" sotto "Impostazioni" e pagina
// /admin/…/utenti: crea, reimposta password, disattiva, elimina. Dati: /api/users.
import { adminBase } from './base';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const df = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const isPage = () => /^\/admin(?:\/branch\/[^/]+)?\/utenti\/?$/.test(location.pathname);
const href = () => `${adminBase()}/utenti`;
/** password sicura da 16 caratteri, senza caratteri ambigui */
const genPassword = () => { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%'; const a = crypto.getRandomValues(new Uint32Array(16)); return [...a].map((n) => c[n % c.length]).join(''); };

const CSS = `
.bd-users { padding: 32px; box-sizing: border-box; width: 100%; max-width: 1000px; display: grid; gap: 18px; font: 14px/1.5 var(--kui-typography-font-family-base, system-ui, sans-serif); color: var(--kui-color-foreground-neutral); }
.bd-users h2 { margin: 0; font-size: 20px; color: var(--kui-color-foreground-neutral-emphasis); }
.bd-users .muted { color: var(--kui-color-foreground-neutral-tertiary); font-size: 13px; }
.bd-users form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; align-items: end; padding: 16px; border: 1px solid var(--kui-color-border-muted); border-radius: 14px; background: var(--kui-color-background-surface); }
.bd-users label { display: grid; gap: 4px; font-size: 12px; font-weight: 600; }
.bd-users input { box-sizing: border-box; width: 100%; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--kui-color-border-muted); background: transparent; color: inherit; font: inherit; }
.bd-users button { all: unset; cursor: pointer; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--kui-color-border-muted); font-size: 13px; font-weight: 600; white-space: nowrap; }
.bd-users button.primary { background: var(--bd-accent); border-color: var(--bd-accent); color: var(--bd-on-accent); }
.bd-users .lab { display: flex; justify-content: space-between; align-items: baseline; }
.bd-users button.link { border: 0; padding: 2px 0; color: var(--kui-color-foreground-accent); font-size: 12px; }
.bd-users button.danger { color: #e5484d; }
.bd-users table { width: 100%; border-collapse: collapse; }
.bd-users th { text-align: left; font-size: 12px; color: var(--kui-color-foreground-neutral-tertiary); padding: 6px 8px; border-bottom: 1px solid var(--kui-color-border-muted); }
.bd-users td { padding: 10px 8px; border-bottom: 1px solid var(--kui-color-border-muted); vertical-align: middle; }
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
  try { items = (await api('GET')).items; } catch (e) { box.innerHTML = `<h2>Utenti</h2><p class="muted">${esc((e as Error).message)}</p>`; return; }
  box.innerHTML = `<div><h2>Utenti</h2><p class="muted">I clienti entrano su /admin/login con email e password: vedono contenuti, Dashboard e Richieste, possono pubblicare, ma non “SEO e strumenti”, “Configurazione” ed eliminazione di immagini. Gli amministratori entrano con GitHub.</p></div>
    <form><label>Nome<input name="name" required></label><label>Email<input name="email" type="email" required></label>
      <label><span class="lab">Password <button type="button" class="link" data-gen>genera</button></span><input name="password" required minlength="10" autocomplete="new-password"></label>
      <button type="submit" class="primary">Crea utente</button></form>
    ${note ? `<p class="muted" role="status">${note}</p>` : ''}
    ${items.length ? `<table><thead><tr><th>Nome</th><th>Email</th><th>Ultimo accesso</th><th></th></tr></thead><tbody>
      ${items.map((u) => `<tr class="${u.active ? '' : 'off'}" data-email="${esc(u.email)}"><td><b>${esc(u.name)}</b>${u.active ? '' : ' · disattivato'}</td><td>${esc(u.email)}</td><td>${u.lastLogin ? esc(df.format(new Date(u.lastLogin))) : '—'}</td>
      <td class="act"><button type="button" data-act="pw">Nuova password</button><button type="button" data-act="toggle">${u.active ? 'Disattiva' : 'Riattiva'}</button><button type="button" class="danger" data-act="del">Elimina</button></td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">Nessun cliente per ora.</p>'}`;

  const form = box.querySelector('form')!;
  form.querySelector('[data-gen]')!.addEventListener('click', () => { (form.password as HTMLInputElement).value = genPassword(); (form.password as HTMLInputElement).type = 'text'; });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (form.name as any).value, email = (form.email as HTMLInputElement).value, password = (form.password as HTMLInputElement).value;
    try { await api('POST', { name, email, password }); render(box, `Creato ${esc(email)}. Mandagli l’indirizzo bortolin.dev/admin/login e la password: <b>${esc(password)}</b> (copiala ora, non sarà più visibile).`); }
    catch (err) { alert((err as Error).message); }
  });
  box.querySelectorAll<HTMLTableRowElement>('tr[data-email]').forEach((tr) => {
    const email = tr.dataset.email!;
    tr.querySelector('[data-act="pw"]')!.addEventListener('click', async () => {
      const password = genPassword();
      if (!confirm(`Impostare una nuova password per ${email}?`)) return;
      try { await api('PATCH', { email, password }); render(box, `Nuova password per ${esc(email)}: <b>${esc(password)}</b> (copiala ora, non sarà più visibile).`); } catch (err) { alert((err as Error).message); }
    });
    tr.querySelector('[data-act="toggle"]')!.addEventListener('click', async () => {
      try { await api('PATCH', { email, active: tr.classList.contains('off') }); render(box); } catch (err) { alert((err as Error).message); }
    });
    tr.querySelector('[data-act="del"]')!.addEventListener('click', async () => {
      if (!confirm(`Eliminare l’utente ${email}? Non potrà più entrare.`)) return;
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
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue?.trim()) { n.nodeValue = first ? 'Utenti' : ''; first = false; }
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
  box.innerHTML = '<p class="muted">Caricamento…</p>';
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
