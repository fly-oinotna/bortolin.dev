// GET /api/site-icon (solo sviluppo): l'icona del sito caricata in Impostazioni → Generale,
// usata come favicon del pannello e come logo nella sidebar di Keystatic.
import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import { read } from '../../lib/content';
import { iconFile } from '../../lib/icon';

export const prerender = false;

export const GET: APIRoute = async () => {
  const settings = await read('settings');
  try {
    const { file, type } = iconFile(settings.general.icon);
    return new Response(new Uint8Array(readFileSync(file)), { headers: { 'Content-Type': type, 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Icona non trovata', { status: 404 });
  }
};
