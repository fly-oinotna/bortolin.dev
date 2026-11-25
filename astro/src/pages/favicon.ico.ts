// /favicon.ico (16, 32, 48 px) generato a ogni build dall'icona del sito (Impostazioni → Generale)
import type { APIRoute } from 'astro';
import { read } from '../lib/content';
import { iconIco } from '../lib/icon';

export const GET: APIRoute = async () => {
  const settings = await read('settings');
  const ico = await iconIco(settings.general.icon);
  return new Response(new Uint8Array(ico), { headers: { 'Content-Type': 'image/x-icon' } });
};
