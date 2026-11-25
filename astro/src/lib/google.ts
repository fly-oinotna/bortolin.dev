// Impostazioni → Google: verifica di Search Console e Google Tag Manager.

/** Accetta il solo codice oppure l'intero tag <meta name="google-site-verification" content="…"> */
export function gscCode(raw?: string | null): string | undefined {
  const v = (raw ?? '').trim();
  if (!v) return undefined;
  const m = v.match(/content\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : v).trim() || undefined;
}

/** ID di Tag Manager valido (GTM-XXXXXXX), altrimenti undefined */
export function gtmId(raw?: string | null): string | undefined {
  const v = (raw ?? '').trim().toUpperCase();
  return /^GTM-[A-Z0-9]+$/.test(v) ? v : undefined;
}
