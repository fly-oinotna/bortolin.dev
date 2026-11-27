// COLORI DEL PANNELLO (/admin): per ogni progetto basta cambiare queste tre righe.
// Sostituiscono il blu di Keystatic ovunque: voce selezionata nella sidebar, pulsanti (Save, Crea…), switch,
// link, focus, tab a sinistra, selettore lingue, mediateca e pulsante "Pubblica".
export const ADMIN_THEME = {
  /** colore principale (pulsanti, voce selezionata, switch) */
  accent: '#99ea48',
  /** testo sopra il colore principale: nero sui colori chiari, bianco su quelli scuri */
  onAccent: '#000000',
  /** colore principale usato come TESTO su sfondo chiaro (deve essere leggibile su bianco) */
  accentTextLight: '#3f7a0b',
};

/**
 * CSS che ricolora Keystar UI (la grafica di Keystatic) partendo da ADMIN_THEME.
 * Keystar usa la scala "indigo" (1 = sfondo più tenue … 11 = testo) e alcuni alias "accent": si ricalcolano
 * tutti con color-mix, sia per il tema chiaro sia per quello scuro.
 */
export function adminThemeCss(t = ADMIN_THEME) {
  const mix = (pct: number, base: string) => `color-mix(in srgb, ${t.accent} ${pct}%, ${base})`;
  const scale = (bg: string, text: string) => `
    --kui-color-scale-indigo1: ${mix(4, bg)};
    --kui-color-scale-indigo2: ${mix(8, bg)};
    --kui-color-scale-indigo3: ${mix(14, bg)};
    --kui-color-scale-indigo4: ${mix(20, bg)};
    --kui-color-scale-indigo5: ${mix(28, bg)};
    --kui-color-scale-indigo6: ${mix(38, bg)};
    --kui-color-scale-indigo7: ${mix(52, bg)};
    --kui-color-scale-indigo8: ${mix(72, bg)};
    --kui-color-scale-indigo9: ${t.accent};
    --kui-color-scale-indigo10: ${mix(85, '#ffffff')};
    --kui-color-scale-indigo11: ${text};
    --kui-color-background-accent: ${mix(14, bg)};
    --kui-color-background-accent-emphasis: ${t.accent};
    --kui-color-border-accent: ${mix(38, bg)};
    --kui-color-foreground-accent: ${text};
    --kui-color-alias-foreground-focused: ${text};
    --kui-color-alias-foreground-selected: ${text};
    --kui-color-alias-border-focused: ${t.accent};
    --kui-color-alias-border-selected: ${t.accent};
    --kui-color-alias-focus-ring: ${t.accent};
    --kui-color-alias-background-selected: color-mix(in srgb, transparent, ${t.accent} 12%);
    --kui-color-alias-background-selected-hovered: color-mix(in srgb, transparent, ${t.accent} 22%);`;
  // Status colours (Dashboard: scores, bars, site check, Lighthouse) and neutral chart colour.
  // Deliberately independent of the brand accent: green/amber/red as in any UI, tuned for light and dark.
  const status = (dark: boolean) => dark
    ? `--bd-good: #3fb950; --bd-good-text: #56d364; --bd-warn: #d29922; --bd-warn-text: #e3b341; --bd-bad: #f85149; --bd-bad-text: #ff7b72; --bd-on-status: #0d1117; --bd-chart: #8b9bb4;`
    : `--bd-good: #2da44e; --bd-good-text: #1a7f37; --bd-warn: #d4a72c; --bd-warn-text: #9a6700; --bd-bad: #cf222e; --bd-bad-text: #cf222e; --bd-on-status: #ffffff; --bd-chart: #5b6b86;`;
  const light = scale('#ffffff', t.accentTextLight) + status(false);
  const dark = scale('#1b1b1b', t.accent) + status(true);
  return `
:root { --bd-accent: ${t.accent}; --bd-on-accent: ${t.onAccent}; }
:root .kui-theme.kui-scheme--light { ${light} }
:root .kui-theme.kui-scheme--dark { ${dark} }
@media (prefers-color-scheme: light) { :root .kui-theme.kui-scheme--auto { ${light} } }
@media (prefers-color-scheme: dark) { :root .kui-theme.kui-scheme--auto { ${dark} } }
/* testo dei pulsanti pieni con il colore principale (Save, Crea…): leggibile sul verde */
[data-prominence="high"][data-tone="accent"] { color: var(--bd-on-accent) !important; }
[data-prominence="high"][data-tone="accent"] svg { color: inherit; }
/* pulsante "Genera con AI" (campi SEO, mediateca) */
.bd-ai-gen { all: unset; cursor: pointer; padding: 4px 10px; border-radius: 999px; background: var(--bd-accent); color: var(--bd-on-accent); font: 600 12px/1.4 var(--kui-typography-font-family-base, system-ui, sans-serif); white-space: nowrap; }
.bd-ai-gen[disabled] { opacity: .6; cursor: progress; }
.bd-ai-gen:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 2px; }
`;
}
