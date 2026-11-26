// AI scelta dall'utente per le funzioni del pannello (traduzioni, Genera con AI): si ricorda nel browser.
// Si cambia nella Dashboard → "AI del pannello". Vuota = la prima con la chiave configurata (lato server, ai.ts).
const KEY = 'bd-ai-provider';
export const getProvider = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const setProvider = (p: string) => { try { localStorage.setItem(KEY, p); } catch { /* browser senza storage */ } };
