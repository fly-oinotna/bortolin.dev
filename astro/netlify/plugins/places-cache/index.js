// Conserva tra un deploy e l'altro la cache delle recensioni Google (dati + foto profilo, vedi src/lib/places.ts),
// così Google viene interrogato al massimo una volta a settimana anche su Netlify.
// "Clear cache and deploy" la svuota: il build successivo riscarica tutto (4 chiamate, una per lingua).
const DIR = 'node_modules/.cache/bortolin-places';

export const onPreBuild = async ({ utils }) => {
  const ok = await utils.cache.restore(DIR);
  console.log(ok ? `[places-cache] cache recensioni ripristinata` : `[places-cache] nessuna cache: le recensioni verranno scaricate da Google`);
};

export const onPostBuild = async ({ utils }) => {
  await utils.cache.save(DIR);
};
