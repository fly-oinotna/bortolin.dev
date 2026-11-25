import { rich } from './rich';
// Blog: categorie e tempo di lettura (≈200 parole al minuto, come nel sito statico)
import { t } from '../i18n/ui';
/** nome della categoria nella lingua (src/i18n/ui.ts → categories) */
export const categoryLabel = (c: string, lang = 'it') => (t(lang).categories as Record<string, string>)[c] ?? c;


/** Minuti di lettura: parole del testo (introduzione compresa) / 200, minimo 2 (come il sito statico) */
export function readingTime(content: { lead?: string | null; text?: any }) {
  const plain = `${content.lead ?? ''} ${rich(content.text, { paragraph: ' ' })}`.replace(/<[^>]+>/g, ' ');
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.ceil(words / 200));
}
