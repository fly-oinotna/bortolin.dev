// /api/users — clienti che possono entrare nel pannello con email e password. SOLO ADMIN (GitHub).
//   GET                                       → { items: [{ email, name, active, createdAt, lastLogin }] }
//   POST   { email, name, password, lang? }   → crea
//   PATCH  { email, name?, password?, active?, lang? } → modifica / reimposta password / disattiva / lingua
//   DELETE { email }                          → elimina
import type { APIRoute } from 'astro';
import { hashPassword, json, users, whoIs } from './auth';
import { authorize, errorResponse, REMOTE } from './workspace';

export const prerender = false;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** lingue del pannello */
const LANGS = ['it', 'en', 'es', 'de'] as const;
const langOf = (l: unknown) => (LANGS as readonly string[]).includes(String(l)) ? (l as (typeof LANGS)[number]) : undefined;

/** solo gli admin: in sviluppo chiunque, online chi è entrato con GitHub (verificato) */
async function adminOnly(request: Request) {
  const who = await whoIs(request);
  if (who?.role !== 'admin') return json({ error: 'Solo gli amministratori possono gestire gli utenti.' }, 403);
  if (REMOTE) { try { await authorize(request); } catch (e) { return errorResponse(e); } }
  return null;
}
const pub = (u: any) => ({ email: u.email, name: u.name, active: u.active, createdAt: u.createdAt, lastLogin: u.lastLogin ?? null, lang: u.lang ?? 'it' });

export const GET: APIRoute = async ({ request }) => {
  const deny = await adminOnly(request); if (deny) return deny;
  const list = (await users.list()).sort((a, b) => a.name.localeCompare(b.name));
  return json({ items: list.map(pub) });
};

export const POST: APIRoute = async ({ request }) => {
  const deny = await adminOnly(request); if (deny) return deny;
  const b = await request.json().catch(() => ({}));
  if (!EMAIL.test(String(b.email)) || !String(b.name ?? '').trim()) return json({ error: 'Nome ed email validi sono obbligatori.' }, 400);
  if (String(b.password ?? '').length < 10) return json({ error: 'La password deve avere almeno 10 caratteri.' }, 400);
  if (await users.get(b.email)) return json({ error: 'Esiste già un utente con questa email.' }, 409);
  await users.set({ email: b.email, name: String(b.name).trim(), passwordHash: hashPassword(b.password), active: true, createdAt: new Date().toISOString(), lang: langOf(b.lang) ?? 'it' });
  return json({ ok: true });
};

export const PATCH: APIRoute = async ({ request }) => {
  const deny = await adminOnly(request); if (deny) return deny;
  const b = await request.json().catch(() => ({}));
  const u = await users.get(String(b.email ?? ''));
  if (!u) return json({ error: 'Utente non trovato.' }, 404);
  if (typeof b.name === 'string' && b.name.trim()) u.name = b.name.trim();
  if (typeof b.active === 'boolean') u.active = b.active;
  if (langOf(b.lang)) u.lang = langOf(b.lang);
  if (b.password !== undefined) {
    if (String(b.password).length < 10) return json({ error: 'La password deve avere almeno 10 caratteri.' }, 400);
    u.passwordHash = hashPassword(String(b.password));
  }
  await users.set(u);
  return json({ ok: true, item: pub(u) });
};

export const DELETE: APIRoute = async ({ request }) => {
  const deny = await adminOnly(request); if (deny) return deny;
  const b = await request.json().catch(() => ({}));
  await users.remove(String(b.email ?? ''));
  return json({ ok: true });
};
