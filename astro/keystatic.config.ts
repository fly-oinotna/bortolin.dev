import { config, collection, fields, singleton, type ComponentSchema } from '@keystatic/core';
import { createElement } from 'react';
import { t, ta, check, toggle, otherwise, eyebrow, title, text, longText, image, alt, button, destination, icon, repeater, texts, shared } from './src/keystatic/fields';
import { translatedSingletons, translatedCollections } from './src/keystatic/i18n';
import { group, sections as s, SEO_LAYOUT } from './src/keystatic/sections';
import { counted } from './src/keystatic/counted';
import { SEO_LIMITS } from './src/lib/seo';
import { blog } from './src/keystatic/blog';
import { sitiWeb, consulenzaSeo, performance, integrazioneAi, googleAds, aiAds, metaAds, consulenzaDigitale, webAgency, servizi, caseStudy, caseStudiesArchive } from './src/keystatic/servizi';
import { keystaticLocale } from './src/keystatic/admin/ui-i18n';

// ---------------------------------------------------------------------------
// Contenuti: src/content/<lingua>/*.json · Immagini: src/assets/images/*
// Criterio dei campi (come ACF): un gruppo per sezione, campi piatti,
// etichette standard (Etichetta, Titolo (H2), Testo…), SEO sempre in fondo.
// I testi comuni a tutte le pagine stanno in "Impostazioni".
// ---------------------------------------------------------------------------

const singletonJson = <S extends Record<string, ComponentSchema>>(label: string, file: string, schema: S) =>
  singleton({ label, path: `src/content/it/${file}`, format: { data: 'json' }, schema });

const link = () => ({ label: t('Testo'), link: destination() });

/** Categorie dei post (stesse del blog statico) */
const POST_CATEGORIES = [
  { value: 'siti-web', label: 'Siti web' }, { value: 'seo', label: 'SEO' }, { value: 'performance', label: 'Performance' },
  { value: 'ai', label: 'Intelligenza artificiale' }, { value: 'advertising', label: 'Advertising' },
  { value: 'digitalizzazione', label: 'Digitalizzazione' }, { value: 'dati', label: 'Dati e analytics' },
];
/** Testo obbligatorio */
const req = (label: string, description?: string) => fields.text({ label, description, validation: { isRequired: true } });

const COUNTRIES = [
  { value: 'IT', label: 'Italia' }, { value: 'AT', label: 'Austria' }, { value: 'DE', label: 'Germania' },
  { value: 'CH', label: 'Svizzera' }, { value: 'ES', label: 'Spagna' }, { value: 'FR', label: 'Francia' },
];
const BUSINESS_TYPES = [
  'LocalBusiness', 'ProfessionalService', 'Store', 'Restaurant', 'HealthAndBeautyBusiness', 'HomeAndConstructionBusiness',
  'LegalService', 'FinancialService', 'MedicalBusiness', 'AutomotiveBusiness', 'LodgingBusiness',
].map((v) => ({ value: v, label: v }));

// ================================================================ PAGINE STANDARD
// Template "pagina standard" (come page.php): titolo + testo libero + SEO. Si creano con "Add" e si duplicano con "Duplicate entry…".
// ======================================================= PAGINE E POST (come WordPress)
// Si creano con "Add", si duplicano con "Duplicate entry…". Titolo sempre in alto, poi le tab Contenuto e SEO.
const collections = {
  pages: collection({
    label: 'Pagine',
    slugField: 'title',
    path: 'src/content/it/pages/*',
    format: { data: 'json' },
    columns: [],
    schema: {
      title: fields.slug({ name: { label: 'Titolo (H1)', validation: { isRequired: true } }, slug: { label: 'Indirizzo', description: 'Es. informativa-sulla-privacy → /informativa-sulla-privacy/' } }),
      content: group('Contenuto', { text: longText() }),
      seo: group('SEO', s.seo('pages'), SEO_LAYOUT),
    },
  }),
  posts: collection({
    label: 'Post',
    slugField: 'title',
    path: 'src/content/it/posts/*',
    format: { data: 'json' },
    columns: [],
    schema: {
      title: fields.slug({ name: { label: 'Titolo (H1)', validation: { isRequired: true } }, slug: { label: 'Indirizzo', description: 'Es. quanto-costa-un-sito → /blog/quanto-costa-un-sito/' } }),
      content: group('Contenuto', {
        date: shared(fields.date({ label: 'Data di pubblicazione', defaultValue: { kind: 'today' }, validation: { isRequired: true } })),
        category: shared(fields.select({ label: 'Categoria', options: POST_CATEGORIES, defaultValue: 'siti-web' })),
        image: image('blog', 'Immagine in evidenza'),
        imageAlt: alt(),
        excerpt: fields.text({ label: 'Estratto', description: 'Riassunto mostrato nell’elenco degli articoli.', multiline: true, validation: { isRequired: true } }),
        lead: fields.text({ label: 'Introduzione', description: 'Primo paragrafo in evidenza, sopra il testo.', multiline: true }),
        text: longText(),
      }, [6, 6, 12, 12, 12, 12, 12]),
      seo: group('SEO', s.seo('posts'), SEO_LAYOUT),
    },
  }),
  caseStudies: collection({
    label: 'Casi studio',
    slugField: 'title',
    path: 'src/content/it/casi-studio/*',
    format: { data: 'json' },
    columns: [],
    schema: {
      title: fields.slug({ name: { label: 'Nome del progetto (H1)', validation: { isRequired: true } }, slug: { label: 'Indirizzo', description: 'Es. projsystem → /casi-studio/projsystem/' } }),
      ...caseStudy(),
    },
  }),
  offers: collection({
    label: 'Offerte',
    slugField: 'name',
    path: 'src/content/it/offerte/*',
    format: { data: 'json' },
    columns: ['name'],
    schema: {
      name: fields.slug({ name: { label: 'Nome dell’offerta (interno)', validation: { isRequired: true } }, slug: { label: 'Identificativo' } }),
      offer: group('Offerta', {
        deadline: shared(fields.date({ label: 'Scadenza', description: 'Il giorno dopo l’offerta sparisce da sola' })),
        eyebrow: eyebrow(),
        deadlineLabel: t('Testo della scadenza'),
        title: text('Titolo (H2)'),
        text: text(),
        items: repeater('Punti', { title: title(null), text: ta() }, 'title'),
        ...button('cta'),
        note: t('Nota accanto al pulsante'),
        image: image('offerte'),
        boxEyebrow: t('Box: etichetta'),
        boxValue: t('Box: valore'),
        boxOldValue: t('Box: valore barrato', 'Facoltativo, es. il prezzo pieno'),
        boxText: t('Box: testo'),
        stamp: ta('Timbro'),
      }),
      menu: group('Menu', {
        megaTitle: t('Mega menu: titolo'),
        megaText: t('Mega menu: testo'),
        megaItems: texts('Mega menu: punti'),
        mobileText: t('Menu mobile: testo'),
        cardText: ta('Pagina Servizi: testo nella scheda'),
      }),
    },
  }),
};

const singletons = {
  // ================================================================== HOME
  home: singletonJson('Home', 'home', {
    hero: group('Hero', s.hero()),
    manifesto: group('Manifesto', s.manifesto()),
    services: group('Servizi', s.servicesOverview()),
    lighthouse: group('Lighthouse', s.lighthouse()),
    seoSection: group('Consulenza SEO', s.textImagePillars()),
    ai: group('Integrazione AI', s.textImageCards()),
    benefits: group('Come lavoro', s.benefits()),
    problems: group('Ti riconosci?', s.problems()),
    method: group('Metodo', s.method()),
    fit: group('Per chi è', s.fit()),
    about: group('Chi sono', s.about()),
    agency: group('Per le web agency', s.agency()),
    faq: group('Domande frequenti', s.faq()),
    seo: group('SEO', s.seo('home'), SEO_LAYOUT),
  }),

  // ====================================================== SERVIZI › SITI WEB
  servizi: singletonJson('Servizi', 'servizi/index', servizi()),
  blog: singletonJson('Blog', 'blog', blog(POST_CATEGORIES)),
  casiStudio: singletonJson('Casi studio (archivio)', 'casi-studio', caseStudiesArchive()),
  sitiWeb: singletonJson('Siti web', 'servizi/siti-web', sitiWeb(POST_CATEGORIES)),
  consulenzaSeo: singletonJson('Consulenza SEO', 'servizi/consulenza-seo', consulenzaSeo(POST_CATEGORIES)),
  performance: singletonJson('Performance', 'servizi/miglioramento-prestazioni-siti-web', performance(POST_CATEGORIES)),
  integrazioneAi: singletonJson('Integrazione AI', 'servizi/integrazione-ai', integrazioneAi(POST_CATEGORIES)),
  googleAds: singletonJson('Google Ads', 'servizi/google-ads', googleAds(POST_CATEGORIES)),
  aiAds: singletonJson('AI Ads', 'servizi/ai-ads', aiAds(POST_CATEGORIES)),
  metaAds: singletonJson('Meta Ads', 'servizi/meta-ads', metaAds(POST_CATEGORIES)),
  consulenzaDigitale: singletonJson('Consulenza digitale', 'servizi/consulenza-digitale', consulenzaDigitale(POST_CATEGORIES)),
  webAgency: singletonJson('Per le web agency', 'servizi/sviluppatore-freelance-per-web-agency', webAgency(POST_CATEGORIES)),

  // ============================================================ PAGINA 404
  // Mostrata per ogni indirizzo che non esiste (una per lingua). Netlify la serve con stato 404: Google non la indicizza.
  notFound: singletonJson('Pagina 404', '404', {
    hero: group('Hero', {
      eyebrow: eyebrow(),
      title: title('H1'),
      text: text(),
      hint: t('Suggerimento', 'Sotto l’animazione, es. “Muovi il mouse: fai luce tu”'),
      words: texts('Parole perse', 'Parola'),
      secret: t('Messaggio nascosto', 'Compare solo quando la luce ci passa sopra'),
      ...button('cta', 'Pulsante'),
      ...button('link', 'Secondo pulsante'),
    }),
    services: group('Servizi', {
      eyebrow: eyebrow(),
      title: title('H2'),
      text: text(),
    }),
    blog: group('Dal blog', {
      eyebrow: eyebrow(),
      title: title('H2'),
      ...button('cta', 'Pulsante'),
    }),
    seo: group('SEO', {
      title: counted({ label: 'Meta Title', required: true, limits: SEO_LIMITS.title, ai: 'title' }),
      description: counted({ label: 'Meta Description', multiline: true, required: true, limits: SEO_LIMITS.description, ai: 'description' }),
    }),
  }),

  // =============================================================== OFFERTA
  // L'offerta mostrata nel mega menu, nel menu mobile e nelle pagine che non ne scelgono una propria
  offer: singletonJson('Offerta in evidenza', 'offer', {
    enabled: toggle('Mostra l’offerta nel sito', true),
    featured: fields.relationship({ label: 'Offerta', collection: 'offers', description: 'Scegli tra le Offerte (Sito → Offerte)' }),
  }),

  // ============================================================ NAVIGAZIONE
  navigation: singletonJson('Menu', 'navigation', {
    main: group('Menu principale', {
      servicesLabel: t('Servizi: testo'),
      servicesLink: destination('Servizi: destinazione'),
      items: repeater('Voci del menu', link(), 'label'),
    }),
    mega: group('Mega menu', {
      groups: repeater('Gruppi di servizi', {
        title: title(null),
        dark: check('Icone nere'),
        items: repeater('Servizi', {
          label: t('Nome'), badge: t('Etichetta'), text: t('Descrizione'), link: destination(), icon: icon(),
          bold: check('In grassetto nel menu mobile'),
        }, 'label'),
      }, 'title'),
      agencyStrong: t('Web agency: testo in grassetto'),
      agencyText: t('Web agency: testo'),
      agencyMobile: t('Web agency: testo nel menu mobile'),
      agencyLink: destination('Web agency: destinazione'),
      allLabel: t('Tutti i servizi: testo'),
      allMobile: t('Tutti i servizi: testo nel menu mobile'),
      allLink: destination('Tutti i servizi: destinazione'),
    }),
  }),

  // =============================================================== COOKIES
  // Banner cookie e Consent Mode v2, come AM Tools 3 → Cookies (banner: src/components/cookies/CookieBanner.astro)
  cookies: singletonJson('Cookies', 'cookies', {
    general: shared(group('Generale', {
      enabled: toggle('Attiva il banner cookie', true),
      delay: fields.integer({ label: 'Ritardo del banner (secondi)', description: 'Attesa dopo il caricamento della pagina prima di mostrare il banner.', defaultValue: 5, validation: { isRequired: true, min: 0 } }),
    }, [12, 12])),
    banner: group('Banner', {
      title: req('Titolo'),
      text: text(),
      privacyText: req('Privacy: testo prima del link'),
      privacyLinkText: req('Privacy: testo del link'),
      privacyLink: destination('Privacy: destinazione'),
      accept: req('Pulsante: accetta'),
      acceptAll: req('Pulsante: accetta tutti'),
      deny: req('Pulsante: rifiuta'),
      settings: req('Pulsante: impostazioni'),
      save: req('Pulsante: salva'),
      close: req('Pulsante: chiudi'),
      preferences: req('Pulsante: modifica le preferenze', 'Testo nascosto del pulsante rotondo che riapre le impostazioni'),
    }, [12, 12, 6, 6, 12, 4, 4, 4, 4, 4, 4, 12]),
    preferences: group('Impostazioni', {
      title: req('Titolo'),
      text: text(),
    }),
    types: group('Tipi di consenso', {
      items: fields.array(fields.object({
        type: shared(req('Tipo', 'Nome per Google Consent Mode, es. analytics_storage')),
        default: shared(fields.select({ label: 'Predefinito', options: [
          { value: 'denied', label: 'Negato' }, { value: 'granted', label: 'Concesso' }, { value: 'required', label: 'Obbligatorio (sempre attivo)' },
        ], defaultValue: 'denied' })),
        title: req('Titolo'),
        description: fields.text({ label: 'Descrizione', multiline: true, validation: { isRequired: true } }),
      }, { layout: [6, 6, 12, 12] }), {
        label: 'Tipi di consenso',
        description: 'Ogni tipo corrisponde a uno scopo dei cookie ed è inviato a Google Consent Mode / GTM.',
        itemLabel: (p: any) => p.fields.title?.value || p.fields.type?.value || '—',
        validation: { length: { min: 1 } },
      }),
    }),
  }),

  // ================================================================ GOOGLE
  google: singletonJson('Google', 'google', {
    searchConsole: group('Search Console', {
      gscCode: t('Codice di verifica Google Search Console', 'Solo il codice (content="…"): se incolli tutto il tag <meta> viene estratto da solo.'),
      gscProperty: t('Proprietà per la Dashboard', 'Dati di Search Console nella Dashboard. Es. sc-domain:bortolin.dev (proprietà di dominio) oppure https://bortolin.dev/. Serve l’account di servizio: vedi “Analytics”.'),
    }),
    analytics: group('Analytics', {
      ga4PropertyId: t('ID proprietà Google Analytics 4', 'Solo numeri, es. 412345678 (Amministrazione → Dettagli proprietà). Per vedere i dati nella Dashboard aggiungi l’account di servizio (variabile GOOGLE_SERVICE_ACCOUNT) come Visualizzatore della proprietà e come utente di Search Console.'),
    }),
    tagManager: group('Tag Manager', {
      gtmId: t('ID Google Tag Manager', 'Es. GTM-ABC1234. Con il banner cookie attivo, GTM parte solo dopo il consenso (Cookies → Tipi di consenso).'),
    }),
  }),

  // ============================================================== REDIRECT
  // Come AM Tools 3 → Redirects; a ogni build diventano il file /_redirects letto da Netlify (src/pages/[redirects].ts)
  redirects: singletonJson('Redirect', 'redirects', {
    list: group('Redirect', {
      items: fields.array(fields.object({
        from: fields.text({
          label: 'Percorso vecchio',
          description: 'Inizia con /, es. /vecchia-pagina/. Jolly: /blog/* (nella destinazione usa :splat), segnaposto: /news/:slug',
          validation: { isRequired: true, pattern: { regex: /^\/\S*$/, message: 'Deve iniziare con / e non contenere spazi' } },
        }),
        to: destination('Destinazione'),
        type: fields.select({ label: 'Tipo', options: [
          { value: '301', label: '301 · permanente' }, { value: '302', label: '302 · temporaneo' },
        ], defaultValue: '301' }),
        force: check('Forza (anche se la pagina vecchia esiste ancora)'),
      }, { layout: [12, 12, 6, 6] }), {
        label: 'Redirect',
        itemLabel: (p) => `${p.fields.from.value || '—'} → ${p.fields.to.discriminant === 'custom' ? ((p.fields.to.value as any).value || '—') : p.fields.to.discriminant} (${p.fields.type.value})`,
      }),
    }),
  }),

  // =============================================================== REVIEWS
  // Origine delle recensioni (Google o manuali), come AM Tools 3 → Reviews. Il sito riceve sempre lo stesso
  // array grezzo (src/lib/reviews.ts) e ogni template ci costruisce l'HTML che vuole.
  reviews: singletonJson('Reviews', 'reviews', {
    source: group('Recensioni', {
      enabled: toggle('Attiva recensioni', true),
      google: toggle('Google Reviews', true),
      placeId: t('Google Place ID', 'ID della scheda Google dell’attività. La chiave API va nel file .env (GOOGLE_PLACES_API_KEY).'),
      googleElse: otherwise(),
      items: fields.array(fields.object({
        author: req('Autore'),
        rating: fields.select({ label: 'Voto', options: ['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: '★'.repeat(Number(v)) + ' ' + v })), defaultValue: '5' }),
        date: fields.date({ label: 'Data', validation: { isRequired: true } }),
        text: fields.text({ label: 'Testo della recensione', multiline: true, validation: { isRequired: true } }),
        photo: image('reviews', 'Foto profilo (facoltativa)'),
      }, { layout: [8, 4, 12, 12, 12] }), {
        label: 'Recensioni',
        itemLabel: (p) => `${p.fields.author.value || '—'} · ${p.fields.rating.value}★`,
      }),
    }),
  }),

  // ========================================================= SCHEMA MARKUP
  // Dati strutturati di tutto il sito, come la pagina "Schema Markup" di AM Tools 3 (src/lib/schema.ts).
  schemaMarkup: singletonJson('Schema Markup', 'schema-markup', {
    general: fields.object({
      name: shared(req('Nome')),
      logo: shared(image('schema', 'Logo', { required: true })),
      description: fields.text({ label: 'Descrizione', multiline: true, validation: { isRequired: true } }),
      address: shared(req('Indirizzo')),
      zip: shared(req('CAP')),
      city: shared(req('Città')),
      country: shared(fields.select({ label: 'Paese', options: COUNTRIES, defaultValue: 'IT' })),
      priceRange: shared(fields.select({ label: 'Fascia di prezzo', options: ['€', '€€', '€€€', '€€€€'].map((v) => ({ value: v, label: v })), defaultValue: '€€' })),
    }, {
      label: 'Generale',
      description: 'Telefono, e-mail e partita IVA vengono da Impostazioni → Contatti.',
      layout: [12, 12, 12, 12, 4, 8, 6, 6],
    }),
    localBusiness: shared(group('LocalBusiness', {
      enabled: toggle('Attiva LocalBusiness', true),
      type: fields.select({ label: 'Tipo', options: BUSINESS_TYPES, defaultValue: 'ProfessionalService' }),
      image: image('schema', 'Immagine'),
      areaServed: texts('Zone servite', 'Zona (es. IT)'),
      reviews: check('Aggiungi voto e recensioni Google', true),
      reservation: toggle('Azione di prenotazione'),
      reservationLink: destination('Prenotazione: destinazione'),
    })),
    organization: shared(group('Organization', {
      enabled: toggle('Attiva Organization', true),
      sameAs: texts('Same as', 'URL (profilo social, scheda Google…)'),
    })),
    person: group('Persona', {
      enabled: shared(toggle('Attiva Person (fondatore)', true)),
      name: shared(t('Nome e cognome')),
      jobTitle: t('Professione'),
      knowsAbout: texts('Competenze', 'Competenza'),
    }),
    website: shared(group('WebSite', { enabled: check('Attiva WebSite', true) })),
    webpage: shared(group('WebPage', { enabled: check('Attiva WebPage', true) })),
    breadcrumb: shared(group('BreadcrumbList', { enabled: check('Attiva BreadcrumbList', true) })),
    aboutPage: shared(group('AboutPage', { enabled: check('Attiva AboutPage', true) })),
    contactPage: shared(group('ContactPage', { enabled: check('Attiva ContactPage', true) })),
    article: shared(group('Article', { enabled: check('Attiva Article (articoli del blog)', true) })),
    custom: shared(group('Markup personalizzato', {
      enabled: toggle('Attiva markup personalizzato'),
      code: ta('JSON-LD', 'Solo l’oggetto JSON-LD, senza <script>: viene aggiunto in tutte le pagine.'),
    })),
  }),

  // ========================================================== IMPOSTAZIONI
  settings: singletonJson('Impostazioni', 'settings', {
    general: group('Generale', {
      siteName: shared(t('Nome del sito')),
      icon: shared(image('site', 'Icona del sito', { required: true, description: 'Favicon del sito e del pannello. Quadrata: SVG oppure PNG di almeno 512×512 px.' })),
      ogImage: image('site', 'Immagine social predefinita'),
      ...button('headerCta', 'Pulsante header'),
    }),
    contacts: group('Contatti', {
      phone: shared(t('Telefono')),
      phoneHref: shared(t('Telefono per il link', 'Senza spazi, es. +393715962874')),
      email: shared(t('E-mail')),
      whatsapp: shared(t('WhatsApp: link')),
      whatsappLabel: t('WhatsApp: testo'),
      vat: shared(t('Partita IVA')),
    }),
    social: shared(group('Social', {
      facebook: t('Facebook'),
      instagram: t('Instagram'),
      linkedin: t('LinkedIn'),
    })),
    reviews: group('Recensioni Google', {
      eyebrow: eyebrow(),
      title: title('H2'),
      text: text(),
      count: shared(fields.integer({ label: 'Numero di recensioni', description: 'Massimo 5 (limite di Google)', defaultValue: 3, validation: { min: 1, max: 5 } })),
      ratingLabel: t('Voto: testo sotto'),
      ratingShort: t('Voto: testo breve', 'Accanto al voto in hero e footer, es. “su Google”'),
      countLabel: t('Numero recensioni: testo', '{n} = numero'),
      translated: t('Testo “Tradotta da Google”'),
      all: t('Pulsante: testo'),
      leave: t('Link: testo'),
    }),
    contact: group('Modulo contatti', {
      title: title('H2'),
      text: text(),
      bullets: texts('Punti'),
      formTitle: t('Modulo: titolo'),
      name: t('Campo nome'),
      email: t('Campo e-mail'),
      phone: t('Campo telefono'),
      website: t('Campo sito'),
      websitePlaceholder: t('Campo sito: esempio'),
      topicsLabel: t('Argomenti: titolo'),
      topics: repeater('Argomenti', { label: t('Testo'), value: shared(t('Valore')) }, 'label'),
      message: t('Campo messaggio'),
      privacy: text('Consenso privacy'),
      submit: t('Pulsante: testo'),
      sending: t('Invio in corso: testo', 'Sul pulsante mentre il messaggio parte'),
      success: text('Messaggio inviato: testo', 'Compare al posto del modulo dopo l’invio'),
      error: t('Errore: testo', 'Se l’invio non riesce'),
    }),
    caseStudies: group('Casi studio', {
      featuresTitle: t('Titolo elenco', 'Sopra le caratteristiche, es. “Cosa contiene il sito”'),
      readLabel: t('Pulsante: testo'),
      visitLabel: t('Link al sito: testo'),
    }),
    footer: group('Footer', {
      text: text(),
      column1: repeater('Colonna 1', { title: title(null), links: repeater('Link', { ...link(), bold: check('Grassetto') }, 'label') }, 'title'),
      column2: repeater('Colonna 2', { title: title(null), links: repeater('Link', { ...link(), bold: check('Grassetto') }, 'label') }, 'title'),
      boxTitle: t('Box: titolo'),
      boxText: text('Box: testo'),
      ...button('boxCta', 'Box: pulsante'),
      vatLabel: t('Partita IVA: prefisso'),
      legal: repeater('Link legali', link(), 'label'),
    }),
    a11y: group('Accessibilità (testi non visibili)', {
      skip: t('Vai al contenuto'),
      home: t('Logo'),
      mainNav: t('Menu principale'),
      mobileNav: t('Menu mobile'),
      openMenu: t('Apri il menu'),
      closeMenu: t('Chiudi il menu'),
      toggleServices: t('Mostra i servizi'),
      offer: t('Offerta nel mega menu'),
      toContacts: t('Vai ai contatti'),
      contacts: t('Come contattarmi'),
      language: t('Selettore lingua'),
      social: t('Elenco social'),
      follow: t('Seguimi su', 'Seguito dal nome del social'),
      highlights: t('Punti di forza'),
      projectTags: t('Caratteristiche del progetto'),
      scores: t('Punteggi Lighthouse'),
      stars: t('Stelle', '{n} = numero di stelle'),
      reviewer: t('Profilo Google di'),
      psiField: t('Test PageSpeed: campo'),
      psiForm: t('Test PageSpeed: modulo'),
      honeypot: t('Campo anti-spam'),
    }),
    llms: shared(group('llms.txt', {
      enabled: toggle('Attiva llms.txt', true),
      markdownEnabled: check('Attiva Markdown', true),
      extra: ta('Markdown aggiuntivo', 'Aggiunto così com’è in fondo a /llms.txt'),
    })),
  }),
};

/** pagine a layout fisso (src/lib/pages.ts → FIXED_PAGES): nelle traduzioni hanno l'indirizzo tradotto */
const FIXED_KEYS = ['home', 'servizi', 'sitiWeb', 'consulenzaSeo', 'performance', 'integrazioneAi', 'googleAds', 'aiAds', 'metaAds', 'consulenzaDigitale', 'webAgency', 'casiStudio', 'blog'] as const;

export default config({
  // in locale i file del progetto; online GitHub (ramo "contenuti", poi "Pubblica" → main).
  // Per creare la GitHub App di Keystatic in locale: PUBLIC_KEYSTATIC_STORAGE=github npm run dev
  // clienti (email e password, window.__bdClient impostato da admin/page.astro): modalità "locale" verso il nostro server,
  // che salva su GitHub al posto loro (src/keystatic/admin/keystatic-api.ts)
  // lingua dei comandi del pannello: italiano; per i clienti quella scelta in Utenti (i campi restano in italiano)
  locale: keystaticLocale() as any,
  storage: (typeof window !== 'undefined' && (window as any).__bdClient) || (import.meta.env.DEV && import.meta.env.PUBLIC_KEYSTATIC_STORAGE !== 'github')
    ? { kind: 'local' }
    : { kind: 'github', repo: { owner: 'fly-oinotna', name: 'bortolin.dev' }, pathPrefix: 'astro' },
  ui: {
    // logo della sidebar = icona del sito (Impostazioni → Generale), servita da /api/site-icon (solo in sviluppo)
    brand: { name: 'bortolin.dev', mark: () => createElement('img', { src: '/api/site-icon', width: 24, height: 24, alt: '', style: { display: 'block', objectFit: 'contain', borderRadius: 4 } }) },
    // Ordine fisso: Pagine · Sito (Menu sempre per primo, poi le pagine specifiche del sito in ordine alfabetico)
    // · SEO e strumenti (in ordine alfabetico) · Configurazione (Impostazioni sempre per ultima)
    // il primo gruppo non ha titolo (come WordPress): Pagine, Post, Casi studio (+ Media).
    // Le pagine a layout fisso (Home, Servizi…) sono nell'elenco Pagine, nel gruppo "Pagine a layout fisso" (admin/seo-badges.ts)
    navigation: {
      '': ['pages', 'en_pages', 'es_pages', 'de_pages', 'posts', 'en_posts', 'es_posts', 'de_posts', 'caseStudies', 'en_caseStudies', 'es_caseStudies', 'de_caseStudies'],
      'Sito': ['navigation', 'en_navigation', 'es_navigation', 'de_navigation', 'offer', 'offers', 'en_offers', 'es_offers', 'de_offers', 'notFound', 'en_notFound', 'es_notFound', 'de_notFound'],
      'SEO e strumenti': ['cookies', 'en_cookies', 'es_cookies', 'de_cookies', 'google', 'redirects', 'reviews', 'schemaMarkup', 'en_schemaMarkup', 'es_schemaMarkup', 'de_schemaMarkup'],
      'Configurazione': ['settings', 'en_settings', 'es_settings', 'de_settings'],
    },
  },
  collections: { ...collections, ...translatedCollections(collections, ['pages', 'posts', 'caseStudies', 'offers']) },
  singletons: { ...singletons, ...translatedSingletons(singletons, [...FIXED_KEYS, 'navigation', 'cookies', 'schemaMarkup', 'settings', 'notFound'], [...FIXED_KEYS]) },
});
