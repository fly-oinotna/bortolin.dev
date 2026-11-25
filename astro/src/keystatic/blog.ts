// Pagina "Blog": indice degli articoli + testi comuni a tutti i post (indice, inviti, autore, correlati)
// e, per ogni categoria, il servizio collegato con i suoi inviti all'azione e l'offerta.
import { fields } from '@keystatic/core';
import { t, ta, num, toggle, eyebrow, title, text, image, alt, button, destination, repeater } from './fields';
import { group, sections as s, SEO_LAYOUT } from './sections';
import { contactGroup } from './servizi';

export const blog = (categories: { value: string; label: string }[]) => ({
  hero: group('Hero', {
    breadcrumb: t('Breadcrumb: nome della pagina'),
    eyebrow: eyebrow(),
    title: text('Titolo (H1)', 'Il verde evidenzia una parola'),
    text: text(),
    searchLabel: t('Ricerca: descrizione per i lettori di schermo'),
    searchPlaceholder: t('Ricerca: testo nel campo'),
    featuredLabel: t('In evidenza: etichetta'),
    featured: fields.relationship({ label: 'Articolo in evidenza', collection: 'posts', description: 'Vuoto = il più recente' }),
    readingLabel: t('Tempo di lettura: testo', 'Dopo i minuti, es. “di lettura”'),
  }),
  list: group('Elenco', {
    filterLabel: t('Filtri: descrizione per i lettori di schermo'),
    allLabel: t('Filtro “Tutti”'),
    countOne: t('Conteggio: un articolo'),
    countMany: t('Conteggio: più articoli', '{n} = numero'),
    emptyTitle: t('Nessun risultato: titolo'),
    emptyText: ta('Nessun risultato: testo'),
    emptyButton: t('Nessun risultato: pulsante'),
    extraAfter: num('Box nell’elenco: dopo quanti articoli', 6),
    extraEyebrow: eyebrow(),
    extraTitle: t('Box nell’elenco: titolo'),
    extraText: ta('Box nell’elenco: testo'),
    ...button('extraCta', 'Box nell’elenco: pulsante'),
  }),
  help: group('Box finale', {
    eyebrow: eyebrow(),
    title: title('H2'),
    text: ta(),
    ...button('cta'),
    ...button('link', 'Secondo pulsante'),
    topicsTitle: t('Argomenti: titolo'),
  }),
  post: group('Articoli: testi comuni', {
    tocTitle: t('Indice: titolo'),
    sideText: t('Box laterale: testo', 'Sotto il titolo dell’invito della categoria'),
    sideButton: t('Box laterale: pulsante'),
    ctaButton: t('Inviti nel testo: pulsante'),
    ctaLabel: t('Inviti nel testo: descrizione per i lettori di schermo'),
    authorLabel: t('Autore: etichetta'),
    authorName: t('Autore: nome'),
    authorRole: t('Autore: ruolo'),
    authorBio: ta('Autore: biografia'),
    authorImage: image('home', 'Autore: foto'),
    authorAlt: alt(),
    ...button('authorPage', 'Autore: link'),
    bannerLabel: t('Banner servizio: etichetta'),
    bannerSuffix: ta('Banner servizio: testo aggiunto'),
    bannerButton: t('Banner servizio: pulsante'),
    ...button('bannerCall', 'Banner servizio: secondo pulsante'),
    relatedTitle: title('H2', 'Correlati: titolo'),
    relatedAll: t('Correlati: link a tutti gli articoli'),
    contactTitle: t('Contatti: titolo (H2)'),
  }),
  categories: group('Categorie e servizi', {
    items: repeater('Categorie', {
      category: fields.select({ label: 'Categoria', options: categories, defaultValue: categories[0].value }),
      service: t('Servizio collegato'),
      link: destination('Pagina del servizio'),
      text: ta('Servizio: testo'),
      offer: fields.relationship({ label: 'Offerta', collection: 'offers', description: 'Vuoto = banner del servizio' }),
      cta1Title: t('Invito 1: titolo'),
      cta1Text: ta('Invito 1: testo'),
      cta2Title: t('Invito 2: titolo'),
      cta2Text: ta('Invito 2: testo'),
    }, 'service'),
  }),
  contact: contactGroup([]),
  seo: group('SEO', s.seo('blog'), SEO_LAYOUT),
});
