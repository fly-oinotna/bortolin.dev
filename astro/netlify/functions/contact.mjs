// Modulo contatti (Netlify Function, indirizzo /api/contact):
//   1. la richiesta viene SALVATA in Netlify Blobs (archivio "richieste"): la vedi nel pannello → Richieste,
//      anche se l'email non dovesse partire;
//   2. l'email arriva con Resend (gratis fino a 3.000 email al mese), con "Rispondi a" = chi ha scritto.
//
// Variabili d'ambiente (Netlify e .env; MAI nel codice):
//   RESEND_API_KEY   chiave di Resend (dominio bortolin.dev verificato in Resend → Domains)
//   CONTACT_TO       chi riceve le richieste   (predefinito: antonio@bortolin.dev)
//   CONTACT_FROM     mittente                  (predefinito: bortolin.dev <noreply@bortolin.dev>)
import { getStore } from '@netlify/blobs';

const TO = process.env.CONTACT_TO || 'antonio@bortolin.dev';
const FROM = process.env.CONTACT_FROM || 'bortolin.dev <noreply@bortolin.dev>';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  const wantsJson = (req.headers.get('accept') || '').includes('application/json');
  // senza JavaScript: si torna alla pagina di provenienza, con l'esito nell'indirizzo
  const back = (ok) => {
    if (wantsJson) return Response.json({ ok }, { status: ok ? 200 : 400 });
    const url = new URL(req.headers.get('referer') || '/', req.url);
    url.searchParams.set(ok ? 'inviato' : 'errore', '1');
    url.hash = 'contatti';
    return Response.redirect(url.toString(), 303);
  };

  let f;
  try { f = await req.formData(); } catch { return back(false); }

  // campo trappola: lo compilano solo i bot → fingiamo che sia andato tutto bene
  if (clip(f.get('company_url'), 200)) return back(true);

  const d = {
    name: clip(f.get('name'), 120),
    email: clip(f.get('email'), 200),
    phone: clip(f.get('phone'), 40),
    website: clip(f.get('website'), 200),
    topics: f.getAll('topics[]').map((t) => clip(t, 60)).filter(Boolean).slice(0, 10),
    message: clip(f.get('message'), 5000),
    page: clip(f.get('page'), 300),
    lang: clip(f.get('lang'), 5) || 'it',
  };
  if (!d.name || !EMAIL.test(d.email) || !d.phone || !f.get('privacy')) return back(false);

  // 1. salvataggio (prima di tutto: è la garanzia che nessuna richiesta vada persa)
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
  let saved = false;
  try {
    await getStore({ name: 'richieste', consistency: 'strong' }).setJSON(id, { id, ...d, status: 'nuova', notes: '', createdAt: new Date().toISOString() });
    saved = true;
  } catch (e) {
    console.error('[contact] salvataggio non riuscito:', e?.message);
  }

  // 2. email con Resend
  const rows = [
    ['Nome', d.name], ['E-mail', d.email], ['Telefono', d.phone], ['Sito attuale', d.website],
    ['Argomenti', d.topics.join(', ')], ['Lingua', d.lang.toUpperCase()], ['Pagina', d.page],
  ].filter(([, v]) => v);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (d.message ? `\n\nMessaggio:\n${d.message}` : '') + '\n\nGestisci la richiesta: https://bortolin.dev/admin';
  const html = `<table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 sans-serif">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>${d.message ? `<p style="font:15px/1.6 sans-serif;white-space:pre-wrap;margin-top:16px">${esc(d.message)}</p>` : ''}<p style="font:13px sans-serif;color:#666;margin-top:24px">Gestisci la richiesta nel <a href="https://bortolin.dev/admin">pannello → Richieste</a>.</p>`;

  let sent = false;
  const key = process.env.RESEND_API_KEY;
  if (!key) console.error('[contact] RESEND_API_KEY mancante: richiesta salvata, email non inviata');
  else {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: FROM,
          to: [TO],
          reply_to: `${d.name.replace(/[<>",]/g, '')} <${d.email}>`,
          subject: `Nuova richiesta da bortolin.dev: ${d.name}`,
          text,
          html,
          tags: [{ name: 'tipo', value: 'contatti' }],
        }),
      });
      if (res.ok) sent = true;
      else console.error('[contact] Resend:', res.status, (await res.text()).slice(0, 300));
    } catch (e) {
      console.error('[contact] errore di rete:', e?.message);
    }
  }
  if (saved && !sent) {
    // la richiesta c'è, ma l'email no: lo si annota per il pannello
    try { await getStore({ name: 'richieste', consistency: 'strong' }).setJSON(id, { id, ...d, status: 'nuova', notes: '', emailFailed: true, createdAt: new Date().toISOString() }); } catch { /* già salvata */ }
  }
  return back(saved || sent);
};

export const config = { path: '/api/contact' };
