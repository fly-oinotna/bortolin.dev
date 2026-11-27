// SPAZIO DI LAVORO delle API del pannello (traduzioni, mediateca, badge SEO, pubblicazione).
//
// In sviluppo: i file del progetto, letti e scritti direttamente (come sempre).
// Online (Netlify): i file NON ci sono. A ogni richiesta:
//   1. si controlla l'utente con il token GitHub che Keystatic salva nel cookie "keystatic-gh-access-token"
//      (serve il permesso di scrittura sul repository);
//   2. si scarica il ramo di lavoro (REPO.work) come archivio in una cartella temporanea — solo se è cambiato
//      dall'ultima volta — e ci si sposta lì: tutto il codice che legge "src/content/…" funziona come in locale;
//   3. ogni scrittura (write/remove) cambia la copia temporanea e viene raccolta; save() la manda a GitHub
//      come UNA commit sul ramo di lavoro, firmata dall'utente del pannello.
// Il sito pubblicato segue solo REPO.live: le modifiche arrivano online con il pulsante "Pubblica" (publish-api.ts).
import { gunzipSync } from 'node:zlib';
import { existsSync, mkdirSync, renameSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { resetRoutes } from '../../lib/i18n';
import { resetPages } from '../../lib/pages';
import { appToken, clientOf, type User } from './auth';

export const REPO = { owner: 'fly-oinotna', name: 'bortolin.dev', prefix: 'astro', work: 'contenuti', live: 'main' } as const;
/** online i file arrivano da GitHub; in sviluppo sono quelli del progetto */
export const REMOTE = !import.meta.env.DEV;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const API = 'https://api.github.com';
const COOKIE = 'keystatic-gh-access-token';

export const tokenOf = (request: Request) => {
  const m = (request.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
};

/** chiamata all'API di GitHub con il token dell'utente */
export async function gh<T = any>(token: string, path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'bortolin.dev-admin',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(rest.headers as Record<string, string>),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new HttpError(res.status, `GitHub ${res.status}: ${text.slice(0, 200)}`);
  }
  return (res.status === 204 ? null : res.json()) as T;
}

const repo = (p = '') => `/repos/${REPO.owner}/${REPO.name}${p}`;

/** l'utente può scrivere nel repository? (verifica ricordata per 10 minuti) */
const verified = new Map<string, number>();
async function verify(token: string) {
  if ((verified.get(token) ?? 0) > Date.now()) return;
  let info: any;
  try { info = await gh(token, repo()); } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 403 || e.status === 404)) throw new HttpError(401, 'Sessione scaduta: ricarica il pannello e accedi di nuovo.');
    throw e;
  }
  if (!info?.permissions?.push) throw new HttpError(403, 'Il tuo account GitHub non può modificare questo sito.');
  verified.set(token, Date.now() + 10 * 60 * 1000);
}

/** ultima commit del ramo di lavoro; se il ramo non esiste ancora lo crea da quello pubblicato */
export async function workHead(token: string): Promise<string> {
  try {
    return (await gh(token, repo(`/git/ref/heads/${REPO.work}`))).object.sha;
  } catch (e) {
    if (!(e instanceof HttpError) || e.status !== 404) throw e;
    const live = (await gh(token, repo(`/git/ref/heads/${REPO.live}`))).object.sha;
    await gh(token, repo('/git/refs'), { method: 'POST', json: { ref: `refs/heads/${REPO.work}`, sha: live } });
    return live;
  }
}

// ---------------------------------------------------------------- copia locale del ramo (solo online)
let current: { sha: string; dir: string; checked: number } | null = null;

/** archivio .tar.gz → file della cartella `astro/` del repository, scritti in `dir` */
function untar(gz: Uint8Array, dir: string) {
  const buf = gunzipSync(gz);
  const str = (a: number, b: number) => buf.subarray(a, b).toString('utf8').replace(/\0.*$/s, '');
  let off = 0;
  let longName: string | null = null;
  while (off + 512 <= buf.length) {
    const name0 = str(off, off + 100);
    if (!name0) break; // blocchi vuoti finali
    const size = parseInt(str(off + 124, off + 136).trim() || '0', 8);
    const type = String.fromCharCode(buf[off + 156] || 48);
    const prefix = str(off + 345, off + 500);
    const data = buf.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') { // intestazione PAX: il nome lungo del file che segue
      const m = data.toString('utf8').match(/\d+ path=([^\n]+)\n/);
      longName = m ? m[1] : null;
      continue;
    }
    if (type === 'g') continue; // intestazione globale (commit di GitHub)
    const full = longName ?? (prefix ? `${prefix}/${name0}` : name0);
    longName = null;
    if (type !== '0' && type !== '\0') continue; // cartelle e link: le cartelle si creano da sole
    const rel = full.split('/').slice(1).join('/'); // senza la cartella principale "owner-repo-sha/"
    if (!rel.startsWith(`${REPO.prefix}/`)) continue;
    const target = join(dir, rel.slice(REPO.prefix.length + 1));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data);
  }
}

async function sync(token: string, sha: string) {
  if (current?.sha === sha) return;
  const res = await fetch(`${API}${repo(`/tarball/${sha}`)}`, { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'bortolin.dev-admin' } });
  if (!res.ok) throw new HttpError(502, `Download del repository non riuscito (${res.status})`);
  const dir = join(tmpdir(), `bd-ws-${sha.slice(0, 12)}`);
  rmSync(dir, { recursive: true, force: true });
  untar(new Uint8Array(await res.arrayBuffer()), dir);
  process.chdir(dir);
  if (current && current.dir !== dir) rmSync(current.dir, { recursive: true, force: true });
  current = { sha, dir, checked: Date.now() };
  resetRoutes();
  resetPages();
}

// ---------------------------------------------------------------- sessione di una richiesta
export interface Change { path: string; content?: Uint8Array | string; remove?: boolean }

export interface Session {
  remote: boolean;
  token: string | null;
  /** cliente collegato (null = admin) */
  client: User | null;
  /** scrive un file (percorso relativo alla cartella del sito, es. "src/content/en/home.json") */
  write(path: string, content: Uint8Array | string): void;
  remove(path: string): void;
  rename(from: string, to: string): void;
  /** manda le modifiche a GitHub come una commit (in sviluppo non fa nulla: i file sono già scritti) */
  save(message: string): Promise<void>;
}

/**
 * Apre lo spazio di lavoro: in sviluppo subito; online dopo aver controllato l'utente e aggiornato la copia.
 * `maxAge` (solo letture, es. anteprime della mediateca): riusa la copia se il ramo è stato controllato da meno di tot ms.
 */
export async function open(request: Request, { maxAge = 0 } = {}): Promise<Session> {
  const changes: Change[] = [];
  const local = {
    write(path: string, content: Uint8Array | string) {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, content);
      changes.push({ path, content });
    },
    remove(path: string) {
      if (existsSync(path)) unlinkSync(path);
      changes.push({ path, remove: true });
    },
    rename(from: string, to: string) {
      mkdirSync(dirname(to), { recursive: true });
      renameSync(from, to);
      changes.push({ path: from, remove: true });
      changes.push({ path: to, content: undefined }); // il contenuto si legge al momento della commit
    },
  };
  const client = await clientOf(request);
  if (!REMOTE) return { remote: false, token: null, client, ...local, save: async () => {} };

  let token: string;
  if (client) token = await appToken(REPO.owner, REPO.name);
  else {
    const t = tokenOf(request);
    if (!t) throw new HttpError(401, 'Accedi al pannello per continuare.');
    await verify(t);
    token = t;
  }
  let base: string;
  if (current && maxAge && Date.now() - current.checked < maxAge) base = current.sha;
  else {
    base = await workHead(token);
    await sync(token, base);
    if (current) current.checked = Date.now();
  }
  return {
    remote: true,
    token,
    client,
    ...local,
    async save(message: string) {
      if (!changes.length) return;
      let sha: string;
      try {
        // le commit dei clienti le fa l'app GitHub: nel messaggio si scrive chi ha modificato
        sha = await commit(token, base, changes, client ? `${client.name}: ${message}` : message);
      } catch (e) {
        // la copia locale contiene modifiche che su GitHub non ci sono: si butta e si riscarica alla prossima richiesta
        if (current) rmSync(current.dir, { recursive: true, force: true });
        current = null;
        throw e;
      }
      // la copia locale contiene già le modifiche: corrisponde alla nuova commit
      if (current) current.sha = sha;
    },
  };
}

/** una commit con più file sul ramo di lavoro (riprova se nel frattempo il ramo è andato avanti) */
async function commit(token: string, base: string, changes: Change[], message: string): Promise<string> {
  const { readFileSync } = await import('node:fs');
  // ultima versione di ogni file (se lo stesso percorso cambia più volte vale l'ultima)
  const last = new Map<string, Change>();
  for (const c of changes) last.set(c.path, c);
  const tree: any[] = [];
  for (const c of last.values()) {
    const path = `${REPO.prefix}/${c.path.replace(/^\.?\//, '')}`;
    if (c.remove) { tree.push({ path, mode: '100644', type: 'blob', sha: null }); continue; }
    const content = c.content ?? readFileSync(c.path);
    if (typeof content === 'string') { tree.push({ path, mode: '100644', type: 'blob', content }); continue; }
    const blob = await gh(token, repo('/git/blobs'), { method: 'POST', json: { content: Buffer.from(content).toString('base64'), encoding: 'base64' } });
    tree.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  let parent = base;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parentCommit = await gh(token, repo(`/git/commits/${parent}`));
    const newTree = await gh(token, repo('/git/trees'), { method: 'POST', json: { base_tree: parentCommit.tree.sha, tree } });
    const created = await gh(token, repo('/git/commits'), { method: 'POST', json: { message, tree: newTree.sha, parents: [parent] } });
    try {
      await gh(token, repo(`/git/refs/heads/${REPO.work}`), { method: 'PATCH', json: { sha: created.sha, force: false } });
      // se il ramo era andato avanti per altre modifiche, la copia locale non è più allineata: si riscarica alla prossima richiesta
      if (parent !== base) current = null;
      return created.sha;
    } catch (e) {
      if (!(e instanceof HttpError) || e.status !== 422) throw e;
      parent = await workHead(token); // qualcuno ha salvato nel frattempo: si riparte dalla sua commit
    }
  }
  throw new HttpError(409, 'Il ramo è cambiato più volte durante il salvataggio: riprova.');
}

// ---------------------------------------------------------------- pubblicazione
/** controlla l'utente (per le API che non hanno bisogno della copia dei file) */
export async function authorize(request: Request) {
  // cliente (email e password): il server lavora con l'app GitHub di Keystatic
  const client = await clientOf(request);
  if (client) return appToken(REPO.owner, REPO.name);
  const token = tokenOf(request);
  if (!token) throw new HttpError(401, 'Accedi al pannello per continuare.');
  await verify(token);
  return token;
}

/** porta nel ramo di lavoro le novità del sito pubblicato (codice nuovo, contenuti pubblicati da altri) */
export async function catchUp(token: string) {
  const cmp = await gh(token, repo(`/compare/${REPO.work}...${REPO.live}`));
  if (!cmp.ahead_by) return;
  try {
    await gh(token, repo('/merges'), { method: 'POST', json: { base: REPO.work, head: REPO.live, commit_message: 'Allinea i contenuti con il sito pubblicato' } });
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) throw new HttpError(409, 'Le stesse pagine sono state modificate sia nel pannello sia nel sito pubblicato: serve un intervento manuale su GitHub.');
    throw e;
  }
  current = null; // la copia locale va riscaricata
}

/** modifiche salvate nel pannello e non ancora pubblicate */
export async function pending(token: string) {
  await workHead(token);
  const cmp = await gh(token, repo(`/compare/${REPO.live}...${REPO.work}`));
  const files: string[] = (cmp.files ?? []).map((f: any) => String(f.filename).replace(`${REPO.prefix}/`, ''));
  return { commits: cmp.ahead_by as number, files };
}

/** pubblica: il sito (REPO.live) avanza fino al ramo di lavoro, poi Netlify ricostruisce il sito */
export async function publish(token: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    await catchUp(token);
    const head = await workHead(token);
    try {
      await gh(token, repo(`/git/refs/heads/${REPO.live}`), { method: 'PATCH', json: { sha: head, force: false } });
      return head;
    } catch (e) {
      if (!(e instanceof HttpError) || e.status !== 422) throw e; // il sito è cambiato in quel momento: si riallinea e si riprova
    }
  }
  throw new HttpError(409, 'Il sito pubblicato è cambiato durante la pubblicazione: riprova tra un attimo.');
}

/** risposta JSON con l'errore giusto (401 sessione scaduta, 403 permessi…) */
export const errorResponse = (e: unknown) => {
  const status = e instanceof HttpError ? e.status : 500;
  return new Response(JSON.stringify({ error: (e as Error)?.message ?? String(e) }), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};
