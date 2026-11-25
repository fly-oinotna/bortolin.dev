// Trasforma il testo degli editor di Keystatic (Markdoc) in HTML con le classi del sito.
// Gestisce: grassetto, corsivo, link, evidenziato verde, a capo (Maiusc+Invio) e più paragrafi.
// Accetta anche testo semplice (campi su più righe): viene "escapato" e gli a capo diventano <br>.
import Markdoc, { type Node, type RenderableTreeNode } from '@markdoc/markdoc';

// @markdoc/markdoc è CommonJS: le classi si prendono dall'export di default
const { Tag } = Markdoc;

export type RichValue = string | { node: Node } | null | undefined;

export interface RichOptions {
  /** classi del grassetto: text-black su fondo chiaro, text-white su fondo scuro */
  strong?: string;
  /** classi dei link */
  link?: string;
  /** classi dell'evidenziato verde */
  mark?: string;
  /** separatore tra paragrafi (il testo finisce dentro un <p> del template) */
  paragraph?: string;
}

export const markdocConfig = {
  tags: { verde: { render: 'mark-verde', attributes: {} } },
  nodes: { softbreak: { transform: () => ' ' } },
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Aggiunge le classi del sito ai tag prodotti da Markdoc */
export function decorate(n: RenderableTreeNode, o: Required<Omit<RichOptions, 'paragraph'>>): RenderableTreeNode {
  if (!Tag.isTag(n)) return n;
  const children = n.children.map((c) => decorate(c, o));
  switch (n.name) {
    case 'strong':
      return new Tag('strong', o.strong ? { class: o.strong } : {}, children);
    case 'mark-verde':
      return new Tag('span', { class: o.mark }, children);
    case 'a': {
      const href = String(n.attributes.href ?? '');
      const ext = /^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {};
      return new Tag('a', { href, class: o.link, ...ext }, children);
    }
    default:
      return new Tag(n.name, n.attributes, children);
  }
}

/** Ogni paragrafo dell'editor come HTML a sé (per <Rich>, che crea un <p> per paragrafo) */
export function richParagraphs(value: RichValue, opts: RichOptions = {}): string[] {
  const html = rich(value, { ...opts, paragraph: '\u0000' });
  return html ? html.split('\u0000') : [];
}

export function rich(value: RichValue, opts: RichOptions = {}): string {
  if (!value) return '';
  const o = {
    strong: opts.strong ?? 'text-black',
    link: opts.link ?? 'font-semibold text-black underline underline-offset-4',
    mark: opts.mark ?? 'text-bd-green',
  };
  if (typeof value === 'string') return esc(value.trim()).replace(/\r?\n/g, '<br>');

  const tree = Markdoc.transform(value.node, markdocConfig);
  // il documento è <article><p>…</p><p>…</p></article>: teniamo solo il contenuto dei paragrafi
  const paragraphs = Tag.isTag(tree) ? tree.children : [tree];
  return paragraphs
    .map((p) => {
      const inner = Tag.isTag(p) && p.name === 'p' ? p.children : [p];
      return Markdoc.renderers.html(inner.map((c) => decorate(c, o)));
    })
    .filter((h) => h.trim())
    .join(opts.paragraph ?? '<br><br>');
}

/** true se l'editor contiene del testo */
export const hasRich = (value: RichValue) => rich(value).replace(/<[^>]+>/g, '').trim().length > 0;

/** Numero di sezione a due cifre: 1 → "01" */
export const pad = (n: number) => String(n).padStart(2, '0');
