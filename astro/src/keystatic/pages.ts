// Pagine selezionabili nei campi "Destinazione" dei link.
// - pagine a layout fisso (Home, servizi…): elenco qui sotto, da aggiornare quando se ne aggiunge una
// - Pagine e Post creati da Keystatic: letti in automatico dai file dei contenuti
const FIXED = [
  { value: '#contatti', label: 'Modulo contatti (in questa pagina)' },
  { value: '/', label: 'Home' },
  { value: '/servizi/', label: 'Servizi' },
  { value: '/servizi/siti-web/', label: 'Servizi › Siti web chiavi in mano' },
  { value: '/servizi/consulenza-seo/', label: 'Servizi › Consulenza SEO' },
  { value: '/servizi/miglioramento-prestazioni-siti-web/', label: 'Servizi › Performance & Lighthouse' },
  { value: '/servizi/integrazione-ai/', label: 'Servizi › Integrazione AI' },
  { value: '/servizi/google-ads/', label: 'Servizi › Google Ads' },
  { value: '/servizi/ai-ads/', label: 'Servizi › AI Ads' },
  { value: '/servizi/meta-ads/', label: 'Servizi › Meta Ads' },
  { value: '/servizi/consulenza-digitale/', label: 'Servizi › Consulenza digitale' },
  { value: '/servizi/sviluppatore-freelance-per-web-agency/', label: 'Servizi › Per le web agency' },
  { value: '/casi-studio/', label: 'Casi studio' },
  { value: '/blog/', label: 'Blog' },
];

const slugOf = (path: string) => path.split('/').pop()!.replace(/\.json$/, '');
const fromFiles = (files: Record<string, unknown>, prefix: string, url: (slug: string) => string) =>
  Object.entries(files)
    .map(([path, data]: [string, any]) => ({ value: url(slugOf(path)), label: `${prefix} › ${data?.title || slugOf(path)}` }))
    .sort((a, b) => a.label.localeCompare(b.label, 'it'));

const pageFiles = import.meta.glob('/src/content/it/pages/*.json', { eager: true, import: 'default' });
const postFiles = import.meta.glob('/src/content/it/posts/*.json', { eager: true, import: 'default' });
const caseFiles = import.meta.glob('/src/content/it/casi-studio/*.json', { eager: true, import: 'default' });

export const PAGES = [
  ...FIXED,
  ...fromFiles(pageFiles, 'Pagine', (s) => `/${s}/`),
  ...fromFiles(caseFiles, 'Casi studio', (s) => `/casi-studio/${s}/`),
  ...fromFiles(postFiles, 'Post', (s) => `/blog/${s}/`),
];

/** Valore della voce "Altro indirizzo…" */
export const CUSTOM = 'custom';
