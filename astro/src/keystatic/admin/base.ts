// Indirizzo base del pannello: "/admin" in locale, "/admin/branch/<ramo>" online (Keystatic in modalità GitHub)
export const adminBase = () => location.pathname.match(/^\/admin\/branch\/[^/]+/)?.[0] ?? '/admin';
