// Campo di testo con contatore di caratteri live (solo nel pannello, non pesa sul sito).
// Stesse soglie ed etichette dei badge MT/MD: Troppo corto · Corto · Buono · Troppo lungo (src/lib/seo.ts).
import { fields } from '@keystatic/core';
import { createElement as h, useState } from 'react';
import { lengthStatus, length } from '../lib/seo';

interface CountedOptions {
  label: string;
  description?: string;
  multiline?: boolean;
  required?: boolean;
  limits: { short: number; good: number; max: number };
  /** pulsante "Genera con AI" (meta title o meta description), con l'AI scelta nella Dashboard */
  ai?: 'title' | 'description';
}

/** dove si trova il campo: singleton o voce di una collection, dall'indirizzo del pannello */
function location() {
  const p = window.location.pathname;
  let m = p.match(/\/singleton\/([^/]+)/);
  if (m) return { kind: 'singleton', key: decodeURIComponent(m[1]) };
  m = p.match(/\/collection\/([^/]+)\/item\/([^/]+)/);
  if (m) return { kind: 'collection', collection: decodeURIComponent(m[1]), slug: decodeURIComponent(m[2]) };
  return null;
}

function AiButton({ field, onChange }: { field: 'title' | 'description'; onChange: (v: string) => void }) {
  const [state, setState] = useState<{ busy: boolean; msg: string }>({ busy: false, msg: '' });
  const run = async () => {
    const loc = location();
    if (!loc) { setState({ busy: false, msg: 'Salva prima la voce: l’AI legge il contenuto salvato.' }); return; }
    setState({ busy: true, msg: '' });
    try {
      let provider = '';
      try { provider = localStorage.getItem('bd-ai-provider') || ''; } catch { /* nessuna preferenza */ }
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'seo', field, location: loc, provider }) });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || `Errore ${res.status}`);
      onChange(out[field]);
      setState({ busy: false, msg: 'Generato dal contenuto salvato: controllalo e salva.' });
    } catch (e) {
      setState({ busy: false, msg: (e as Error).message });
    }
  };
  return h('span', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: '1 1 auto' } },
    h('button', { type: 'button', onClick: run, disabled: state.busy, className: 'bd-ai-gen' }, state.busy ? 'Genero…' : '✦ Genera con AI'),
    state.msg && h('span', { style: { color: 'rgba(127,127,127,.95)', flexBasis: '100%' } }, state.msg));
}

export function counted(o: CountedOptions) {
  const base = fields.text({
    label: o.label,
    description: o.description,
    multiline: o.multiline,
    validation: o.required ? { isRequired: true } : undefined,
  });
  const BaseInput = base.Input;
  return {
    ...base,
    Input(props: any) {
      const n = length(props.value);
      const s = lengthStatus(n, o.limits);
      const pct = Math.min(100, Math.round((n / o.limits.max) * 100));
      return h('div', { style: { display: 'grid', gap: 6 } },
        h(BaseInput, props),
        h('div', { 'aria-live': 'polite', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif)' } },
          h('div', { style: { flex: '0 0 120px', height: 6, borderRadius: 3, background: 'rgba(127,127,127,.25)', overflow: 'hidden' } },
            h('div', { style: { width: `${pct}%`, height: '100%', background: s.color, transition: 'width .15s, background .15s' } })),
          h('strong', { style: { color: s.color, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' } }, `${n} caratteri - ${s.label}`),
          h('span', { style: { color: 'rgba(127,127,127,.9)', whiteSpace: 'nowrap' } }, `consigliati ${o.limits.good}–${o.limits.max}`),
          o.ai && h(AiButton, { field: o.ai, onChange: props.onChange }),
        ),
      );
    },
  } as typeof base;
}
