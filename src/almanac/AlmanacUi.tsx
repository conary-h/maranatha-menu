import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { ALM, ALM_FONT, PAPER_GRAIN } from './tokens'

/**
 * Los controles y los iconos de la hoja.
 *
 * Nada de esto sale de MUI: un botón con onda de Material dentro de un mundo de
 * papel es un injerto que se nota. Un botón de almanaque es una impresión —se
 * hunde un pelo al pulsar, como un sello contra la mesa— y sus iconos están
 * dibujados con el mismo trazo duro con que se imprime la hoja.
 */

/* ── Iconos ─────────────────────────────────────────────────────────────── */

interface IconProps {
  size?: number
}

/**
 * Un solo trazo para todo el juego: 1.75 px, remates a escuadra y uniones en
 * inglete. Sin una sola curva de conveniencia — el perfil duro es lo que los
 * hermana con la letra de la hoja.
 */
function Glyph({ size = 20, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <Glyph {...props}>
      {/* Rueda de ocho dientes rectos: una corona de lóbulos redondeados no
          pega con el resto del trazo, que no tiene una sola curva. */}
      <path d="M10.1 2.8h3.8l.5 2.4 2 1.2 2.2-1 1.9 3.3-1.7 1.7v2.3l1.7 1.7-1.9 3.3-2.2-1-2 1.2-.5 2.3h-3.8l-.5-2.3-2-1.2-2.2 1-1.9-3.3L5.2 12V9.7L3.5 8l1.9-3.3 2.2 1 2-1.2Z" />
      <path d="M9.4 12h5.2M12 9.4v5.2" />
    </Glyph>
  )
}

export function IconEdit(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 20v-3.5L15.5 5 19 8.5 7.5 20Z" />
      <path d="M13.5 7 17 10.5" />
    </Glyph>
  )
}

export function IconView(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.5 12 12 6l9.5 6-9.5 6Z" />
      <path d="M10 10.5h4v3h-4Z" />
    </Glyph>
  )
}

export function IconDuplicate(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M8 3.5h12v12" />
      <path d="M4 8h12v12.5H4Z" />
    </Glyph>
  )
}

export function IconDelete(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4 6.5h16M9.5 6.5V3.5h5v3" />
      <path d="M6.5 6.5 7.5 20.5h9l1-14" />
      <path d="M10.5 10v7M13.5 10v7" />
    </Glyph>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.5 12h16" />
      <path d="M13.5 6 19.5 12l-6 6" />
    </Glyph>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 4v16M4 12h16" />
    </Glyph>
  )
}

export function IconRefresh(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M20 5.5v5h-5" />
      <path d="M19.2 10.4A7.6 7.6 0 1 0 19 15" />
    </Glyph>
  )
}

/** Hoja con un signo de pregunta: no encontramos ese menú. */
export function IconMissingLeaf({ size = 40 }: IconProps) {
  return (
    <Glyph size={size}>
      <path d="M5 2.5h9l5 5v14H5Z" />
      <path d="M14 2.5v5h5" />
      <path d="M9.6 12.2a2.5 2.5 0 1 1 2.9 2.5v1.6" />
      <path d="M12.5 18.6v.8" />
    </Glyph>
  )
}

/** Rosa de los vientos: la ruta no existe. */
export function IconOffRoute({ size = 40 }: IconProps) {
  return (
    <Glyph size={size}>
      <path d="M12 1.8 14 10l8.2 2-8.2 2-2 8.2-2-8.2L1.8 12 10 10Z" />
      <path d="M12 8.5v7M8.5 12h7" />
    </Glyph>
  )
}

/** El plato de la hoja en blanco: dos cubiertos cruzados, mismo trazo. */
export function IconEmptyPlate({ size = 44 }: IconProps) {
  return (
    <Glyph size={size}>
      <path d="M4.5 3.5v6a2.5 2.5 0 0 0 5 0v-6M7 3.5v17" />
      <path d="M17.5 3.5c1.8 0 3 2 3 4.5s-1.2 4-3 4Zm0 8v9" />
    </Glyph>
  )
}

/* ── Controles ──────────────────────────────────────────────────────────── */

/**
 * `data-variant` en vez de props tipadas: el botón tiene tres impresiones
 * posibles y todas comparten la misma caja, así que la diferencia vive en CSS
 * y no en la firma del componente.
 */
const ButtonRoot = styled('button')({
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  minHeight: 44,
  padding: '0 20px',
  border: `2px solid ${ALM.ink}`,
  borderRadius: 0,
  background: 'transparent',
  color: ALM.ink,
  font: `600 0.82rem/1 ${ALM_FONT.data}`,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  // Sin transición de color: la tinta no se desvanece. Solo el hundimiento.
  transition: 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',

  '&:active:not(:disabled)': { transform: 'translateY(1.5px)' },
  '&:focus-visible': { outline: `2px solid ${ALM.red}`, outlineOffset: 3 },
  '&:disabled': { borderColor: ALM.inkFaint, color: ALM.inkFaint, cursor: 'not-allowed' },

  /**
   * La acción principal está estampada, no rellenada: cae un pelo torcida,
   * la tinta se desplaza medio milímetro del filete —el fuera de registro de
   * cualquier impresión barata a dos tintas— y el grano del papel se
   * transparenta por debajo, así que el rojo se asienta sobre la hoja en vez
   * de flotar encima.
   */
  '&[data-variant="stamp"], &[data-variant="stampGhost"]': {
    position: 'relative',
    minHeight: 52,
    fontSize: '0.92rem',
    transform: 'rotate(-0.7deg)',
  },
  '&[data-variant="stamp"]::after, &[data-variant="stampGhost"]::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundImage: PAPER_GRAIN,
    opacity: 0.16,
    mixBlendMode: 'multiply',
    pointerEvents: 'none',
  },
  '&[data-variant="stamp"]:active:not(:disabled), &[data-variant="stampGhost"]:active:not(:disabled)':
    { transform: 'rotate(-0.7deg) translateY(1.5px)' },

  '&[data-variant="stamp"]': {
    background: ALM.red,
    borderColor: ALM.red,
    color: ALM.paper,
    boxShadow: `1.5px 1.5px 0 rgb(190 26 13 / 32%)`,
  },
  '&[data-variant="stamp"]:hover:not(:disabled)': { background: '#a01409', borderColor: '#a01409' },
  '&[data-variant="stamp"]:disabled': {
    background: ALM.paperShade,
    borderColor: ALM.inkFaint,
    color: ALM.inkFaint,
    boxShadow: 'none',
  },
  '&[data-variant="stamp"]:focus-visible': { outlineColor: ALM.ink },

  /** El mismo sello, sin entintar: un secundario que sigue siendo un par. */
  '&[data-variant="stampGhost"]': { boxShadow: `1.5px 1.5px 0 rgb(27 26 21 / 20%)` },
  '&[data-variant="stampGhost"]:hover:not(:disabled)': { background: 'rgb(27 26 21 / 7%)' },
  '&[data-variant="stampGhost"]:disabled': { boxShadow: 'none' },

  '&[data-variant="outline"]:hover:not(:disabled)': { background: 'rgb(27 26 21 / 7%)' },

  '&[data-variant="quiet"]': {
    border: 0,
    padding: '0 10px',
    color: ALM.inkMuted,
    letterSpacing: '0.12em',
  },
  '&[data-variant="quiet"]:hover:not(:disabled)': { color: ALM.ink },

  '&[data-variant="icon"]': {
    border: 0,
    padding: 0,
    width: 44,
    height: 44,
    color: ALM.inkMuted,
  },
  '&[data-variant="icon"]:hover:not(:disabled)': { color: ALM.ink, background: 'rgb(27 26 21 / 7%)' },
})

type Variant = 'stamp' | 'stampGhost' | 'outline' | 'quiet' | 'icon'

interface AlmanacButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'ref'> {
  variant?: Variant
}

export function AlmanacButton({ variant = 'outline', type = 'button', ...rest }: AlmanacButtonProps) {
  return <ButtonRoot data-variant={variant} type={type} {...rest} />
}

/**
 * El fleje de hojalata, dibujado.
 *
 * Antes era una banda de degradado con dos puntos, que en captura se leía como
 * una barra de herramientas gris. Una lámina engarzada tiene perfil: el canto
 * de arriba está doblado sobre sí mismo y devuelve una línea de luz dura, el
 * cuerpo laminado lleva bandas horizontales desiguales, y abajo el filo corta
 * en sombra. El SVG se estira en horizontal —el laminado no tiene escala— y
 * los remaches van aparte, con su placa, para que no se deformen con él.
 */
export function TinSheet() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: ALM.tin,
        // Dos líneas y nada más: el canto doblado de arriba devuelve una línea
        // de luz, y abajo la lámina corta en sombra. Todo el relieve que una
        // hojalata necesita para leerse como hojalata.
        borderTop: `1px solid ${ALM.tinEdge}`,
        boxShadow: `inset 0 -1px 0 ${ALM.tinDark}`,
      }}
    />
  )
}

/** Los dos agujeros por los que pasa el clavo. Geometría plana, sin domo. */
export function TinRivet({ side }: { side: 'left' | 'right' }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        top: 25,
        [side]: 18,
        width: 10,
        height: 10,
        borderRadius: '50%',
        // Un agujero es un hueco oscuro con una ceja de luz en el canto de
        // abajo, donde la lámina se dobló al troquelarlo. En tono sobre tono
        // se leía como una mota de polvo.
        bgcolor: 'rgb(27 26 21 / 42%)',
        boxShadow: `inset 0 1px 1px rgb(27 26 21 / 45%), 0 1px 0 ${ALM.tinEdge}`,
      }}
    />
  )
}

/**
 * El sello de tinta.
 *
 * Va torcido y fuera de registro a propósito: un sello de goma nunca cae recto,
 * y el desplazamiento de un pelo entre el borde y el relleno es exactamente lo
 * que delata una impresión barata a dos tintas.
 */
export function InkStamp({ children, tilt = -2.5 }: { children: ReactNode; tilt?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        transform: `rotate(${tilt}deg)`,
        border: `2px solid ${ALM.red}`,
        color: ALM.red,
        padding: '3px 9px 2px',
        font: `400 0.78rem/1 ${ALM_FONT.figure}`,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        boxShadow: `0.5px 0.5px 0 rgb(190 26 13 / 30%)`,
      }}
    >
      {children}
    </span>
  )
}
