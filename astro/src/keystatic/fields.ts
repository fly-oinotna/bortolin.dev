// Campi di Keystatic con etichette sempre uguali in tutto il sito (stesso criterio dei campi ACF):
//   Etichetta · Titolo (H1/H2/H3) · Testo (editor) · Immagine · Pulsante: testo / destinazione
// Repeater con il nome del contenuto; nelle voci "Titolo" e "Testo" a tutta larghezza.
import { fields, type ComponentSchema } from '@keystatic/core';
import { mark } from '@keystatic/core/content-components';
import { createElement } from 'react';
import { Icon } from '@keystar/ui/icon';
import { Switch } from '@keystar/ui/switch';
import { Button } from '@keystar/ui/button';
import { highlighterIcon } from '@keystar/ui/icon/icons/highlighterIcon';
import { ICON_NAMES } from '../lib/icons';
import { PAGES, CUSTOM } from './pages';

// ---------------------------------------------------------------- base
export const t = (label: string, description?: string) => fields.text({ label, description });
export const ta = (label = 'Testo', description?: string) => fields.text({ label, description, multiline: true });
export const num = (label: string, defaultValue = 0) => fields.integer({ label, defaultValue });

// ---------------------------------------------------------------- interruttori
function switchField(label: string, defaultValue: boolean, controlsNext: boolean) {
  const base = fields.checkbox({ label, defaultValue });
  return {
    ...base,
    Input: (props: any) =>
      createElement('div', controlsNext ? { 'data-bd-switch': '', 'data-bd-toggle': '', 'data-on': String(!!props.value) } : { 'data-bd-switch': '' },
        createElement(Switch, { isSelected: !!props.value, onChange: props.onChange, autoFocus: props.autoFocus }, label)),
  } as typeof base;
}

/** Interruttore sì/no (switch al posto della checkbox) */
export const check = (label: string, defaultValue = false) => switchField(label, defaultValue, false);

/**
 * Interruttore che mostra/nasconde i campi che lo seguono nello stesso gruppo (come la logica condizionale di ACF).
 * I campi vengono solo nascosti a video (src/keystatic/admin/toggles.ts): i loro valori restano sempre salvati.
 * Va messo PRIMA dei campi che controlla, e quei campi devono stare in fondo al gruppo.
 */
export const toggle = (label: string, defaultValue = false) => switchField(label, defaultValue, true);

/**
 * Separatore invisibile per uno switch `toggle` "se/altrimenti": i campi tra lo switch e il separatore
 * si vedono con lo switch acceso, quelli dopo il separatore con lo switch spento (src/keystatic/admin/toggles.ts).
 * Non salva nulla nel JSON.
 */
export const otherwise = () => {
  const base = fields.empty();
  return { ...base, Input: () => createElement('div', { 'data-bd-else': '' }) } as typeof base;
};

/**
 * Campo (o gruppo) UGUALE IN TUTTE LE LINGUE: si compila solo nella versione italiana
 * e nelle traduzioni non compare (es. telefono, e-mail, ID di Google). Vedi src/keystatic/i18n.ts.
 */
export const shared = <F,>(field: F): F => ({ ...(field as object), __bdShared: true }) as F;

// ---------------------------------------------------------------- etichette standard
/** Etichetta sopra il titolo (il numero 01, 02… lo aggiunge il sito) */
export const eyebrow = () => t('Etichetta');
/** Titolo obbligatorio con il livello: Titolo (H2) */
export const title = (level: 'H1' | 'H2' | 'H3' | null = 'H2', label = 'Titolo') =>
  fields.text({ label: level ? `${label} (${level})` : label, validation: { isRequired: true } });

/** Evidenziatore verde dell'editor: nel sito diventa testo verde */
const verde = mark({
  label: 'Verde',
  icon: createElement(Icon, { src: highlighterIcon }),
  schema: {},
  tag: 'span',
  style: { color: 'inherit', backgroundColor: 'rgba(153, 234, 72, .25)', boxShadow: 'inset 0 -2px 0 #99ea48', borderRadius: '2px', padding: '0 2px' },
});

/** Testo con editor: grassetto, corsivo, link, verde. I paragrafi si scrivono dentro l'editor. */
export const text = (label = 'Testo', description?: string) =>
  fields.markdoc.inline({
    label,
    description,
    options: {
      bold: true, italic: true, link: true,
      strikethrough: false, code: false, heading: false, blockquote: false, orderedList: false,
      unorderedList: false, table: false, image: false, divider: false, codeBlock: false,
    },
    components: { verde },
  });

/** Testo lungo per pagine e post: come `text` più titoli H2/H3, elenchi e separatore */
export const longText = (label = 'Testo', description?: string) =>
  fields.markdoc.inline({
    label,
    description,
    options: {
      bold: true, italic: true, link: true, heading: [2, 3], orderedList: true, unorderedList: true, divider: true, blockquote: true,
      strikethrough: false, code: false, table: false, image: false, codeBlock: false,
    },
    components: { verde },
  });

/**
 * Immagine dalla MEDIATECA: si sceglie dalla libreria (o si carica lì una nuova immagine).
 * Salva il percorso "/src/assets/images/…": nel sito Astro la ottimizza come sempre (Img.astro).
 * La libreria è in src/keystatic/admin/media.ts; i file non vengono più rinominati al salvataggio.
 * `_dir` resta per compatibilità con le chiamate esistenti (le nuove immagini vanno in src/assets/images/library/).
 */
export const image = (_dir: string, label = 'Immagine', opts: { required?: boolean; description?: string; inherit?: boolean } = {}) => {
  const base = fields.text({ label, description: opts.description, validation: opts.required ? { isRequired: true } : undefined });
  return {
    ...base,
    Input: (props: any) => createElement(MediaInput, { ...props, label, description: opts.description, required: opts.required }),
    // per le traduzioni (src/keystatic/i18n.ts): nelle altre lingue diventa "Usa l'immagine italiana" (salvo inherit: false)
    __bdImage: { label, opts },
  } as typeof base;
};

/** Valore salvato nelle traduzioni quando l'immagine è quella della versione italiana */
export const SAME_AS_IT = '@it';

/**
 * Immagine nelle TRADUZIONI: interruttore "Usa l'immagine italiana" (acceso di default).
 * Acceso → salva "@it" e il sito usa sempre l'immagine scelta nella pagina italiana; spento → si sceglie un'altra immagine.
 */
export const translatedImage = (label = 'Immagine', opts: { required?: boolean; description?: string } = {}) => {
  const base = fields.text({ label, description: opts.description, defaultValue: SAME_AS_IT });
  return {
    ...base,
    Input: (props: any) => {
      const same = props.value === SAME_AS_IT;
      return createElement('div', { style: { display: 'grid', gap: 10 } },
        createElement('div', { 'data-bd-switch': '' },
          createElement(Switch, { isSelected: same, onChange: (on: boolean) => props.onChange(on ? SAME_AS_IT : '') }, `${label}: usa l’immagine italiana`)),
        !same && createElement(MediaInput, { ...props, label, description: opts.description, required: opts.required }),
      );
    },
    __bdTranslatedImage: true,
  } as typeof base;
};

function MediaInput(props: { value: string; onChange: (v: string) => void; label: string; description?: string; required?: boolean; forceValidation?: boolean }) {
  const { value, onChange, label, description, required, forceValidation } = props;
  const open = () => (window as any).bdMedia?.open({ selected: value, onSelect: (path: string) => onChange(path) });
  const font = 'var(--kui-typography-font-family-base, system-ui, -apple-system, "Segoe UI", sans-serif)';
  return createElement('div', { style: { display: 'grid', gap: 8, fontFamily: font } },
    createElement('span', { style: { fontSize: 14, fontWeight: 600 } }, label, required && createElement('span', { style: { color: '#f44336', marginLeft: 3 } }, '*')),
    description && createElement('span', { style: { fontSize: 12, opacity: 0.7 } }, description),
    createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
      value && createElement('button', {
        type: 'button', onClick: open, title: 'Cambia immagine',
        style: { all: 'unset', cursor: 'pointer', width: 120, height: 90, borderRadius: 8, border: '1px solid rgba(127,127,127,.35)', background: 'repeating-conic-gradient(rgba(127,127,127,.18) 0 25%, transparent 0 50%) 0 0/14px 14px', display: 'grid', placeItems: 'center', overflow: 'hidden' },
      }, createElement('img', { src: `/api/media?file=${encodeURIComponent(value)}`, alt: '', style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' } })),
      createElement(Button, { onPress: open }, value ? 'Cambia dalla libreria' : 'Scegli dalla libreria'),
      value && createElement(Button, { prominence: 'low', onPress: () => onChange('') }, 'Rimuovi'),
    ),
    value && createElement('span', { style: { fontSize: 12, opacity: 0.6, wordBreak: 'break-all' } }, value.replace('/src/assets/images/', '')),
    forceValidation && required && !value && createElement('span', { style: { fontSize: 12, color: '#f44336' } }, `${label} è obbligatoria`),
  );
}
export const alt = () => t('Immagine: testo alternativo');

/** Destinazione di un link: pagina del sito oppure indirizzo libero */
export const destination = (label = 'Destinazione') => ({
  ...fields.conditional(
    fields.select({ label, options: [...PAGES, { value: CUSTOM, label: 'Altro indirizzo…' }], defaultValue: '#contatti' }),
    Object.fromEntries([
      ...PAGES.map((p) => [p.value, fields.empty()]),
      [CUSTOM, t('Indirizzo', 'Es. https://… oppure /pagina/#sezione')],
    ]) as any,
  ),
  // nelle traduzioni i link puntano alla pagina nella stessa lingua (src/lib/i18n.ts)
  __bdDest: true,
});

/** Pulsante o link di una sezione: due campi "piatti" (es. Pulsante: testo, Pulsante: destinazione) */
export const button = <N extends string>(name: N, label = 'Pulsante') =>
  ({
    [`${name}Label`]: t(`${label}: testo`),
    [`${name}Link`]: destination(`${label}: destinazione`),
  }) as Record<`${N}Label`, ReturnType<typeof t>> & Record<`${N}Link`, ReturnType<typeof destination>>;

export const icon = (label = 'Icona') =>
  fields.select({ label, options: ICON_NAMES.map((v) => ({ label: v, value: v })), defaultValue: ICON_NAMES[0] });

// ---------------------------------------------------------------- repeater
/** Repeater di voci; nell'elenco ogni voce mostra il campo `labelKey` */
export const repeater = <S extends Record<string, ComponentSchema>>(label: string, schema: S, labelKey: keyof S & string) =>
  fields.array(fields.object(schema), { label, itemLabel: (p: any) => labelText(p.fields[labelKey]?.value) });
/** Etichetta di una voce: testo semplice, oppure il testo di un editor (stato ProseMirror) accorciato */
const labelText = (v: any): string => {
  const s = typeof v === 'string' ? v : typeof v?.doc?.textContent === 'string' ? v.doc.textContent : '';
  return s ? (s.length > 80 ? s.slice(0, 80) + '…' : s) : '—';
};
/** Repeater di semplici testi */
export const texts = (label: string, itemLabel = 'Testo') =>
  fields.array(t(itemLabel), { label, itemLabel: (p) => p.value || '—' });
