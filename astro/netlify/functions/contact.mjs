// Modulo contatti → e-mail con Postmark (Netlify Function, indirizzo /api/contact).
//
// Variabili d'ambiente (Netlify → Site configuration → Environment variables, e .env in locale; MAI nel codice):
//   POSTMARK_SERVER_TOKEN   token del "Server" Postmark (obbligatorio)
//   CONTACT_TO              chi riceve le richieste      (predefinito: antonio@bortolin.dev)
//   CONTACT_FROM            mittente verificato su Postmark (predefinito: bortolin.dev <antonio@bortolin.dev>)
// Per i test senza inviare davvero: POSTMARK_SERVER_TOKEN=POSTMARK_API_TEST.

const TO = process.env.CONTACT_TO || 'antonio@bortolin.dev';
const FROM = process.env.CONTACT_FROM || 'bortolin.dev <antonio@bortolin.dev>';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
  const wantsJson = (req.headers.get('accept') || '').includes('application/json');
  // senza JavaScript: si torna alla pagina di provenienza, con l'esito nell'indirizzo
  const back = (ok) => {
    if (wantsJson) return Response.json({ ok }, { status: ok ? 200 : 400 });
    const ref = req.headers.get('referer') || '/';
    const url = new URL(ref, req.url);
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

  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    console.error('[contact] POSTMARK_SERVER_TOKEN mancante');
    return back(false);
  }

  const rows = [
    ['Nome', d.name], ['E-mail', d.email], ['Telefono', d.phone], ['Sito attuale', d.website],
    ['Argomenti', d.topics.join(', ')], ['Lingua', d.lang.toUpperCase()], ['Pagina', d.page],
  ].filter(([, v]) => v);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (d.message ? `\n\nMessaggio:\n${d.message}` : '');
  const html = `<table cellpadding="6" style="border-collapse:collapse;font:15px/1.5 sans-serif">${rows
    .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`)
    .join('')}</table>${d.message ? `<p style="font:15px/1.6 sans-serif;white-space:pre-wrap;margin-top:16px">${esc(d.message)}</p>` : ''}`;

  try {
    const res = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': token },
      body: JSON.stringify({
        From: FROM,
        To: TO,
        ReplyTo: `${d.name.replace(/[<>",]/g, '')} <${d.email}>`,
        Subject: `Nuova richiesta da bortolin.dev: ${d.name}`,
        TextBody: text,
        HtmlBody: html,
        MessageStream: 'outbound',
        Tag: 'contatti',
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || out.ErrorCode) {
      console.error('[contact] Postmark:', res.status, out.ErrorCode, out.Message);
      return back(false);
    }
    return back(true);
  } catch (e) {
    console.error('[contact] errore di rete:', e?.message);
    return back(false);
  }
};

export const config = { path: '/api/contact' };
