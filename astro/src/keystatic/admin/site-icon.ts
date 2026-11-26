// GET /api/site-icon (online: l'icona del sito pubblicato): l'icona del sito caricata in Impostazioni → Generale,
// usata come favicon del pannello e come logo nella sidebar di Keystatic.
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { read } from '../../lib/content';
import { iconFile } from '../../lib/icon';
import { REMOTE } from './workspace';

export const prerender = false;

export const GET: APIRoute = async () => {
  // online i file dei contenuti non ci sono: basta l'icona del sito pubblicato
  if (REMOTE) return new Response(null, { status: 302, headers: { Location: '/favicon.ico' } });
  const settings = await read('settings');
  try {
    const { file, type } = iconFile(settings.general.icon);
    return new Response(new Uint8Array(readFileSync(file)), { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Icona non trovata', { status: 404 });
  }
};
