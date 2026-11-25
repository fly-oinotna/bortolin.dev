// Manifest per l'icona su Android/Chrome ("aggiungi a schermata Home")
import type { APIRoute } from 'astro';
import { read } from '../lib/content';

export const GET: APIRoute = async () => {
  const s = await read('settings');
  const manifest = {
    name: s.general.siteName, short_name: s.general.siteName, start_url: '/', display: 'browser',
    background_color: '#ffffff', theme_color: '#000000',
    icons: [192, 512].map((n) => ({ src: `/icons/${n}.png`, sizes: `${n}x${n}`, type: 'image/png' })),
  };
  return new Response(JSON.stringify(manifest), { headers: { 'Content-Type': 'application/manifest+json' } });
};
