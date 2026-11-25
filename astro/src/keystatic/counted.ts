// Campo di testo con contatore di caratteri live (solo nel pannello, non pesa sul sito).
// Stesse soglie ed etichette dei badge MT/MD: Troppo corto · Corto · Buono · Troppo lungo (src/lib/seo.ts).
import { fields } from '@keystatic/core';
import { createElement as h } from 'react';
import { lengthStatus, length } from '../lib/seo';

interface CountedOptions {
  label: string;
  description?: string;
  multiline?: boolean;
  required?: boolean;
  limits: { short: number; good: number; max: number };
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
        h('div', { 'aria-live': 'polite', style: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: 'var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif)' } },
          h('div', { style: { flex: '0 0 120px', height: 6, borderRadius: 3, background: 'rgba(127,127,127,.25)', overflow: 'hidden' } },
            h('div', { style: { width: `${pct}%`, height: '100%', background: s.color, transition: 'width .15s, background .15s' } })),
          h('strong', { style: { color: s.color, fontVariantNumeric: 'tabular-nums' } }, `${n} caratteri - ${s.label}`),
          h('span', { style: { color: 'rgba(127,127,127,.9)' } }, `consigliati ${o.limits.good}–${o.limits.max}`),
        ),
      );
    },
  } as typeof base;
}
