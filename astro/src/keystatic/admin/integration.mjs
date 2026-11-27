// Pannello Keystatic su /admin (in sviluppo e online) con le aggiunte SEO in stile AM Tools 3:
// stessa integrazione di @keystatic/astro, ma la pagina del pannello è la nostra (src/keystatic/admin/page.astro)
// ed endpoint in più: /api/seo-status (badge SEO) e /api/site-icon (icona del sito per favicon e sidebar).
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { siteCheck } from './site-check.mjs';

export default function keystaticAdmin() {
  return {
    name: 'keystatic-admin',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig, config, command }) => {
        updateConfig({
          server: config.server.host ? {} : { host: '127.0.0.1' },
          vite: {
            // il server di sviluppo usa una cache Vite tutta sua: così un `astro build` lanciato in parallelo
            // non la riscrive e il pannello non si rompe con l'errore "504 Outdated Optimize Dep"
            ...(command === 'dev' ? { cacheDir: 'node_modules/.vite-dev' } : {}),
            // MEDIATECA: caricare/eliminare immagini o salvare un testo alternativo NON deve ricaricare il pannello
            // (si perderebbero le modifiche non salvate). Vite non sorveglia queste cartelle: è media-api.ts ad aggiornare il sito.
            server: { watch: { ignored: ['**/src/assets/images/**', '**/src/content/media.json'] } },
            plugins: [{
              name: 'keystatic',
              resolveId(id) {
                if (id === 'virtual:keystatic-config') return this.resolve('./keystatic.config', './a');
                return null;
              },
            }, {
              // In sviluppo Astro tiene in memoria l'elenco delle pagine dei template ([slug].astro…):
              // quando dal pannello si crea, rinomina o elimina una voce, si "tocca" il template così l'elenco si aggiorna da solo.
              name: 'bd-content-watch',
              configureServer(server) {
                // la mediateca (media-api.ts) usa il server per aggiornare il sito senza ricaricare il pannello
                globalThis.__bdViteServer = server;
                const contentDir = fileURLToPath(new URL('./src/content/', config.root));
                const templates = ['./src/pages/[slug].astro', './src/pages/blog/[slug].astro', './src/pages/casi-studio/[slug].astro', './src/pages/[lang]/[...path].astro'].map((t) => fileURLToPath(new URL(t, config.root)));
                server.watcher.add(contentDir);
                const refresh = (file) => {
                  if (!file.startsWith(contentDir)) return;
                  for (const t of templates) server.watcher.emit('change', t);
                };
                server.watcher.on('add', refresh);
                server.watcher.on('unlink', refresh);
              },
            }],
            optimizeDeps: {
              entries: ['keystatic.config.*', '.astro/keystatic-imports.js'],
              // componenti di Keystar UI usati dai nostri campi (switch, pulsanti della mediateca): pre-compilati subito
              include: [
                '@keystatic/core', '@keystatic/core/content-components', '@keystatic/astro/ui', 'react', 'react-dom',
                '@keystar/ui/button', '@keystar/ui/switch', '@keystar/ui/icon', '@keystar/ui/icon/icons/highlighterIcon',
              ],
            },
          },
        });
        const dotAstroDir = new URL('./.astro/', config.root);
        mkdirSync(dotAstroDir, { recursive: true });
        writeFileSync(new URL('keystatic-imports.js', dotAstroDir), 'import "@keystatic/astro/ui";\nimport "@keystatic/astro/api";\nimport "@keystatic/core/ui";\n');
        injectRoute({ entrypoint: './src/keystatic/admin/page.astro', pattern: '/admin/[...params]', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/keystatic-api.ts', pattern: '/api/keystatic/[...params]', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/seo-status.ts', pattern: '/api/seo-status', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/site-icon.ts', pattern: '/api/site-icon', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/media-api.ts', pattern: '/api/media', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/translate-api.ts', pattern: '/api/translate', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/publish-api.ts', pattern: '/api/publish', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/google-api.ts', pattern: '/api/google-data', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/leads-api.ts', pattern: '/api/leads', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/ai-api.ts', pattern: '/api/ai', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/notfound-api.ts', pattern: '/api/not-found', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/lighthouse-api.ts', pattern: '/api/lighthouse', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/auth-api.ts', pattern: '/api/auth', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/users-api.ts', pattern: '/api/users', prerender: false });
        injectRoute({ entrypoint: './src/keystatic/admin/login.astro', pattern: '/admin/login', prerender: false });
      },
      // controllo del sito a ogni build: /_bd/site-check.json per la Dashboard (avvisa, non blocca)
      'astro:build:done': ({ dir, logger }) => {
        try {
          const { pages, problems, report } = siteCheck(fileURLToPath(dir));
          const parts = [['link rotti', report.brokenLinks.length], ['pagine con immagini senza alt', report.missingAlt.length], ['titoli duplicati', report.duplicateTitles.length], ['immagini pesanti', report.heavyImages.length]].filter(([, n]) => n).map(([l, n]) => `${n} ${l}`);
          logger.info(`controllo del sito: ${pages} pagine, ${problems ? `${problems} da sistemare (${parts.join(', ') || 'vedi la Dashboard'})` : 'tutto a posto'}`);
        } catch (e) {
          logger.warn(`controllo del sito non riuscito: ${e.message}`);
        }
      },
    },
  };
}
