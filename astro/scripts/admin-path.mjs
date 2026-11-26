// Pannello su /admin invece di /keystatic: Keystatic ha il percorso scritto nel codice (router, login, redirect).
// Questo script lo riscrive nei file installati di @keystatic/* (le API restano su /api/keystatic).
// Idempotente: si lancia prima di "dev" e "build" (package.json), quindi vale anche dopo ogni npm install su Netlify.
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ADMIN = '/admin';
const dirs = ['node_modules/@keystatic/core/dist', 'node_modules/@keystatic/astro/dist'];
let changed = 0;
for (const dir of dirs) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.js')) continue;
    const file = join(dir, name);
    const src = readFileSync(file, 'utf8');
    const out = src
      // riparazione di una versione precedente di questo script (aveva toccato anche la regex delle API)
      .replace(/\\\/api\\\/admin\\\//g, '\\/api\\/keystatic\\/')
      // "/keystatic", `/keystatic/branch/…`, '/keystatic/setup'… ma non "/api/keystatic"
      .replace(/(?<!api\\?)\/keystatic(?=[\/'"`?])/g, ADMIN)
      // il router toglie il prefisso con una regex: /^\/keystatic\/?/ (ma non quella delle API: /^\/api\/keystatic\/?/)
      .replace(/(?<!api)\\\/keystatic\\\//g, '\\/admin\\/');
    if (out !== src) { writeFileSync(file, out); changed++; }
  }
}
// in sviluppo Vite tiene una copia pre-compilata dei pacchetti: se è cambiato qualcosa va rifatta
if (changed) for (const d of ['node_modules/.vite', 'node_modules/.vite-dev']) rmSync(d, { recursive: true, force: true });
console.log(changed ? `[admin] pannello spostato su ${ADMIN} (${changed} file di Keystatic aggiornati)` : `[admin] pannello già su ${ADMIN}`);
