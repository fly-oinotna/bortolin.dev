// Dati strutturati (JSON-LD) di ogni pagina, sul modello di AM Tools 3 → Schema Markup.
// Ogni tipo compare solo se attivo in Keystatic → "Schema Markup"; AboutPage/ContactPage/Product
// richiedono anche lo switch nel gruppo SEO della pagina. I nodi sono collegati tra loro con @id.
import type { Globals } from './content';
import type { PageSeo } from './seo';
import { href } from './links';
import { rich, type RichValue } from './rich';
import { prefix } from '../i18n/langs';
import { t } from '../i18n/ui';

export interface SchemaPage {
  /** indirizzo completo della pagina */
  canonical: string;
  seo: PageSeo;
  /** immagine social della pagina (già assoluta) */
  image?: string;
  /** percorso per il BreadcrumbList (senza la Home); se assente: Home → pagina */
  breadcrumb?: { name: string; url: string }[];
  /** dati strutturati propri del tipo di pagina, generati dai contenuti (vedi SchemaExtra) */
  extra?: SchemaExtra;
}

/**
 * Dati strutturati specifici della pagina, ricavati in automatico dai contenuti:
 * Service (pagine servizio), BlogPosting (articoli), Blog e CollectionPage (archivi), CreativeWork (casi studio), FAQPage (domande frequenti).
 */
export interface SchemaExtra {
  service?: { name: string };
  post?: { headline: string; date: string; modified?: string; image?: string; section?: string; words?: number };
  blog?: { posts: { headline: string; url: string; date: string }[] };
  collection?: { items: { name: string; url: string }[] };
  project?: { name: string; url?: string | null; image?: string; about?: string };
  faq?: { question: string; answer: string }[];
}

/** FAQ della pagina → voci del FAQPage (risposta in testo semplice) */
export const faqSchema = (items: readonly { question: string; answer: RichValue }[] | undefined) =>
  (items ?? []).map((f) => ({ question: f.question, answer: plain(rich(f.answer)) }));

/** testo semplice di un campo con editor (per le risposte delle FAQ) */
export const plain = (html: string) => html.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** JSON sicuro dentro <script>: un "</script>" nel testo non può chiudere il tag */
export const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/**
 * @param images immagini di Schema Markup già convertite in URL assoluti (logo e immagine LocalBusiness)
 * @param absolute trasforma un percorso del sito in URL assoluto
 */
export function buildSchema(g: Globals, page: SchemaPage, base: string, images: { logo?: string; business?: string }, absolute: (path: string) => string) {
  const sm = g.schemaMarkup;
  const s = g.settings;
  const gen = sm.general;
  const { canonical, seo } = page;
  const title = seo.title ?? '';
  const description = seo.description ?? '';

  const ids = {
    organization: `${base}/#organization`,
    business: `${base}/#localbusiness`,
    person: `${base}/#person`,
    website: `${base}/#website`,
  };
  const org = sm.organization.enabled;
  const lb = sm.localBusiness.enabled;
  /** entità principale del sito (a cui puntano WebSite, WebPage, AboutPage…) */
  const mainId = org ? ids.organization : lb ? ids.business : undefined;

  const logo = images.logo;
  const address = gen.address || gen.city || gen.zip
    ? {
        '@type': 'PostalAddress',
        ...(gen.address && { streetAddress: gen.address }),
        ...(gen.city && { addressLocality: gen.city }),
        ...(gen.zip && { postalCode: gen.zip }),
        addressCountry: gen.country || 'IT',
      }
    : undefined;
  const contactPoint = s.contacts.phone || s.contacts.email
    ? [{
        '@type': 'ContactPoint',
        contactType: 'customer service',
        ...(s.contacts.phone && { telephone: s.contacts.phone }),
        ...(s.contacts.email && { email: s.contacts.email }),
        availableLanguage: ['Italian', 'English', 'German', 'Spanish'],
      }]
    : undefined;

  const graph: Record<string, unknown>[] = [];

  // ---------------------------------------------------------------- Organization
  if (org) {
    graph.push({
      '@type': 'Organization', '@id': ids.organization, name: gen.name || s.general.siteName, url: `${base}/`,
      ...(logo && { logo }),
      ...(gen.description && { description: gen.description }),
      ...(address && { address }),
      ...(sm.organization.sameAs.length && { sameAs: sm.organization.sameAs }),
      ...(contactPoint && { contactPoint }),
      ...(s.contacts.vat && { vatID: s.contacts.vat }),
      ...(sm.person.enabled && { founder: { '@id': ids.person } }),
    });
  }

  // ---------------------------------------------------------------- LocalBusiness
  if (lb) {
    const l = sm.localBusiness;
    const image = images.business ?? page.image;
    const reviews = l.reviews && g.reviews && g.reviews.count > 0 ? g.reviews : null;
    graph.push({
      '@type': l.type || 'LocalBusiness', '@id': ids.business, name: gen.name || s.general.siteName, url: `${base}/`,
      ...(image && { image }),
      ...(logo && { logo }),
      ...(gen.description && { description: gen.description }),
      ...(address && { address }),
      ...(s.contacts.phone && { telephone: s.contacts.phone }),
      ...(s.contacts.email && { email: s.contacts.email }),
      ...(gen.priceRange && { priceRange: gen.priceRange }),
      ...(l.areaServed.length && { areaServed: l.areaServed }),
      ...(s.contacts.vat && { vatID: s.contacts.vat }),
      ...(org && { parentOrganization: { '@id': ids.organization } }),
      ...(sm.person.enabled && { founder: { '@id': ids.person } }),
      ...(l.reservation && { potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: absolute(href(l.reservationLink)) } } }),
      ...(reviews && {
        aggregateRating: { '@type': 'AggregateRating', ratingValue: reviews.rating, ratingCount: reviews.count, bestRating: 5 },
        review: reviews.reviews.map((r) => ({
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author },
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
          reviewBody: r.original ?? r.text,
          ...(r.date && { datePublished: r.date }),
        })),
      }),
    });
  }

  // ---------------------------------------------------------------- Person
  if (sm.person.enabled && sm.person.name) {
    graph.push({
      '@type': 'Person', '@id': ids.person, name: sm.person.name,
      ...(sm.person.jobTitle && { jobTitle: sm.person.jobTitle }),
      ...(sm.person.knowsAbout.length && { knowsAbout: sm.person.knowsAbout }),
      ...(mainId && { worksFor: { '@id': mainId } }),
    });
  }

  // ---------------------------------------------------------------- WebSite / WebPage
  if (sm.website.enabled) {
    graph.push({
      '@type': 'WebSite', '@id': ids.website, url: `${base}${prefix(g.lang)}/`, name: s.general.siteName, inLanguage: g.lang,
      ...(mainId && { publisher: { '@id': mainId } }),
    });
  }
  if (sm.webpage.enabled) {
    graph.push({
      '@type': 'WebPage', '@id': canonical, url: canonical, name: title, description, inLanguage: g.lang,
      ...(sm.website.enabled && { isPartOf: { '@id': ids.website } }),
      ...(mainId && { about: { '@id': mainId } }),
      ...(page.image && { primaryImageOfPage: page.image }),
      potentialAction: { '@type': 'ReadAction', target: canonical },
    });
  }

  // ---------------------------------------------------------------- dati strutturati propri della pagina (automatici)
  const x = page.extra;
  const abs = (u: string) => (/^https?:/.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`);
  if (x?.service) {
    const lbArea = sm.localBusiness.enabled ? sm.localBusiness.areaServed : [];
    graph.push({
      '@type': 'Service', '@id': `${canonical}#service`, name: x.service.name, serviceType: x.service.name, description, url: canonical,
      ...(mainId && { provider: { '@id': mainId } }),
      areaServed: lbArea?.length ? lbArea : { '@type': 'Country', name: gen.country === 'IT' || !gen.country ? 'Italia' : gen.country },
      mainEntityOfPage: { '@id': canonical },
    });
  }
  if (x?.post) {
    graph.push({
      '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: x.post.headline, description, url: canonical,
      datePublished: x.post.date, dateModified: x.post.modified || x.post.date, inLanguage: g.lang,
      ...(x.post.image && { image: [abs(x.post.image)] }),
      ...(x.post.section && { articleSection: x.post.section }),
      ...(x.post.words && { wordCount: x.post.words }),
      author: sm.person.enabled ? { '@id': ids.person } : { '@type': 'Person', name: s.general.siteName },
      ...(mainId && { publisher: { '@id': mainId } }),
      mainEntityOfPage: { '@id': canonical },
      ...(sm.website.enabled && { isPartOf: { '@id': ids.website } }),
    });
  }
  if (x?.blog) {
    graph.push({
      '@type': 'Blog', '@id': `${canonical}#blog`, name: title, description, url: canonical, inLanguage: g.lang,
      ...(mainId && { publisher: { '@id': mainId } }),
      blogPost: x.blog.posts.map((p) => ({ '@type': 'BlogPosting', headline: p.headline, url: abs(p.url), datePublished: p.date })),
    });
  }
  if (x?.collection) {
    graph.push({
      '@type': 'CollectionPage', '@id': `${canonical}#collection`, name: title, description, url: canonical, inLanguage: g.lang,
      ...(sm.website.enabled && { isPartOf: { '@id': ids.website } }),
      mainEntity: { '@type': 'ItemList', itemListElement: x.collection.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.url) })) },
    });
  }
  if (x?.project) {
    graph.push({
      '@type': 'CreativeWork', '@id': `${canonical}#project`, name: x.project.name, description, url: canonical, inLanguage: g.lang,
      ...(x.project.url && { sameAs: x.project.url }),
      ...(x.project.image && { image: abs(x.project.image) }),
      ...(x.project.about && { about: x.project.about }),
      creator: sm.person.enabled ? { '@id': ids.person } : mainId ? { '@id': mainId } : undefined,
      mainEntityOfPage: { '@id': canonical },
    });
  }
  if (x?.faq?.length) {
    graph.push({
      '@type': 'FAQPage', '@id': `${canonical}#faq`, url: canonical, inLanguage: g.lang,
      mainEntity: x.faq.filter((f) => f.question && f.answer).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
  }

  // ---------------------------------------------------------------- AboutPage / ContactPage / Product (switch della pagina)
  if (sm.aboutPage.enabled && seo.aboutPage) {
    graph.push({ '@type': 'AboutPage', '@id': `${canonical}#aboutpage`, url: canonical, name: title, description, inLanguage: g.lang, ...(mainId && { mainEntity: { '@id': mainId } }) });
  }
  if (sm.contactPage.enabled && seo.contactPage) {
    graph.push({ '@type': 'ContactPage', '@id': `${canonical}#contactpage`, url: canonical, name: title, description, inLanguage: g.lang, ...(mainId && { mainEntity: { '@id': mainId } }) });
  }
  if (seo.product) {
    graph.push({
      '@type': 'Product', '@id': `${canonical}#product`, name: title, description,
      ...(page.image && { image: page.image }),
      ...(mainId && { brand: { '@id': mainId } }),
      ...(g.reviews && g.reviews.count > 0 && { aggregateRating: { '@type': 'AggregateRating', ratingValue: g.reviews.rating, reviewCount: g.reviews.count, bestRating: 5 } }),
    });
  }

  // ---------------------------------------------------------------- BreadcrumbList (non in Home)
  const path = new URL(canonical).pathname;
  const home = `${prefix(g.lang)}/`;
  const trail = page.breadcrumb ?? (path === home ? [] : [{ name: title, url: canonical }]);
  if (sm.breadcrumb.enabled && trail.length) {
    const items = [{ name: t(g.lang).home, url: `${base}${home}` }, ...trail];
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
    });
  }

  // ---------------------------------------------------------------- script finali
  const scripts: string[] = [];
  if (graph.length) scripts.push(safeJson({ '@context': 'https://schema.org', '@graph': graph }));
  // markup personalizzati: devono essere JSON valido, altrimenti non vengono pubblicati
  const custom = [
    sm.custom.enabled ? { code: sm.custom.code, where: 'Schema Markup (tutto il sito)' } : null,
    seo.customMarkup ? { code: seo.customMarkupCode, where: `gruppo SEO di ${path}` } : null,
  ];
  for (const c of custom) {
    if (!c?.code?.trim()) continue;
    try {
      scripts.push(safeJson(JSON.parse(c.code)));
    } catch {
      console.warn(`[schema] Markup personalizzato non valido (${c.where}): non pubblicato.`);
    }
  }
  return scripts;
}
