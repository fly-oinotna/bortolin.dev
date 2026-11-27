// TESTI DI KEYSTATIC NELLA LINGUA DEL PANNELLO. Keystatic traduce da sé solo una ventina di comandi (config.locale):
// molti altri sono scritti in inglese nel suo codice ("Save", "Reset", "Delete entry…", barra dell'editor…).
// Qui si traducono nel DOM, solo a testo identico: testi e attributi aria-label, placeholder, title.
// Mai dentro l'editor di testo (contenteditable), nei campi o nei nostri riquadri (.bd-*), che usano t().
import { uiLang, type UiLang } from './ui-i18n';

type Tr = Partial<Record<Exclude<UiLang, 'en'>, string>>;
/** testo inglese di Keystatic → it, es, de */
const EN: Record<string, Tr> = {
  'Add': { it: 'Aggiungi', es: 'Añadir', de: 'Hinzufügen' },
  'Save': { it: 'Salva', es: 'Guardar', de: 'Speichern' },
  'Reset': { it: 'Ripristina', es: 'Restablecer', de: 'Zurücksetzen' },
  'Reset changes': { it: 'Annulla le modifiche', es: 'Descartar cambios', de: 'Änderungen verwerfen' },
  'Name': { it: 'Nome', es: 'Nombre', de: 'Name' },
  'Slug': { it: 'Slug', es: 'Slug', de: 'Slug' },
  'Status': { it: 'Stato', es: 'Estado', de: 'Status' },
  'Copy entry': { it: 'Copia voce', es: 'Copiar entrada', de: 'Eintrag kopieren' },
  'Paste entry': { it: 'Incolla voce', es: 'Pegar entrada', de: 'Eintrag einfügen' },
  'Duplicate entry…': { it: 'Duplica voce…', es: 'Duplicar entrada…', de: 'Eintrag duplizieren…' },
  'Delete entry…': { it: 'Elimina voce…', es: 'Eliminar entrada…', de: 'Eintrag löschen…' },
  'Delete entry': { it: 'Elimina voce', es: 'Eliminar entrada', de: 'Eintrag löschen' },
  'Save and duplicate entry': { it: 'Salva e duplica', es: 'Guardar y duplicar', de: 'Speichern und duplizieren' },
  'You have unsaved changes. Save this entry to duplicate it.': { it: 'Ci sono modifiche non salvate: salva la voce per duplicarla.', es: 'Hay cambios sin guardar: guarda la entrada para duplicarla.', de: 'Es gibt ungespeicherte Änderungen. Speichern Sie den Eintrag, um ihn zu duplizieren.' },
  'Are you sure? This action cannot be undone.': { it: 'Sei sicuro? L’operazione non si può annullare.', es: '¿Seguro? Esta acción no se puede deshacer.', de: 'Sind Sie sicher? Dies lässt sich nicht rückgängig machen.' },
  'Contains invalid fields. Please edit.': { it: 'Contiene campi non validi: correggili.', es: 'Contiene campos no válidos: corrígelos.', de: 'Enthält ungültige Felder. Bitte korrigieren.' },
  'Unsaved': { it: 'Non salvato', es: 'Sin guardar', de: 'Nicht gespeichert' },
  'Changed': { it: 'Modificato', es: 'Modificado', de: 'Geändert' },
  'Saving changes': { it: 'Salvataggio in corso', es: 'Guardando cambios', de: 'Änderungen werden gespeichert' },
  'Creating entry': { it: 'Creazione in corso', es: 'Creando entrada', de: 'Eintrag wird erstellt' },
  'Entry created': { it: 'Voce creata', es: 'Entrada creada', de: 'Eintrag erstellt' },
  'Entry pasted': { it: 'Voce incollata', es: 'Entrada pegada', de: 'Eintrag eingefügt' },
  'Entry not found.': { it: 'Voce non trovata.', es: 'Entrada no encontrada.', de: 'Eintrag nicht gefunden.' },
  'Entry not found in clipboard': { it: 'Nessuna voce negli appunti', es: 'No hay ninguna entrada en el portapapeles', de: 'Kein Eintrag in der Zwischenablage' },
  'Failed to read clipboard': { it: 'Impossibile leggere gli appunti', es: 'No se ha podido leer el portapapeles', de: 'Zwischenablage konnte nicht gelesen werden' },
  'Failed to paste because clipboard access was denied': { it: 'Impossibile incollare: accesso agli appunti negato', es: 'No se ha podido pegar: acceso al portapapeles denegado', de: 'Einfügen nicht möglich: Zugriff auf die Zwischenablage verweigert' },
  'Empty collection': { it: 'Nessuna voce', es: 'Sin entradas', de: 'Keine Einträge' },
  'Create the first entry': { it: 'Crea la prima voce', es: 'Crea la primera entrada', de: 'Ersten Eintrag erstellen' },
  'Unable to load collection': { it: 'Impossibile caricare l’elenco', es: 'No se ha podido cargar la lista', de: 'Liste konnte nicht geladen werden' },
  'Loading Entries': { it: 'Caricamento delle voci', es: 'Cargando entradas', de: 'Einträge werden geladen' },
  'Loading Item': { it: 'Caricamento', es: 'Cargando', de: 'Wird geladen' },
  'Not found': { it: 'Non trovato', es: 'No encontrado', de: 'Nicht gefunden' },
  'This page could not be found.': { it: 'Pagina non trovata.', es: 'No se ha encontrado la página.', de: 'Seite nicht gefunden.' },
  'No results': { it: 'Nessun risultato', es: 'Sin resultados', de: 'Keine Ergebnisse' },
  'No results…': { it: 'Nessun risultato…', es: 'Sin resultados…', de: 'Keine Ergebnisse…' },
  'Open app navigation': { it: 'Apri il menu', es: 'Abrir menú', de: 'Menü öffnen' },
  'show search': { it: 'Mostra la ricerca', es: 'Mostrar búsqueda', de: 'Suche anzeigen' },
  'theme': { it: 'Tema', es: 'Tema', de: 'Design' },
  'Light': { it: 'Chiaro', es: 'Claro', de: 'Hell' },
  'Dark': { it: 'Scuro', es: 'Oscuro', de: 'Dunkel' },
  'System': { it: 'Come il sistema', es: 'Según el sistema', de: 'Wie das System' },
  'Resize': { it: 'Ridimensiona', es: 'Redimensionar', de: 'Größe ändern' },
  'Breadcrumb': { it: 'Percorso', es: 'Ruta', de: 'Pfad' },
  'Log out': { it: 'Esci', es: 'Cerrar sesión', de: 'Abmelden' },
  'User menu': { it: 'Menu utente', es: 'Menú de usuario', de: 'Benutzermenü' },
  'Account': { it: 'Account', es: 'Cuenta', de: 'Konto' },
  'View on GitHub': { it: 'Vedi su GitHub', es: 'Ver en GitHub', de: 'Auf GitHub ansehen' },
  // campi: elenchi, immagini, file
  'Add item': { it: 'Aggiungi elemento', es: 'Añadir elemento', de: 'Element hinzufügen' },
  'Edit item': { it: 'Modifica elemento', es: 'Editar elemento', de: 'Element bearbeiten' },
  'Empty list': { it: 'Elenco vuoto', es: 'Lista vacía', de: 'Leere Liste' },
  'Add the first item to see it here.': { it: 'Aggiungi il primo elemento per vederlo qui.', es: 'Añade el primer elemento para verlo aquí.', de: 'Fügen Sie das erste Element hinzu, um es hier zu sehen.' },
  'Regenerate': { it: 'Rigenera', es: 'Regenerar', de: 'Neu erzeugen' },
  'Remove': { it: 'Rimuovi', es: 'Quitar', de: 'Entfernen' },
  'Edit': { it: 'Modifica', es: 'Editar', de: 'Bearbeiten' },
  'Done': { it: 'Fatto', es: 'Hecho', de: 'Fertig' },
  'Cancel': { it: 'Annulla', es: 'Cancelar', de: 'Abbrechen' },
  'Delete': { it: 'Elimina', es: 'Eliminar', de: 'Löschen' },
  'Options': { it: 'Opzioni', es: 'Opciones', de: 'Optionen' },
  'Preview': { it: 'Anteprima', es: 'Vista previa', de: 'Vorschau' },
  'Choose file': { it: 'Scegli file', es: 'Elegir archivio', de: 'Datei auswählen' },
  'Download': { it: 'Scarica', es: 'Descargar', de: 'Herunterladen' },
  'File name': { it: 'Nome del file', es: 'Nombre del archivo', de: 'Dateiname' },
  'Filename': { it: 'Nome del file', es: 'Nombre del archivo', de: 'Dateiname' },
  'Alt text': { it: 'Testo alternativo', es: 'Texto alternativo', de: 'Alternativtext' },
  'Title': { it: 'Titolo', es: 'Título', de: 'Titel' },
  'Width': { it: 'Larghezza', es: 'Ancho', de: 'Breite' },
  'Height': { it: 'Altezza', es: 'Alto', de: 'Höhe' },
  'Constrain proportions': { it: 'Mantieni le proporzioni', es: 'Mantener proporciones', de: 'Proportionen beibehalten' },
  'Image details': { it: 'Dettagli immagine', es: 'Detalles de la imagen', de: 'Bilddetails' },
  'Remove Image': { it: 'Rimuovi immagine', es: 'Quitar imagen', de: 'Bild entfernen' },
  'Edit Image Options': { it: 'Opzioni immagine', es: 'Opciones de imagen', de: 'Bildoptionen' },
  'Uploading image…': { it: 'Caricamento dell’immagine…', es: 'Subiendo imagen…', de: 'Bild wird hochgeladen…' },
  'Image uploaded': { it: 'Immagine caricata', es: 'Imagen subida', de: 'Bild hochgeladen' },
  'This text will be used by screen readers and search engines.': { it: 'Lo leggono gli screen reader e i motori di ricerca.', es: 'Lo usan los lectores de pantalla y los buscadores.', de: 'Wird von Screenreadern und Suchmaschinen verwendet.' },
  // editor di testo
  'Text formatting': { it: 'Formattazione', es: 'Formato', de: 'Formatierung' },
  'Formatting options': { it: 'Opzioni di formattazione', es: 'Opciones de formato', de: 'Formatierungsoptionen' },
  'Text Alignment': { it: 'Allineamento', es: 'Alineación', de: 'Ausrichtung' },
  'Align Start': { it: 'Allinea a sinistra', es: 'Alinear a la izquierda', de: 'Linksbündig' },
  'Align Center': { it: 'Centra', es: 'Centrar', de: 'Zentriert' },
  'Align End': { it: 'Allinea a destra', es: 'Alinear a la derecha', de: 'Rechtsbündig' },
  'Bold': { it: 'Grassetto', es: 'Negrita', de: 'Fett' },
  'Italic': { it: 'Corsivo', es: 'Cursiva', de: 'Kursiv' },
  'Underline': { it: 'Sottolineato', es: 'Subrayado', de: 'Unterstrichen' },
  'Strikethrough': { it: 'Barrato', es: 'Tachado', de: 'Durchgestrichen' },
  'Code': { it: 'Codice', es: 'Código', de: 'Code' },
  'Subscript': { it: 'Pedice', es: 'Subíndice', de: 'Tiefgestellt' },
  'Superscript': { it: 'Apice', es: 'Superíndice', de: 'Hochgestellt' },
  'Clear formatting': { it: 'Rimuovi formattazione', es: 'Quitar formato', de: 'Formatierung entfernen' },
  'Link': { it: 'Link', es: 'Enlace', de: 'Link' },
  'Unlink': { it: 'Rimuovi link', es: 'Quitar enlace', de: 'Link entfernen' },
  'Lists': { it: 'Elenchi', es: 'Listas', de: 'Listen' },
  'Bullet list': { it: 'Elenco puntato', es: 'Lista con viñetas', de: 'Aufzählung' },
  'Bullet List': { it: 'Elenco puntato', es: 'Lista con viñetas', de: 'Aufzählung' },
  'Numbered list': { it: 'Elenco numerato', es: 'Lista numerada', de: 'Nummerierte Liste' },
  'Numbered List': { it: 'Elenco numerato', es: 'Lista numerada', de: 'Nummerierte Liste' },
  'Ordered list': { it: 'Elenco numerato', es: 'Lista numerada', de: 'Nummerierte Liste' },
  'Blockquote': { it: 'Citazione', es: 'Cita', de: 'Zitat' },
  'Quote': { it: 'Citazione', es: 'Cita', de: 'Zitat' },
  'Divider': { it: 'Separatore', es: 'Separador', de: 'Trennlinie' },
  'Image': { it: 'Immagine', es: 'Imagen', de: 'Bild' },
  'Table': { it: 'Tabella', es: 'Tabla', de: 'Tabelle' },
  'Code block': { it: 'Blocco di codice', es: 'Bloque de código', de: 'Codeblock' },
  'Text': { it: 'Testo', es: 'Texto', de: 'Text' },
  'Plain text': { it: 'Testo semplice', es: 'Texto sin formato', de: 'Nur Text' },
  'Insert': { it: 'Inserisci', es: 'Insertar', de: 'Einfügen' },
  'Insert menu': { it: 'Menu Inserisci', es: 'Menú Insertar', de: 'Menü Einfügen' },
  'Insert block': { it: 'Inserisci blocco', es: 'Insertar bloque', de: 'Block einfügen' },
  'Blocks': { it: 'Blocchi', es: 'Bloques', de: 'Blöcke' },
  'Header row': { it: 'Riga di intestazione', es: 'Fila de encabezado', de: 'Kopfzeile' },
  'Insert row below': { it: 'Inserisci riga sotto', es: 'Insertar fila debajo', de: 'Zeile darunter einfügen' },
  'Insert column right': { it: 'Inserisci colonna a destra', es: 'Insertar columna a la derecha', de: 'Spalte rechts einfügen' },
  'Delete row': { it: 'Elimina riga', es: 'Eliminar fila', de: 'Zeile löschen' },
  'Delete column': { it: 'Elimina colonna', es: 'Eliminar columna', de: 'Spalte löschen' },
  'Cell options': { it: 'Opzioni cella', es: 'Opciones de celda', de: 'Zellenoptionen' },
  'Select Table': { it: 'Seleziona tabella', es: 'Seleccionar tabla', de: 'Tabelle auswählen' },
  'Select Row': { it: 'Seleziona riga', es: 'Seleccionar fila', de: 'Zeile auswählen' },
  'Select Column': { it: 'Seleziona colonna', es: 'Seleccionar columna', de: 'Spalte auswählen' },
};

/** traduzioni di Keystatic da correggere (lingua → testo di Keystatic → testo giusto) */
const FIX: Partial<Record<UiLang, Record<string, string>>> = {
  it: { 'Aggiungere': 'Aggiungi', 'Creare': 'Crea', 'Modificare': 'Modifica', 'Eliminare': 'Elimina', 'Pannello di controllo': 'Dashboard', 'Nuova filiale': 'Nuovo ramo' },
  es: { 'Agregar': 'Añadir', 'Panel': 'Dashboard', 'Borrar': 'Eliminar' },
};

/** testi con un numero: "12 entries", "Heading 2" */
const PATTERNS: [RegExp, Tr][] = [
  [/^1 entry$/, { it: '1 voce', es: '1 entrada', de: '1 Eintrag' }],
  [/^(\d+) entries$/, { it: '$1 voci', es: '$1 entradas', de: '$1 Einträge' }],
  [/^Heading (\d)$/, { it: 'Titolo $1', es: 'Título $1', de: 'Überschrift $1' }],
];

function translate(text: string, lang: UiLang): string | null {
  if (lang === 'en') return null;
  const fix = FIX[lang]?.[text];
  if (fix) return fix;
  const hit = EN[text]?.[lang];
  if (hit) return hit;
  for (const [re, tr] of PATTERNS) if (re.test(text) && tr[lang]) return text.replace(re, tr[lang]!);
  return null;
}

const ATTRS = ['aria-label', 'placeholder', 'title'];
const skip = (el: Element | null) => !el || !!el.closest('[class^="bd-"], [class*=" bd-"], [contenteditable="true"], input, textarea, script, style');

function apply(root: Node, lang: UiLang) {
  const scope = root.nodeType === Node.TEXT_NODE ? root.parentElement : (root as Element);
  if (!scope || skip(scope as Element)) return;
  if (root.nodeType === Node.TEXT_NODE) { one(root as Text, lang); return; }
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) if (!skip(n.parentElement)) one(n as Text, lang);
  const els = [root as Element, ...(root as Element).querySelectorAll('[aria-label], [placeholder], [title]')];
  for (const el of els) {
    if (!(el instanceof Element) || skip(el)) continue;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      const tr = v && translate(v.trim(), lang);
      if (tr && tr !== v) el.setAttribute(a, tr);
    }
  }
}

function one(n: Text, lang: UiLang) {
  const v = n.nodeValue ?? '';
  const k = v.trim();
  if (!k || !/[A-Za-z]/.test(k)) return;
  const tr = translate(k, lang);
  if (tr && tr !== k) n.nodeValue = v.replace(k, tr);
}

const lang = uiLang();
if (lang !== 'en') {
  apply(document.body, lang);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') one(m.target as Text, lang);
      else if (m.type === 'attributes') apply(m.target, lang);
      else m.addedNodes.forEach((n) => apply(n, lang));
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
