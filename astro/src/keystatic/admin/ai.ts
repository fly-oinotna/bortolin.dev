// AI DEL PANNELLO: una sola funzione per Claude, ChatGPT e Gemini (traduzioni, meta title/description, testi alternativi).
// L'utente sceglie quale usare nella Dashboard (scheda "AI del pannello"); si usa solo se la sua chiave è nel .env / Netlify:
//   ANTHROPIC_API_KEY (Claude) · OPENAI_API_KEY (ChatGPT) · GEMINI_API_KEY (Gemini)
// Modelli predefiniti modificabili senza toccare il codice: ANTHROPIC_MODEL, OPENAI_MODEL, GEMINI_MODEL.
// Ogni risposta è JSON con uno schema preciso (structured output), così il pannello non deve "indovinare" il testo.
import Anthropic from '@anthropic-ai/sdk';

export type Provider = 'claude' | 'openai' | 'gemini';
export const PROVIDERS: Record<Provider, { label: string; env: string }> = {
  claude: { label: 'Claude', env: 'ANTHROPIC_API_KEY' },
  openai: { label: 'ChatGPT', env: 'OPENAI_API_KEY' },
  gemini: { label: 'Gemini', env: 'GEMINI_API_KEY' },
};

// import.meta.env va letto con il nome esplicito (Vite lo sostituisce al momento della build)
const keys = (): Record<Provider, string | undefined> => ({
  claude: import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY,
  openai: import.meta.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  gemini: import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
});
const model = (p: Provider) => ({
  claude: import.meta.env.ANTHROPIC_MODEL || process.env.ANTHROPIC_MODEL || 'claude-opus-5-5',
  openai: import.meta.env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-5',
  gemini: import.meta.env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-pro',
})[p];

/** AI con la chiave configurata */
export const available = (): Provider[] => (Object.keys(PROVIDERS) as Provider[]).filter((p) => !!keys()[p]);

/** quella scelta dall'utente se ha la chiave, altrimenti la prima disponibile */
export function pick(requested?: string | null): Provider {
  const ok = available();
  if (requested && ok.includes(requested as Provider)) return requested as Provider;
  if (ok.length) return ok[0];
  throw new Error('Nessuna AI configurata: aggiungi ANTHROPIC_API_KEY, OPENAI_API_KEY o GEMINI_API_KEY nel file .env (in locale) o nelle variabili d’ambiente di Netlify (online).');
}

export interface GenerateOptions {
  provider: Provider;
  system: string;
  user: string;
  /** JSON Schema della risposta (oggetto, con additionalProperties: false e tutti i campi required) */
  schema: Record<string, unknown>;
  /** immagine da descrivere (base64, senza prefisso) */
  image?: { data: string; mime: string };
  /** quanto ragionare: alto per le traduzioni, medio per meta e testi alternativi */
  effort?: 'medium' | 'high';
  maxTokens?: number;
}

export async function generateJSON<T = any>(o: GenerateOptions): Promise<T> {
  const key = keys()[o.provider];
  if (!key) throw new Error(`Chiave mancante per ${PROVIDERS[o.provider].label}: aggiungi ${PROVIDERS[o.provider].env}.`);
  const text = o.provider === 'claude' ? await claude(key, o) : o.provider === 'openai' ? await openai(key, o) : await gemini(key, o);
  try { return JSON.parse(text) as T; } catch { throw new Error(`${PROVIDERS[o.provider].label} ha risposto in un formato non valido: riprova.`); }
}

async function claude(apiKey: string, o: GenerateOptions) {
  const client = new Anthropic({ apiKey });
  const content: any[] = [];
  if (o.image) content.push({ type: 'image', source: { type: 'base64', media_type: o.image.mime, data: o.image.data } });
  content.push({ type: 'text', text: o.user });
  const stream = client.beta.messages.stream({
    model: model('claude'),
    max_tokens: o.maxTokens ?? 32000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: o.effort ?? 'high', format: { type: 'json_schema', schema: o.schema } },
    system: o.system,
    messages: [{ role: 'user', content }],
  } as any);
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('La richiesta è stata rifiutata dal modello.');
  if (msg.stop_reason === 'max_tokens') throw new Error('Il testo è troppo lungo per una sola richiesta.');
  return msg.content.flatMap((b: any) => (b.type === 'text' ? [b.text] : [])).join('');
}

async function openai(apiKey: string, o: GenerateOptions) {
  const content: any[] = [{ type: 'input_text', text: o.user }];
  if (o.image) content.push({ type: 'input_image', image_url: `data:${o.image.mime};base64,${o.image.data}` });
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model('openai'),
      instructions: o.system,
      input: [{ role: 'user', content }],
      reasoning: { effort: o.effort ?? 'high' },
      max_output_tokens: o.maxTokens ?? 32000,
      text: { format: { type: 'json_schema', name: 'risposta', schema: o.schema, strict: true } },
    }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(`ChatGPT: ${out?.error?.message ?? res.status}`);
  const text = (out.output ?? []).flatMap((m: any) => (m.type === 'message' ? m.content : [])).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('');
  if (!text) throw new Error('ChatGPT non ha restituito testo (risposta incompleta o rifiutata).');
  return text;
}

async function gemini(apiKey: string, o: GenerateOptions) {
  const parts: any[] = [{ text: o.user }];
  if (o.image) parts.push({ inline_data: { mime_type: o.image.mime, data: o.image.data } });
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model('gemini'))}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { responseMimeType: 'application/json', responseJsonSchema: o.schema, maxOutputTokens: o.maxTokens ?? 32000 },
    }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(`Gemini: ${out?.error?.message ?? res.status}`);
  const text = (out.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
  if (!text) throw new Error(`Gemini non ha restituito testo${out.candidates?.[0]?.finishReason ? ` (${out.candidates[0].finishReason})` : ''}.`);
  return text;
}
