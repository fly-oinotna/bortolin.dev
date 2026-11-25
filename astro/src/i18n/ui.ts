// Testi fissi dell'interfaccia (non modificabili dal pannello), una voce per lingua.
// Una lingua nuova va aggiunta qui con TUTTE le voci dell'italiano.
const it = {
  projectsBefore: 'Oltre',
  projectsAfter: 'progetti',
  yearsSuffix: '+',
  yearsAfter: 'anni di esperienza',
  home: 'Home',
  breadcrumb: 'Percorso',
  newTab: ' (si apre in una nuova scheda)',
  fromBlog: 'Dal blog',
  readingTime: 'min di lettura',
  caseStudy: 'Caso studio',
  page: 'Pagina',
  // conto alla rovescia delle offerte (main.js)
  countdown: { days: 'Mancano {n} giorni', last: 'Ultimo giorno!' },
  // categorie del blog
  categories: {
    'siti-web': 'Siti web', seo: 'SEO', performance: 'Performance', ai: 'AI',
    advertising: 'Advertising', digitalizzazione: 'Digitalizzazione', dati: 'Dati',
  } as Record<string, string>,
  // marcatura AI delle immagini (AI Act, art. 50) — Media → Marcatura AI
  aiBadge: { ai: 'AI', modified: 'Modificata con AI', generated: 'Generata con AI' },
};

const en: typeof it = {
  projectsBefore: 'Over',
  projectsAfter: 'projects',
  yearsSuffix: '+',
  yearsAfter: 'years of experience',
  home: 'Home',
  breadcrumb: 'Breadcrumb',
  newTab: ' (opens in a new tab)',
  fromBlog: 'From the blog',
  readingTime: 'min read',
  caseStudy: 'Case study',
  page: 'Page',
  countdown: { days: '{n} days left', last: 'Last day!' },
  categories: {
    'siti-web': 'Websites', seo: 'SEO', performance: 'Performance', ai: 'AI',
    advertising: 'Advertising', digitalizzazione: 'Digital transformation', dati: 'Data',
  },
  aiBadge: { ai: 'AI', modified: 'Edited with AI', generated: 'AI-generated' },
};

const es: typeof it = {
  projectsBefore: 'Más de',
  projectsAfter: 'proyectos',
  yearsSuffix: '+',
  yearsAfter: 'años de experiencia',
  home: 'Inicio',
  breadcrumb: 'Ruta de navegación',
  newTab: ' (se abre en una pestaña nueva)',
  fromBlog: 'Del blog',
  readingTime: 'min de lectura',
  caseStudy: 'Caso de éxito',
  page: 'Página',
  countdown: { days: 'Quedan {n} días', last: '¡Último día!' },
  categories: {
    'siti-web': 'Páginas web', seo: 'SEO', performance: 'Rendimiento', ai: 'IA',
    advertising: 'Publicidad', digitalizzazione: 'Digitalización', dati: 'Datos',
  },
  aiBadge: { ai: 'IA', modified: 'Editada con IA', generated: 'Generada con IA' },
};

const de: typeof it = {
  projectsBefore: 'Über',
  projectsAfter: 'Projekte',
  yearsSuffix: '+',
  yearsAfter: 'Jahre Erfahrung',
  home: 'Startseite',
  breadcrumb: 'Brotkrumennavigation',
  newTab: ' (öffnet in einem neuen Tab)',
  fromBlog: 'Aus dem Blog',
  readingTime: 'Min. Lesezeit',
  caseStudy: 'Fallstudie',
  page: 'Seite',
  countdown: { days: 'Noch {n} Tage', last: 'Letzter Tag!' },
  categories: {
    'siti-web': 'Websites', seo: 'SEO', performance: 'Performance', ai: 'KI',
    advertising: 'Werbung', digitalizzazione: 'Digitalisierung', dati: 'Daten',
  },
  aiBadge: { ai: 'KI', modified: 'Mit KI bearbeitet', generated: 'Mit KI erstellt' },
};

export const ui = { it, en, es, de };

export type UiLang = keyof typeof ui;
export const t = (lang: string) => ui[(lang in ui ? lang : 'it') as UiLang];
