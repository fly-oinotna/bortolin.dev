// /api/auth — accesso dei clienti al pannello (email e password)
//   POST   { email, password } → imposta il cookie di sessione
//   DELETE                     → esce (cancella il cookie)
//   GET                        → { role, name } di chi è collegato
import type { APIRoute } from 'astro';
import { clearCookie, json, login, sessionCookie, whoIs } from './auth';

export const prerender = false;

// piccolo freno ai tentativi ripetuti (per istanza della funzione)
const attempts = new Map<string, { n: number; until: number }>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: any;
  try { body = await request.json(); } catch { return json({ error: 'Richiesta non valida' }, 400); }
  const key = `${clientAddress}|${String(body.email).toLowerCase()}`;
  const a = attempts.get(key);
  if (a && a.n >= 5 && Date.now() < a.until) return json({ error: 'Troppi tentativi: riprova tra qualche minuto.' }, 429);
  const u = await login(String(body.email ?? ''), String(body.password ?? ''));
  if (!u) {
    attempts.set(key, { n: (a?.n ?? 0) + 1, until: Date.now() + 10 * 60_000 });
    return json({ error: 'Email o password non corrette.' }, 401);
  }
  attempts.delete(key);
  return json({ ok: true, name: u.name }, 200, { 'Set-Cookie': sessionCookie(u.email) });
};

export const DELETE: APIRoute = async () => json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });

export const GET: APIRoute = async ({ request }) => {
  const who = await whoIs(request);
  return json(who ? { role: who.role, name: who.user?.name ?? null } : { role: null });
};
