// /icons/32.png · /icons/180.png · /icons/192.png · /icons/512.png generate dall'icona del sito a ogni build
import type { APIRoute, GetStaticPaths } from 'astro';
import { read } from '../../lib/content';
import { ICON_SIZES, iconPng } from '../../lib/icon';

export const getStaticPaths: GetStaticPaths = () => ICON_SIZES.map((size) => ({ params: { size: String(size) } }));

export const GET: APIRoute = async ({ params }) => {
  const settings = await read('settings');
  const png = await iconPng(settings.general.icon, Number(params.size));
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
