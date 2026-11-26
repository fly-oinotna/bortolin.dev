// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import keystaticAdmin from './src/keystatic/admin/integration.mjs';
import tailwindcss from '@tailwindcss/vite';

// Pannello Keystatic su /admin (con badge SEO, mediateca, traduzioni):
// - in sviluppo salva i contenuti come file nel progetto;
// - online (Netlify) salva su GitHub nel ramo "contenuti" e il sito si aggiorna con "Pubblica" (src/keystatic/admin/workspace.ts).
// Le pagine del sito restano statiche: solo /admin e /api/* diventano funzioni di Netlify (adapter).

// l'adapter serve solo alla build per Netlify: in sviluppo Astro serve già /admin e /api/* da solo
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://bortolin.dev',
  // imageCDN: false → le immagini restano quelle ottimizzate in build (/_astro/…), come prima dell'adapter
  adapter: isDev ? undefined : netlify({ imageCDN: false }),
  integrations: [react(), keystaticAdmin()],
  // CSS inline nella pagina (≈9 KB gzip): nessuna richiesta che blocca il rendering
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
  i18n: {
    locales: ['it', 'en', 'es', 'de'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },
});
