// Immagini social automatiche (1200×630) per le pagine senza "OG Image personalizzata".
// Stesso stile delle immagini fatte a mano: sfondo nero, logo, etichetta verde, titolo e (se c'è) la foto o lo screenshot.
// satori disegna il modello in SVG con il testo già convertito in tracciati; sharp lo trasforma in JPG.
// Funziona in sviluppo e nel build di Netlify, senza browser.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const fontFile = (w: number) => readFileSync(require.resolve(`@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff`));
let fonts: { name: string; data: Buffer; weight: 500 | 600 | 700 | 800; style: 'normal' }[] | undefined;
const loadFonts = () => (fonts ??= ([500, 600, 700, 800] as const).map((weight) => ({ name: 'Jakarta', data: fontFile(weight), weight, style: 'normal' as const })));

const GREEN = '#99EA48';
type Node = { type: string; props: Record<string, unknown> };
/** elemento per satori (ogni div con più figli usa display:flex) */
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({ type, props: { style, children, ...extra } });

export interface OgData {
  /** etichetta verde, es. "Blog · SEO" */
  eyebrow: string;
  title: string;
  /** testo in basso (es. "3 min di lettura · bortolin.dev/blog") */
  meta?: string;
  chips?: string[];
  /** foto a destra (articoli): percorso del file su disco */
  photo?: string;
  /** screenshot in una finestra del browser (casi studio) */
  screenshot?: { file: string; domain: string };
}

/** immagine del disco → data URI jpg ridimensionato (satori incorpora le immagini) */
async function dataUri(file: string, width: number, height: number) {
  const buf = await sharp(file).resize(width, height, { fit: 'cover', position: 'top' }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

/** dimensione del titolo in base alla lunghezza (deve stare in 2-3 righe) */
const titleSize = (t: string, narrow: boolean) => {
  const n = t.length;
  if (narrow) return n <= 45 ? 54 : n <= 75 ? 46 : 40;
  return n <= 40 ? 68 : n <= 70 ? 60 : 50;
};

export async function renderOg(d: OgData): Promise<Buffer> {
  const narrow = !!(d.photo || d.screenshot);
  const logo = h('div', { display: 'flex', alignItems: 'center', fontSize: 44, fontWeight: 800, letterSpacing: -1 }, [
    'bortolin',
    h('div', { display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 4, height: 82, padding: '0 16px', borderRadius: 999, background: GREEN, color: '#000', fontSize: 34 }, '.dev'),
  ]);
  const eyebrow = h('div', { display: 'flex', background: GREEN, color: '#000', fontSize: 22, fontWeight: 700, padding: '8px 20px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5 }, d.eyebrow);
  const title = h('div', { display: 'flex', marginTop: 22, fontSize: titleSize(d.title, narrow), lineHeight: 1.1, fontWeight: 800, letterSpacing: -1.5, color: '#fff' }, d.title);
  const chips = (d.chips ?? []).slice(0, narrow ? 2 : 4).map((c, i) =>
    h('div', { display: 'flex', flexShrink: 0, whiteSpace: 'nowrap', fontSize: narrow ? 21 : 24, fontWeight: 600, padding: narrow ? '11px 20px' : '12px 24px', borderRadius: 999, background: i === 0 ? GREEN : '#1f1f1f', color: i === 0 ? '#000' : '#fff' }, c));
  const bottom = h('div', { display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 34 },
    chips.length ? chips : d.meta ? [h('div', { display: 'flex', fontSize: 24, fontWeight: 500, color: '#b5b5b5' }, d.meta)] : []);
  const text = h('div', { position: 'absolute', top: 0, bottom: 0, left: 0, right: narrow ? (d.photo ? 470 : 500) : 0, display: 'flex', flexDirection: 'column', padding: '72px 80px 64px', paddingRight: narrow ? 40 : 80 }, [logo, h('div', { display: 'flex', alignItems: 'flex-start', marginTop: 'auto' }, [eyebrow]), title, bottom]);

  const layers: Node[] = [];
  if (!d.photo) layers.push(h('div', { position: 'absolute', right: -180, top: -160, width: 700, height: 700, borderRadius: 999, backgroundImage: 'radial-gradient(circle, rgba(153,234,72,0.28), rgba(153,234,72,0) 65%)' }));
  if (d.photo) {
    const src = await dataUri(d.photo, 520, 630);
    layers.push(h('img', { position: 'absolute', top: 0, right: 0, width: 520, height: 630, objectFit: 'cover' }, undefined, { src, width: 520, height: 630 }));
    layers.push(h('div', { position: 'absolute', top: 0, right: 0, width: 520, height: 630, backgroundImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.55) 22%, rgba(0,0,0,0) 55%)' }));
  }
  if (d.screenshot) {
    const src = await dataUri(d.screenshot.file, 560, 350);
    const dot = (c: string) => h('div', { width: 13, height: 13, borderRadius: 99, background: c });
    layers.push(h('div', { position: 'absolute', right: -40, top: 120, width: 560, display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden', border: '3px solid #333', background: '#111' }, [
      h('div', { display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', background: '#1c1c1e', color: '#d1d5db', fontSize: 18 }, [
        dot('#ff5f57'), dot('#febc2e'), dot('#28c840'),
        h('div', { display: 'flex', marginLeft: 14, background: '#2c2c2e', borderRadius: 8, padding: '4px 16px' }, d.screenshot.domain),
      ]),
      h('img', { width: 554, height: 346, objectFit: 'cover' }, undefined, { src, width: 554, height: 346 }),
    ]));
  }

  const root = h('div', { width: 1200, height: 630, display: 'flex', position: 'relative', background: '#000', color: '#fff', fontFamily: 'Jakarta' }, [...layers, text]);
  const svg = await satori(root as any, { width: 1200, height: 630, fonts: loadFonts() });
  return sharp(Buffer.from(svg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
}
