// Ogni lunedì all'alba avvia il monitor Lighthouse (lighthouse-background.mjs). Netlify Scheduled Function.
export default async () => {
  const site = (process.env.URL || 'https://bortolin.dev').replace(/\/$/, '');
  await fetch(`${site}/.netlify/functions/lighthouse-background`, { method: 'POST', headers: { 'x-bd-secret': process.env.KEYSTATIC_SECRET ?? '' } });
};
export const config = { schedule: '0 5 * * 1' };
