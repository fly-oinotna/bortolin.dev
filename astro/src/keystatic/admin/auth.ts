// ACCESSI AL PANNELLO
//   - admin: account GitHub (Keystatic in modalità GitHub, cookie "keystatic-gh-access-token"); in sviluppo tutti sono admin
//   - clienti: email e password (pagina /admin/login), creati dagli admin nella pagina "Utenti"
// I clienti non hanno accesso a GitHub: il server salva per loro con l'app GitHub di Keystatic (appToken).
// Sezioni vietate ai clienti: "SEO e strumenti" e "Configurazione" (CLIENT_DENIED), eliminazione di immagini.
import { createHmac, randomBytes, scryptSync, timingSafeEqual, createSign } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface User { email: string; name: string; passwordHash: string; active: boolean; createdAt: string; lastLogin?: string; /** lingua del pannello (comandi; i campi restano in italiano) */ lang?: 'it' | 'en' | 'es' | 'de' }
export type Who = { role: 'admin'; user?: undefined } | { role: 'cliente'; user: User };

const REMOTE = !import.meta.env.DEV;
const COOKIE = 'bd-session';
const DAYS = 7;
const secret = () => import.meta.env.KEYSTATIC_SECRET || process.env.KEYSTATIC_SECRET || 'solo-sviluppo-locale';

/** file dei contenuti che i clienti NON possono modificare (gruppi "SEO e strumenti" e "Configurazione", in ogni lingua) */
export const CLIENT_DENIED = /^src\/content\/[a-z]{2}\/(settings|cookies|google|redirects|reviews|schema-markup)\.json$/;
/** chiavi Keystatic corrispondenti (per le traduzioni) */
export const CLIENT_DENIED_KEYS = ['settings', 'cookies', 'google', 'redirects', 'reviews', 'schemaMarkup'];

// ---------------------------------------------------------------- utenti (Netlify Blobs online, file locale in sviluppo)
const LOCAL_FILE = join(process.cwd(), 'node_modules', '.cache', 'bd-users.json');
const localAll = (): Record<string, User> => { try { return JSON.parse(readFileSync(LOCAL_FILE, 'utf8')); } catch { return {}; } };
const localSave = (all: Record<string, User>) => { mkdirSync(dirname(LOCAL_FILE), { recursive: true }); writeFileSync(LOCAL_FILE, JSON.stringify(all, null, 2)); };
const blobs = async () => (await import('@netlify/blobs')).getStore('utenti');
const keyOf = (email: string) => email.trim().toLowerCase();

export const users = {
  async list(): Promise<User[]> {
    if (!REMOTE) return Object.values(localAll());
    const s = await blobs();
    const { blobs: list } = await s.list();
    return (await Promise.all(list.map((b) => s.get(b.key, { type: 'json' })))).filter(Boolean) as User[];
  },
  async get(email: string): Promise<User | null> {
    if (!REMOTE) return localAll()[keyOf(email)] ?? null;
    return ((await (await blobs()).get(keyOf(email), { type: 'json' })) as User) ?? null;
  },
  async set(u: User) {
    u.email = keyOf(u.email);
    if (!REMOTE) { const all = localAll(); all[u.email] = u; localSave(all); return; }
    await (await blobs()).setJSON(u.email, u);
  },
  async remove(email: string) {
    if (!REMOTE) { const all = localAll(); delete all[keyOf(email)]; localSave(all); return; }
    await (await blobs()).delete(keyOf(email));
  },
};

// ---------------------------------------------------------------- password (scrypt) e sessione (cookie firmato)
export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 64).toString('hex')}`;
}
export function checkPassword(pw: string, stored: string) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex'), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
const sign = (v: string) => createHmac('sha256', secret()).update(v).digest('base64url');

export function sessionCookie(email: string) {
  const payload = Buffer.from(JSON.stringify({ e: keyOf(email), x: Date.now() + DAYS * 86400_000 })).toString('base64url');
  return `${COOKIE}=${payload}.${sign(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${REMOTE ? '; Secure' : ''}`;
}
export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${REMOTE ? '; Secure' : ''}`;

/** cliente collegato (cookie valido, utente attivo) */
export async function clientOf(request: Request): Promise<User | null> {
  const m = (request.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [payload, sig] = m[1].split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() > x) return null;
    const u = await users.get(e);
    return u?.active ? u : null;
  } catch { return null; }
}

const hasGithub = (request: Request) => /(?:^|;\s*)keystatic-gh-access-token=/.test(request.headers.get('cookie') ?? '');

/** chi sta usando il pannello: cliente (cookie di sessione) oppure admin (GitHub; in sviluppo chiunque) */
export async function whoIs(request: Request): Promise<Who | null> {
  const c = await clientOf(request);
  if (c) return { role: 'cliente', user: c };
  if (!REMOTE || hasGithub(request)) return { role: 'admin' };
  return null;
}

// ---------------------------------------------------------------- token dell'app GitHub (per salvare per conto dei clienti)
let app: { token: string; exp: number } | null = null;
let installationId: string | null = null;

export async function appToken(owner: string, repo: string): Promise<string> {
  if (app && app.exp > Date.now() + 5 * 60_000) return app.token;
  const id = import.meta.env.GITHUB_APP_ID || process.env.GITHUB_APP_ID;
  const key = (import.meta.env.GITHUB_APP_PRIVATE_KEY || process.env.GITHUB_APP_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!id || !key.includes('PRIVATE KEY')) throw Object.assign(new Error('Accesso clienti non configurato: mancano GITHUB_APP_ID e GITHUB_APP_PRIVATE_KEY.'), { status: 500 });
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iat: now - 60, exp: now + 540, iss: id })}`;
  const jwt = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(key).toString('base64url')}`;
  const H = { Authorization: `Bearer ${jwt}`, Accept: 'application/vnd.github+json', 'User-Agent': 'bortolin.dev-admin' };
  if (!installationId) {
    const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/installation`, { headers: H });
    if (!r.ok) throw Object.assign(new Error(`App GitHub non installata sul repository (${r.status}).`), { status: 500 });
    installationId = String((await r.json()).id);
  }
  const r = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, { method: 'POST', headers: H });
  const out = await r.json();
  if (!r.ok) throw Object.assign(new Error(`Token dell'app GitHub non ottenuto (${r.status}).`), { status: 500 });
  app = { token: out.token, exp: new Date(out.expires_at).getTime() };
  return app.token;
}

/** risposta JSON */
export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', ...headers } });

/** login: verifica email e password */
export async function login(email: string, password: string) {
  const u = await users.get(email);
  if (!u?.active || !checkPassword(password, u.passwordHash)) return null;
  u.lastLogin = new Date().toISOString();
  await users.set(u);
  return u;
}

