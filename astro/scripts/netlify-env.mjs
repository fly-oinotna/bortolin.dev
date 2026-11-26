// Carica su Netlify le variabili d'ambiente del sito, leggendole dal file .env (che resta solo sul tuo computer).
//
//   npm run env:netlify -- --dry   → mostra quali variabili verrebbero caricate (senza i valori)
//   npm run env:netlify            → le carica (sovrascrive quelle già presenti con lo stesso nome)
//
// Prima volta: `netlify login` e, dentro la cartella astro, `netlify link` (scegli il progetto bortolin.dev).
// Dopo il caricamento serve un nuovo deploy perché le variabili PUBLIC_… entrano nel sito durante la build.
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

/** variabili usate dal sito: [nome, a cosa serve, obbligatoria] */
const KEYS = [
  ['GOOGLE_PLACES_API_KEY', 'recensioni Google', true],
  ['GOOGLE_PLACE_ID', 'scheda Google delle recensioni', true],
  ['POSTMARK_SERVER_TOKEN', 'modulo contatti (Postmark)', true],
  ['CONTACT_TO', 'destinatario del modulo contatti', false],
  ['CONTACT_FROM', 'mittente del modulo contatti', false],
  ['ANTHROPIC_API_KEY', 'traduzioni con AI nel pannello', true],
  ['KEYSTATIC_GITHUB_CLIENT_ID', 'accesso al pannello con GitHub', true],
  ['KEYSTATIC_GITHUB_CLIENT_SECRET', 'accesso al pannello con GitHub', true],
  ['KEYSTATIC_SECRET', 'accesso al pannello con GitHub', true],
  ['PUBLIC_KEYSTATIC_GITHUB_APP_SLUG', 'nome dell’app GitHub del pannello', true],
  ['GOOGLE_SERVICE_ACCOUNT', 'dati di Analytics e Search Console nella Dashboard', false],
];

const dry = process.argv.includes('--dry');

// lettura del .env: KEY=valore, con eventuale commento in fondo (" # …") e virgolette facoltative
const env = {};
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  let v = m[2].replace(/\s+#.*$/, '').trim();
  if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
  if (v) env[m[1]] = v;
}

const run = (args) => spawnSync('netlify', args, { encoding: 'utf8' });
if (!dry) {
  const st = run(['status']);
  if (st.status !== 0 || /not logged in|expired|Not linked|No project id/i.test(st.stdout + st.stderr)) {
    console.error('Netlify CLI non pronto: esegui `netlify login` e poi, nella cartella astro, `netlify link`.');
    process.exit(1);
  }
}

let missing = 0;
for (const [key, what, required] of KEYS) {
  const value = env[key];
  if (!value) {
    if (required) missing++;
    console.log(`${required ? '✗' : '·'} ${key.padEnd(34)} ${required ? 'MANCA nel .env' : 'non impostata (facoltativa)'} — ${what}`);
    continue;
  }
  if (dry) { console.log(`✓ ${key.padEnd(34)} pronta (${value.length} caratteri) — ${what}`); continue; }
  // il valore passa come argomento al CLI di Netlify, mai stampato a video
  const res = run(['env:set', key, value, '--force']);
  console.log(res.status === 0 ? `✓ ${key.padEnd(34)} caricata — ${what}` : `✗ ${key.padEnd(34)} errore: ${(res.stderr || res.stdout).trim().split('\n').pop()}`);
}
if (missing) console.log(`\n${missing} variabili obbligatorie mancano nel .env: aggiungile e rilancia.`);
if (!dry) console.log('\nFatto. Avvia un nuovo deploy su Netlify perché le variabili entrino nel sito.');
