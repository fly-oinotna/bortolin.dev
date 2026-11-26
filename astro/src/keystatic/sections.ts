// Campi di ogni tipo di sezione, riutilizzabili in tutte le pagine.
// Nel pannello ogni sezione è un gruppo con il suo nome; i campi sono "piatti" e in ordine di lettura.
import { fields, type ComponentSchema } from '@keystatic/core';
import { counted } from './counted';
import { SEO_LIMITS, ROBOTS, ROBOTS_DEFAULT } from '../lib/seo';
import { t, ta, num, check, toggle, eyebrow, title, text, image, alt, button, destination, icon, repeater, texts, shared } from './fields';

/** Gruppo di una sezione nel pannello */
export const group = <S extends Record<string, ComponentSchema>>(label: string, schema: S, layout?: number[]) =>
  fields.object(schema, layout ? { label, layout } : { label });

/** Colonne del gruppo SEO: campi a tutta larghezza, i tre schema affiancati (33,333% ciascuno), markup personalizzato sotto */
export const SEO_LAYOUT = [12, 12, 12, 6, 6, 12, 4, 4, 4, 12, 12];

export const sections = {
  hero: () => ({
    eyebrow: eyebrow(),
    title: title('H1'),
    text: text(),
    ...button('cta'),
    ...button('link', 'Link'),
    highlights: texts('Punti di forza'),
    projectsValue: num('Progetti', 400),
    yearsValue: num('Anni di esperienza', 15),
    scoresTitle: t('Punteggi: titolo'),
    scores: repeater('Punteggi Lighthouse', { label: t('Nome'), value: num('Valore', 100) }, 'label'),
    boxTitle: t('Box: titolo'),
    boxText: text('Box: testo'),
  }),

  manifesto: () => ({
    line1: t('Riga 1'),
    line2: t('Riga 2 (verde)'),
    text: text(),
  }),

  servicesOverview: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    mainEyebrow: eyebrow(),
    mainTitle: title('H3'),
    mainText: text(),
    ...button('mainCta'),
    ...button('mainLink', 'Link'),
    includedTitle: t('Titolo elenco'),
    included: repeater('Cosa è incluso', { title: title(null), text: ta() }, 'title'),
    othersTitle: title('H3'),
    othersText: text(),
    othersMore: t('Link: testo'),
    others: repeater('Servizi', {
      icon: icon(), title: title('H3'), text: ta(), link: destination(), highlight: check('In evidenza'),
    }, 'title'),
    adsTitle: title('H3'),
    adsText: text(),
    ads: repeater('Advertising', { title: title(null), badge: t('Etichetta'), text: ta(), link: destination() }, 'title'),
  }),

  lighthouse: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    image: image('home'),
    imageAlt: alt(),
    scores: repeater('Punteggi', { title: title('H3'), value: num('Valore', 100), text: text() }, 'title'),
    cwvTitle: title('H3'),
    cwvText: text(),
    cwv: repeater('Core Web Vitals', { title: title(null), text: ta(), good: t('Valore buono') }, 'title'),
    testTitle: title('H3'),
    testText: text(),
    testPlaceholder: t('Campo: esempio'),
    testButton: t('Pulsante: testo'),
  }),

  /** Testo + immagine con riquadri numerati, box e nota (es. SEO) */
  textImagePillars: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    image: image('home'),
    imageAlt: alt(),
    pillars: repeater('Pilastri', { title: title(null), text: ta() }, 'title'),
    boxTitle: t('Box: titolo'),
    boxText: text('Box: testo'),
    note: text('Nota'),
  }),

  /** Testo + immagine con card a tutta larghezza sotto (es. Integrazione AI) */
  textImageCards: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    image: image('home'),
    imageAlt: alt(),
    cards: repeater('Soluzioni', { title: title('H3'), text: text() }, 'title'),
  }),

  benefits: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    items: repeater('Vantaggi', { icon: icon(), title: title('H3'), text: ta() }, 'title'),
  }),

  problems: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    items: texts('Frasi'),
  }),

  method: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    steps: repeater('Passi', { title: title('H3'), text: ta() }, 'title'),
  }),

  fit: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    yesTitle: title('H3'),
    yes: texts('Fa per te se'),
    noTitle: title('H3'),
    no: texts('Non fa per te se'),
  }),

  about: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    image: image('home'),
    imageAlt: alt(),
    stats: repeater('Numeri', { value: num('Numero'), suffix: t('Suffisso'), text: t('Testo'), animate: check('Contatore animato') }, 'text'),
  }),

  agency: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    image: image('home'),
    imageAlt: alt(),
    cards: repeater('Riquadri', { title: title('H3'), text: ta(), ...button('cta') }, 'title'),
  }),

  faq: () => ({
    eyebrow: eyebrow(),
    title: title('H2'),
    text: text(),
    items: repeater('Domande', { question: title(null, 'Domanda'), answer: text('Risposta') }, 'question'),
  }),

  /**
   * SEO della pagina: sempre l'ultimo gruppo, uguale in tutte le pagine (come AM Tools 3).
   * `page` = chiave della pagina, usata per la cartella del file Markdown.
   */
  seo: (page: string) => ({
    title: counted({ label: 'Meta Title', required: true, limits: SEO_LIMITS.title, ai: 'title' }),
    description: counted({ label: 'Meta Description', multiline: true, required: true, limits: SEO_LIMITS.description, ai: 'description' }),
    ogImage: image('social', 'OG Image personalizzata', { description: 'Se vuota viene generata in automatico dal titolo della pagina.', inherit: false }),
    robots: fields.select({ label: 'Robots', options: ROBOTS.map((r) => ({ value: r.value, label: r.label })), defaultValue: ROBOTS_DEFAULT }),
    sitemapExclude: check('Escludi dalla sitemap'),
    markdown: shared(fields.file({
      label: 'Markdown (llms.txt)',
      description: 'Facoltativo, solo file .md. Se presente, la voce di questa pagina in llms.txt punta al file invece che alla pagina.',
      directory: `public/markdown/${page}`,
      publicPath: `/markdown/${page}/`,
    })),
    aboutPage: check('Schema AboutPage'),
    contactPage: check('Schema ContactPage'),
    product: check('Schema Product'),
    customMarkup: toggle('Markup personalizzato'),
    customMarkupCode: ta('JSON-LD', 'Solo l’oggetto JSON-LD, senza <script>: il tag viene aggiunto in automatico.'),
  }),
};
