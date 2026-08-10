import type { TemplateId } from '@/types/menu'

/**
 * Las tres plantillas comparten forma y orden — la del diseño «Clásica» — y solo
 * cambian de color.
 *
 * Es una decisión deliberada: mantener tres maquetaciones distintas multiplicaba
 * por tres el trabajo de cada ajuste (el recorte del ajuste automático, la regla
 * de descripciones, la de destacados) y triplicaba la superficie donde algo se
 * podía romper. Una sola maquetación, tres paletas. Cuando haga falta una forma
 * realmente distinta, `TemplateDefinition.Component` sigue admitiendo cualquier
 * componente: esta unificación no cierra esa puerta.
 *
 * Cada entrada se aplica como variables CSS sobre la raíz del lienzo, así que la
 * hoja de estilo no conoce ningún color concreto.
 */
export interface Palette {
  /** Fondo del lienzo. Admite degradados. */
  paper: string
  /** Texto principal. */
  ink: string
  /** Texto secundario: descripciones, notas, versículo. */
  muted: string
  /** Color de marca de la plantilla: títulos de sección y precios. */
  accent: string
  /** Acento sobre fondos llenos (insignias, barra de contacto). */
  accentInk: string
  /** Reglas, filetes y bordes suaves — normalmente el acento con alfa. */
  rule: string
  /** Superficie elevada: tarjeta del especial y etiquetas de complementos. */
  card: string
  cardBorder: string
  /** Barra de WhatsApp. */
  contactBg: string
  contactInk: string
  /** Sombra de fotografías y tarjetas. */
  shadow: string
}

export const PALETTES: Record<TemplateId, Palette> = {
  // Papel crema, tinta cálida, rojo del logotipo. La de siempre.
  classic: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #fffdf8 0%, #fff5e6 45%, #fbe9d1 100%)',
    ink: '#241b11',
    muted: '#6d5c48',
    accent: '#be1a0d',
    accentInk: '#ffffff',
    rule: 'rgb(190 26 13 / 22%)',
    card: '#fffdf8',
    cardBorder: 'rgb(190 26 13 / 16%)',
    contactBg: '#be1a0d',
    contactInk: '#ffffff',
    shadow: 'rgb(90 52 20 / 22%)',
  },

  // Fondo oscuro y ámbar: la misma página, en negativo.
  modern: {
    paper:
      'radial-gradient(70% 45% at 85% 0%, rgb(224 138 30 / 30%) 0%, transparent 62%),' +
      'radial-gradient(60% 45% at 0% 100%, rgb(190 26 13 / 32%) 0%, transparent 60%),' +
      'linear-gradient(175deg, #191009 0%, #120c06 55%, #0d0805 100%)',
    ink: '#fff8ee',
    muted: '#c2ab8e',
    accent: '#f7c24b',
    accentInk: '#17110a',
    rule: 'rgb(247 194 75 / 28%)',
    card: 'rgb(255 248 238 / 7%)',
    cardBorder: 'rgb(247 194 75 / 26%)',
    contactBg: '#be1a0d',
    contactInk: '#ffffff',
    shadow: 'rgb(0 0 0 / 45%)',
  },

  // Naranja de marca saturado y texto blanco: máximo contraste para el feed.
  social: {
    paper:
      'radial-gradient(62% 46% at 82% 0%, rgb(250 199 92 / 92%) 0%, rgb(228 132 30 / 40%) 42%, transparent 74%),' +
      'radial-gradient(70% 55% at 0% 100%, rgb(120 14 4 / 78%) 0%, transparent 66%),' +
      'linear-gradient(158deg, #e08a1e 0%, #cc4a12 46%, #a51708 100%)',
    ink: '#ffffff',
    muted: 'rgb(255 240 224 / 82%)',
    accent: '#ffe1a8',
    accentInk: '#7a1105',
    rule: 'rgb(255 255 255 / 34%)',
    card: 'rgb(255 255 255 / 14%)',
    cardBorder: 'rgb(255 255 255 / 30%)',
    contactBg: '#17110a',
    contactInk: '#ffffff',
    shadow: 'rgb(80 22 4 / 34%)',
  },
}

/** Las variables CSS que consume `MenuLayout.module.css`. */
export function paletteVars(palette: Palette): Record<string, string> {
  return {
    '--paper': palette.paper,
    '--ink': palette.ink,
    '--muted': palette.muted,
    '--accent': palette.accent,
    '--accent-ink': palette.accentInk,
    '--rule': palette.rule,
    '--card': palette.card,
    '--card-border': palette.cardBorder,
    '--contact-bg': palette.contactBg,
    '--contact-ink': palette.contactInk,
    '--shadow': palette.shadow,
  }
}
