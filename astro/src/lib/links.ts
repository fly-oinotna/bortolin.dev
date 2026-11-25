// Campo "destinazione" di Keystatic → indirizzo del link
export type Destination = { readonly discriminant: string; readonly value?: unknown } | null | undefined;

export function href(d: Destination): string {
  if (!d) return '#';
  return d.discriminant === 'custom' ? (typeof d.value === 'string' && d.value) || '#' : d.discriminant;
}

/** Attributi per i link esterni (nuova scheda) */
export const ext = (url: string) => (/^https?:/.test(url) ? { target: '_blank', rel: 'noopener' } : {});
