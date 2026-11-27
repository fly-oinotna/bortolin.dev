// Dati del progetto usati dal pannello (da cambiare per ogni sito).
/** badge di stato dei deploy di Netlify (Project configuration → General → Status badges) e pagina dei deploy */
export const NETLIFY = {
  badge: 'https://api.netlify.com/api/v1/badges/bf2af9cb-2083-406f-84b6-79cdb370ce95/deploy-status',
  deploys: 'https://app.netlify.com/projects/bortolin/deploys',
};
/** immagine del badge sempre aggiornata (senza cache del browser) */
export const deployBadge = () => `<a class="bd-deploy" href="${NETLIFY.deploys}" target="_blank" rel="noopener" title="Stato dell’ultimo deploy su Netlify"><img src="${NETLIFY.badge}?t=${Date.now()}" alt="Stato del deploy su Netlify" height="20"></a>`;
