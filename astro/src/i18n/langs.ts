// Lingue del sito. L'italiano è la lingua principale (senza prefisso nell'indirizzo); le altre hanno /<lingua>/.
// Per aggiungere una lingua: inserirla qui (e in astro.config.mjs → i18n.locales), poi i testi fissi in ui.ts.
export const DEFAULT_LANG = 'it';
export const TRANSLATIONS = ['en', 'es', 'de'] as const;
export const LANGS = [DEFAULT_LANG, ...TRANSLATIONS] as const;
export type Lang = (typeof LANGS)[number];
/** og:locale */
export const LOCALES: Record<string, string> = { it: 'it_IT', en: 'en_US', es: 'es_ES', de: 'de_DE' };
export const LANG_NAMES: Record<string, string> = { it: 'Italiano', en: 'English', es: 'Español', de: 'Deutsch' };
/** prefisso dell'indirizzo: '' per l'italiano, '/en' per l'inglese */
export const prefix = (lang: string) => (lang === DEFAULT_LANG ? '' : `/${lang}`);
