// Icona del sito (Impostazioni → Generale → Icona del sito): favicon, icona Apple/Android e logo del pannello.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

/** Dimensioni PNG generate a ogni build: /icons/<n>.png */
export const ICON_SIZES = [32, 48, 96, 180, 192, 512] as const;

/** File dell'icona sul disco, dal percorso salvato da Keystatic ("/src/assets/images/site/icon.svg") */
export function iconFile(path: string) {
  const file = join(process.cwd(), path.replace(/^\/+/, ''));
  const type = path.toLowerCase().endsWith('.svg') ? 'image/svg+xml'
    : /\.jpe?g$/i.test(path) ? 'image/jpeg' : path.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/png';
  return { file, type, isSvg: type === 'image/svg+xml' };
}

/** PNG quadrato della dimensione richiesta (gli SVG vengono rasterizzati ad alta densità) */
export async function iconPng(path: string, size: number) {
  const { file, isSvg } = iconFile(path);
  return sharp(readFileSync(file), isSvg ? { density: 512 } : {})
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/**
 * favicon.ico con più dimensioni (16, 32, 48 px) in un unico file.
 * Formato ICO con immagini PNG all'interno, supportato da tutti i browser e i servizi che cercano /favicon.ico.
 */
export async function iconIco(path: string, sizes = [16, 32, 48]) {
  const pngs = await Promise.all(sizes.map((n) => iconPng(path, n)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // riservato
  header.writeUInt16LE(1, 2); // tipo: icona
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map((png, i) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); // larghezza (0 = 256)
    e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1); // altezza
    e.writeUInt8(0, 2); // colori in palette
    e.writeUInt8(0, 3); // riservato
    e.writeUInt16LE(1, 4); // piani colore
    e.writeUInt16LE(32, 6); // bit per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs]);
}
