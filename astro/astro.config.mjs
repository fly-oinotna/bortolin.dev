// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystaticAdmin from './src/keystatic/admin/integration.mjs';
import tailwindcss from '@tailwindcss/vite';

// Keystatic (pannello /keystatic, con i badge SEO) serve solo in sviluppo: salva i contenuti come file nel progetto.
// In build il sito resta 100% statico, senza bisogno di un server.
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://bortolin.dev',
  integrations: [react(), ...(isDev ? [keystaticAdmin()] : [])],
  // CSS inline nella pagina (≈9 KB gzip): nessuna richiesta che blocca il rendering
  build: { inlineStylesheets: 'always' },
  vite: { plugins: [tailwindcss()] },
  i18n: {
    locales: ['it', 'en', 'es', 'de'],
    defaultLocale: 'it',
    routing: { prefixDefaultLocale: false },
  },
});
