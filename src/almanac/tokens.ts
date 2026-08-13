/**
 * El mundo del almanaque de taco.
 *
 * Un almanaque de taco son tres materiales y nada más: un cartón de respaldo
 * impreso a todo color, un fleje de hojalata engarzado arriba, y un taco de
 * hojas de papel periódico impresas a dos tintas. Todo lo que se ve en la
 * pantalla de inicio es uno de esos tres.
 *
 * Las cifras van en `--alm-font-figure` porque en una hoja de almanaque el día
 * del mes es el objeto más grande de la página, y ninguna tipografía de texto
 * aguanta ese tamaño sin volverse un cartel de otra cosa.
 *
 * Estos tokens no salen de `tokens.css` a propósito: el mundo se detiene en el
 * borde de esta pantalla, y las plantillas del menú impreso —que sí leen
 * `--font-display` y compañía— no deben heredar nada de aquí.
 */

export const ALM = {
  /**
   * Cartón de respaldo.
   *
   * Fue verde y el verde era ajeno: la marca es roja. Ahora sale de la propia
   * familia del logotipo, pero muy hundido y desaturado —un rojo de óxido, no
   * el bermellón—, por dos razones. Como fondo tiene que recular en vez de
   * competir con el papel que sostiene, y tiene que quedar lo bastante lejos de
   * la tinta roja de la hoja para que esa tinta siga siendo un acento y no se
   * pierda contra su propio fondo.
   *
   * Además es lo que de verdad lleva un almanaque de taco regalado por un
   * comercio: el cartón se imprime del color de quien lo regala.
   */
  card: '#3b1009',
  cardDeep: '#280a06',
  /**
   * Fleje de hojalata.
   *
   * Plano. Un degradado de ocho paradas con bandas de laminado y remaches con
   * domo son tres señales de relieve apiladas, y juntas no leen «hojalata
   * barata» sino «cromado de 2008». La lámina se reconoce por su tono y su
   * canto, no por el brillo.
   */
  tin: '#c9c6bb',
  tinEdge: '#e2dfd5',
  tinDark: '#a5a298',
  /** Papel periódico: gris crudo, nunca crema. */
  paper: '#e6e5dc',
  paperShade: '#dcdacd',
  /** Las dos tintas. Nada más entra en la hoja. */
  ink: '#1b1a15',
  red: '#be1a0d',
  /** Secundario teñido del propio papel, nunca gris neutro. */
  inkMuted: '#615d50',
  inkFaint: '#8b8778',
  rule: '#c2bfae',
  /** Un punto más negra que la tinta, solo para el estado pulsado. */
  inkDeep: '#0d0c09',
  /** Filete finísimo sobre color: el canto de una muestra de tinta. */
  keyline: 'rgb(27 26 21 / 30%)',

  /**
   * Las tintas de aviso. Un almanaque comercial imprime a dos tintas, pero una
   * aplicación tiene que poder decir «esto falló» y «esto se guardó» sin que el
   * usuario lo confunda con el rojo de los domingos: por eso el rojo de error
   * es más apagado que el de la hoja, y el verde y el ocre salen de la misma
   * familia terrosa del papel.
   */
  danger: '#a81f10',
  caution: '#8a5a06',
  ok: '#1c6b45',
} as const

/**
 * La escala tipográfica, en seis pasos.
 *
 * Sin ella iban apareciendo tamaños casi iguales —0.72 y 0.74, 0.86, 0.92 y
 * 0.95— que no distinguen nada y solo ensucian el sistema.
 */
export const ALM_SIZE = {
  xs: '0.68rem',
  sm: '0.74rem',
  md: '0.82rem',
  lg: '0.95rem',
  xl: '1.05rem',
  xxl: '1.2rem',
} as const

export const ALM_FONT = {
  /** Anton: la cifra del día, y solo eso más los rótulos de sección. */
  figure: "'Anton', 'Archivo Variable', system-ui, sans-serif",
  /** Archivo: el texto corrido de la hoja. */
  text: "'Archivo Variable', system-ui, -apple-system, sans-serif",
  /** Archivo Narrow: la columna marginal, donde el almanaque aprieta los datos. */
  data: "'Archivo Narrow', 'Archivo Variable', system-ui, sans-serif",
} as const

/**
 * Grano del papel periódico.
 *
 * Al 3.5 % apenas se percibe, que es el punto: por encima de eso deja de ser
 * papel y se convierte en ruido sobre un color plano.
 */
export const PAPER_GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E\")"

/**
 * Las sombras del mundo, en un sitio y no repartidas por los componentes.
 *
 * Todas son la sombra proyectada de una hoja sobre el cartón, teñida del color
 * del propio cartón —nunca un gris neutro ni un halo—. Viven aquí porque al
 * cambiar el color del respaldo hay que cambiarlas con él, y esparcidas por
 * cuatro archivos es exactamente donde se quedan atrás.
 */
export const LEAF_SHADOW = '0 18px 34px rgb(26 6 3 / 36%), 0 2px 4px rgb(26 6 3 / 24%)'
export const SHEET_SHADOW = '0 6px 14px rgb(26 6 3 / 28%)'
export const STACK_EDGE_SHADOW = '0 -1px 0 rgb(62 18 11 / 40%)'

/**
 * La luz que le cae al cartón desde el clavo del que cuelga. Es un material,
 * no un color de la paleta: el color del respaldo no cambia, solo lo que le da.
 */
export const BOARD_SHEEN =
  'radial-gradient(120% 70% at 50% -10%, rgb(255 255 255 / 7%) 0%, transparent 60%)'

/** Perforado de arranque: agujeros redondos, no una línea de guiones. */
export const PERFORATION = `radial-gradient(circle at center, ${ALM.card} 0 1.6px, transparent 1.7px) repeat-x left center / 9px 4px`

/**
 * Canto arrancado.
 *
 * Una máscara con un perfil irregular de 96 px que se repite. La amplitud se
 * queda en 4 px y varios tramos son planos a propósito: con dientes altos y
 * regulares el canto deja de leerse como papel roto y se convierte en el borde
 * dentado de unas tijeras de modista.
 */
const TORN_PATH =
  'M0 5 L6 5 L9 3 L14 4 L18 2 L23 4 L28 4 L31 6 L36 3 L40 5 L46 5 L49 2 L54 4 L59 3 L63 5 L68 5 L72 3 L77 4 L82 2 L86 4 L91 4 L96 3 L96 10 L0 10 Z'

export const TORN_EDGE_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='10' viewBox='0 0 96 10'%3E%3Cpath d='${TORN_PATH.replace(/ /g, '%20')}' fill='%23000'/%3E%3C/svg%3E")`
