import type { TemplateId } from '@/types/menu'

/**
 * Todas las plantillas comparten forma y orden — la del diseño «Clásica» — y solo
 * cambian de color.
 *
 * Es una decisión deliberada: mantener una maquetación por diseño multiplicaba
 * el trabajo de cada ajuste (el recorte del ajuste automático, la regla de
 * descripciones, la de destacados) y con él la superficie donde algo se podía
 * romper. Una sola maquetación, muchas paletas. Cuando haga falta una forma
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

  // Verde bosque y oro: la más sobria de las oscuras.
  jade: {
    paper:
      'radial-gradient(70% 45% at 82% 0%, rgb(239 196 99 / 22%) 0%, transparent 62%),' +
      'radial-gradient(60% 45% at 0% 100%, rgb(31 122 77 / 34%) 0%, transparent 60%),' +
      'linear-gradient(172deg, #123529 0%, #0a2019 55%, #051411 100%)',
    ink: '#f0f7f1',
    muted: '#a8c3b4',
    accent: '#efc463',
    accentInk: '#0a2019',
    rule: 'rgb(239 196 99 / 26%)',
    card: 'rgb(240 247 241 / 7%)',
    cardBorder: 'rgb(239 196 99 / 26%)',
    contactBg: '#1f7a4d',
    contactInk: '#ffffff',
    shadow: 'rgb(0 0 0 / 45%)',
  },

  // Azul noche y celeste: fría, tranquila, muy legible sobre fondo oscuro.
  marina: {
    paper:
      'radial-gradient(70% 45% at 82% 0%, rgb(108 198 236 / 24%) 0%, transparent 62%),' +
      'radial-gradient(60% 45% at 0% 100%, rgb(27 110 168 / 38%) 0%, transparent 60%),' +
      'linear-gradient(172deg, #12314f 0%, #0a1e33 55%, #061421 100%)',
    ink: '#eaf3fb',
    muted: '#9fbad3',
    accent: '#6cc6ec',
    accentInk: '#062033',
    rule: 'rgb(108 198 236 / 28%)',
    card: 'rgb(234 243 251 / 8%)',
    cardBorder: 'rgb(108 198 236 / 28%)',
    contactBg: '#1b6ea8',
    contactInk: '#ffffff',
    shadow: 'rgb(2 12 22 / 50%)',
  },

  // Verde muy claro: la contraparte luminosa de «Jade», fresca para el día.
  menta: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f1fbf5 45%, #dcf0e5 100%)',
    ink: '#12291f',
    muted: '#54755f',
    accent: '#0e7a52',
    accentInk: '#ffffff',
    rule: 'rgb(14 122 82 / 22%)',
    card: '#ffffff',
    cardBorder: 'rgb(14 122 82 / 16%)',
    contactBg: '#0e7a52',
    contactInk: '#ffffff',
    shadow: 'rgb(20 70 50 / 18%)',
  },

  // Lila muy claro y violeta profundo: la más serena de las claras.
  lavanda: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f4f0ff 45%, #e3dbfa 100%)',
    ink: '#221a33',
    muted: '#6a5e85',
    accent: '#6b3fa0',
    accentInk: '#ffffff',
    rule: 'rgb(107 63 160 / 22%)',
    card: '#ffffff',
    cardBorder: 'rgb(107 63 160 / 16%)',
    contactBg: '#6b3fa0',
    contactInk: '#ffffff',
    shadow: 'rgb(52 30 90 / 18%)',
  },

  // Rosa pálido y frambuesa: clara y alegre, buena para postres y días de fiesta.
  frambuesa: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #fffdfd 0%, #fff0f3 45%, #ffdde4 100%)',
    ink: '#31151f',
    muted: '#7d5763',
    accent: '#c8305e',
    accentInk: '#ffffff',
    rule: 'rgb(200 48 94 / 22%)',
    card: '#fffdfd',
    cardBorder: 'rgb(200 48 94 / 16%)',
    contactBg: '#c8305e',
    contactInk: '#ffffff',
    shadow: 'rgb(110 25 50 / 18%)',
  },

  // Chocolate y caramelo: oscura pero cálida, del color de la comida.
  cacao: {
    paper:
      'radial-gradient(70% 45% at 82% 0%, rgb(233 184 114 / 26%) 0%, transparent 62%),' +
      'radial-gradient(60% 45% at 0% 100%, rgb(140 79 34 / 42%) 0%, transparent 60%),' +
      'linear-gradient(172deg, #33200f 0%, #22140a 55%, #170d06 100%)',
    ink: '#fdf3e6',
    muted: '#c9ab8b',
    accent: '#e9b872',
    accentInk: '#22140a',
    rule: 'rgb(233 184 114 / 28%)',
    card: 'rgb(253 243 230 / 7%)',
    cardBorder: 'rgb(233 184 114 / 26%)',
    contactBg: '#8c4f22',
    contactInk: '#ffffff',
    shadow: 'rgb(0 0 0 / 45%)',
  },

  // Barro y arcilla quemada, como una cantina mexicana: paredes encaladas en
  // tono tierra y la loza de siempre. Cálida sin caer en el rojo del logotipo.
  terracota: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #fffaf6 0%, #fbeade 45%, #f2d6c2 100%)',
    ink: '#3a2016',
    muted: '#7c5744',
    accent: '#9c3d22',
    accentInk: '#ffffff',
    rule: 'rgb(156 61 34 / 22%)',
    card: '#fffaf6',
    cardBorder: 'rgb(156 61 34 / 16%)',
    contactBg: '#9c3d22',
    contactInk: '#ffffff',
    shadow: 'rgb(95 45 25 / 20%)',
  },

  // Cal blanca y azul del Egeo, el par de la taberna griega. La más luminosa de
  // todas: casi todo el lienzo es papel y el color llega solo en los títulos.
  egeo: {
    paper: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f2f8fc 45%, #dbeaf6 100%)',
    ink: '#10283a',
    muted: '#4d6a80',
    accent: '#1668ac',
    accentInk: '#ffffff',
    rule: 'rgb(22 104 172 / 22%)',
    card: '#ffffff',
    cardBorder: 'rgb(22 104 172 / 16%)',
    contactBg: '#1668ac',
    contactInk: '#ffffff',
    shadow: 'rgb(16 50 80 / 18%)',
  },

  // Granate y latón: el cuero y los herrajes de una parrilla o una vinoteca de
  // toda la vida. Oscura y formal, la que mejor le sienta a un menú de carnes.
  borgona: {
    paper:
      'radial-gradient(70% 45% at 82% 0%, rgb(240 201 135 / 22%) 0%, transparent 62%),' +
      'radial-gradient(60% 45% at 0% 100%, rgb(140 24 60 / 40%) 0%, transparent 60%),' +
      'linear-gradient(172deg, #47142a 0%, #2c0c1a 55%, #1c0711 100%)',
    ink: '#fbeef2',
    muted: '#d3a9b6',
    accent: '#f0c987',
    accentInk: '#2c0c1a',
    rule: 'rgb(240 201 135 / 28%)',
    card: 'rgb(251 238 242 / 8%)',
    cardBorder: 'rgb(240 201 135 / 26%)',
    contactBg: '#8c183c',
    contactInk: '#ffffff',
    shadow: 'rgb(0 0 0 / 45%)',
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
