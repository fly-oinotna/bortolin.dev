// LINGUA DEI COMANDI DEL PANNELLO. Gli admin usano sempre l'italiano; i clienti la lingua scelta in Utenti
// (window.__bdClient.lang, impostato da page.astro). Si traducono solo i comandi: Dashboard, Richieste, Utenti,
// pulsanti AI, Pubblica, messaggi… Le etichette dei campi (keystatic.config.ts) restano nella lingua in cui sono scritte.
//   t('Testo italiano')                     → testo nella lingua del pannello (dizionario in ui-strings.ts)
//   t('{n} pagine in {l} lingue', { n, l }) → con i valori al posto di {n} e {l}
// Un testo che manca nel dizionario resta in italiano.
import { STRINGS } from './ui-strings';

export type UiLang = 'it' | 'en' | 'es' | 'de';
export const UI_LANGS: Record<UiLang, string> = { it: 'Italiano', en: 'English', es: 'Español', de: 'Deutsch' };

export function uiLang(): UiLang {
  const l = typeof window !== 'undefined' ? (window as any).__bdClient?.lang : undefined;
  return l && l in UI_LANGS ? l : 'it';
}

/** lingua di Keystatic (i suoi comandi già tradotti) */
export const keystaticLocale = () => ({ it: 'it-IT', en: 'en-US', es: 'es-ES', de: 'de-DE' })[uiLang()];
/** formati di date e numeri */
export const fmtLocale = () => ({ it: 'it-IT', en: 'en-GB', es: 'es-ES', de: 'de-DE' })[uiLang()];

export function t(it: string, vars?: Record<string, string | number>): string {
  const lang = uiLang();
  let out = lang === 'it' ? it : STRINGS[it]?.[lang] ?? it;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return out;
}
