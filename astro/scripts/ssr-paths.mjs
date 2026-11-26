// Dopo la build: la funzione SSR di Netlify risponde SOLO al pannello e alle sue API.
// L'adapter la mette su "/*": ogni indirizzo inesistente passerebbe dalla funzione (più lento, e senza la 404 per lingua
// definita in _redirects). Le pagine del sito sono tutte statiche.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = '.netlify/v1/functions/ssr/ssr.mjs';
const PATHS = ['/admin', '/admin/*', '/api/keystatic/*', '/api/seo-status', '/api/site-icon', '/api/media', '/api/translate', '/api/publish'];

const src = readFileSync(FILE, 'utf8');
if (src.includes(`path: ${JSON.stringify(PATHS)}`)) {
  console.log('[ssr] percorsi già limitati al pannello');
} else {
  const out = src.replace(/path: '\/\*',/, `path: ${JSON.stringify(PATHS)},`);
  if (out === src) throw new Error(`[ssr] configurazione della funzione non trovata in ${FILE}: controlla l'adapter Netlify`);
  writeFileSync(FILE, out);
  console.log(`[ssr] funzione limitata a: ${PATHS.join(' ')}`);
}
