import { useEffect, useRef, useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import {
  dayOfMonth,
  dayOfYear,
  daysLeftInYear,
  formatMonth,
  formatWeekday,
  isSunday,
  todayIso,
  yearOf,
} from '@/lib/date'
import {
  ALM,
  ALM_FONT,
  LEAF_SHADOW,
  PAPER_GRAIN,
  PERFORATION,
  STACK_EDGE_SHADOW,
} from '@/almanac/tokens'
import { AlmanacButton, IconArrowRight, IconDuplicate, IconPlus } from '@/almanac/AlmanacUi'

/**
 * La hoja de hoy.
 *
 * Todavía está prendida del taco —por eso el perforado sigue entero arriba y se
 * ven los cantos de las hojas de abajo—. La fecha no lleva rótulo encima: en un
 * almanaque la cifra del día es el objeto más grande de la hoja y no necesita
 * que nada le anuncie qué es.
 *
 * Tampoco lleva frase explicativa. Quien abre esto lo abre todos los días; la
 * explicación vive en el estado vacío, que es donde hace falta una sola vez.
 */

/** Lo que tarda el perforado en romperse antes de cambiar de ruta. */
const TEAR_MS = 190

/**
 * Si a este plazo la hoja sigue montada es que la ruta no cambió —un guardado
 * que falló, casi siempre—. Sin esto la hoja se queda arrancada e invisible y
 * la acción principal deja de existir hasta recargar.
 */
const TEAR_RECOVER_MS = 900

interface TodayLeafProps {
  /** Set when a menu already exists for today. */
  continueLabel: string | undefined
  onPrimary: () => void
  onDuplicateLast: (() => void) | undefined
  busy: boolean
  /** Live thumbnail of the most recent menu, framed as the leaf's cut. */
  preview?: ReactNode
  /** "24 platillos · Clásica", en la columna marginal. */
  spec?: string
  /** El versículo, impreso al pie como lo imprime el almanaque. */
  foot?: ReactNode
}

export function TodayLeaf({
  continueLabel,
  onPrimary,
  onDuplicateLast,
  busy,
  preview,
  spec,
  foot,
}: TodayLeafProps) {
  const today = todayIso()
  const [tearing, setTearing] = useState(false)
  const timers = useRef<number[]>([])
  const sunday = isSunday(today)

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const id of pending) window.clearTimeout(id)
    }
  }, [])

  const tearOff = () => {
    if (busy || tearing) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onPrimary()
      return
    }
    setTearing(true)
    timers.current.push(
      window.setTimeout(() => {
        onPrimary()
        timers.current.push(window.setTimeout(() => setTearing(false), TEAR_RECOVER_MS))
      }, TEAR_MS),
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Los cantos de las hojas que quedan debajo. Tres bastan para que el
          taco tenga grosor; con más se convierte en una pila de tarjetas. */}
      {[10, 6, 3].map((inset, index) => (
        <Box
          key={inset}
          aria-hidden="true"
          sx={{
            position: 'absolute',
            insetInline: `${inset}px`,
            top: `-${(3 - index) * 3}px`,
            height: 10,
            bgcolor: ALM.paperShade,
            boxShadow: STACK_EDGE_SHADOW,
          }}
        />
      ))}

      <Box
        component="section"
        aria-label="Menú de hoy"
        sx={{
          position: 'relative',
          bgcolor: ALM.paper,
          color: ALM.ink,
          boxShadow: LEAF_SHADOW,
          transformOrigin: 'top center',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: PAPER_GRAIN,
            opacity: 0.035,
            pointerEvents: 'none',
          },
          ...(tearing && { animation: 'alm-tear 190ms cubic-bezier(0.3, 0, 0.1, 1) forwards' }),
          '@keyframes alm-tear': {
            '0%': { transform: 'none', opacity: 1 },
            '40%': { transform: 'translateY(3px) rotate(-0.4deg)' },
            '100%': { transform: 'translateY(-26px) rotate(-1.4deg)', opacity: 0 },
          },
        }}
      >
        {/* Perforado de arranque: agujeros, no guiones. */}
        <Box
          aria-hidden="true"
          sx={{ height: 12, background: PERFORATION, opacity: tearing ? 0.25 : 1 }}
        />

        <Box sx={{ px: { xs: 2.5, md: 4 }, pt: { xs: 1, md: 1.5 }, pb: { xs: 2.5, md: 3 } }}>
          {/* Tres columnas en escritorio —fecha, columna marginal, recuadro—
              porque es como se reparte una hoja de almanaque de verdad y es lo
              que impide que quede un vacío entre la cifra y la ilustración. En
              el teléfono la marginal baja bajo la cifra. */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: 'auto minmax(0, 1fr) auto' },
              columnGap: { xs: 1.5, sm: 2.5, md: 3.5 },
              rowGap: { xs: 1.5, md: 0 },
              alignItems: 'start',
            }}
          >
            {/*
              Maquetación en línea y no flex, a propósito.

              La cifra lleva `line-height: 0.76`, así que su caja es bastante
              más corta que el glifo y la base del número cae por debajo del
              fondo de la caja. Alineando por caja —`flex-end`— las palabras
              quedaban flotando un dedo por encima de la base del número, que
              es justo lo que se veía torcido. Con cajas en línea alineadas por
              `baseline`, el «13» y «AGOSTO» se apoyan en el mismo renglón sin
              que haya que adivinar el descendente de Anton con un `padding`.
              La pila de palabras es `inline-block`, cuya línea base es la de su
              última línea: por eso el renglón que se apoya es AGOSTO y no
              JUEVES.
            */}
            <Box
              component="h1"
              sx={{
                m: 0,
                gridArea: '1 / 1 / 2 / 2',
                // El recuadro ilustrado es más alto que la cifra, así que en
                // escritorio la fecha se centra contra él; anclada arriba
                // dejaba la hoja cargada de un lado.
                alignSelf: { md: 'center' },
                // El glifo desborda su caja por arriba; en el teléfono, donde
                // la cifra sí queda anclada arriba, este hueco evita que suba
                // a tocar el perforado.
                pt: { xs: '0.06em', md: 0 },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'baseline',
                  font: `400 clamp(4.5rem, 21vw, 15rem)/0.76 ${ALM_FONT.figure}`,
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'lining-nums',
                  color: sunday ? ALM.red : ALM.ink,
                }}
              >
                {dayOfMonth(today)}
              </Box>
              {/* El día de la semana al costado y en rojo, como manda la hoja:
                  encima de la cifra sería un rótulo colgado de un titular. */}
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  verticalAlign: 'baseline',
                  ml: { xs: 1, md: 1.75 },
                  font: `400 clamp(0.95rem, 2.4vw, 1.5rem)/1.15 ${ALM_FONT.figure}`,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                <Box component="span" sx={{ display: 'block', color: ALM.red }}>
                  {formatWeekday(today)}
                </Box>
                <Box component="span" sx={{ display: 'block' }}>
                  {formatMonth(today)}
                </Box>
              </Box>
            </Box>

            {/* La columna marginal corre de arriba abajo de la hoja, como en el
                taco: el filete la recorre entera y los datos se reparten entre
                sus extremos. Anclada solo al pie dejaba una banda de papel
                muerto sobre ella. */}
            <Box
              sx={{
                gridArea: { xs: '2 / 1 / 3 / 2', md: '1 / 2 / 2 / 3' },
                alignSelf: { md: 'stretch' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: { md: 'space-between' },
                gap: 0.75,
                pt: { md: 1 },
                pb: { md: 1 },
                borderLeft: { md: `1px solid ${ALM.rule}` },
                pl: { md: 3 },
                font: `500 0.74rem/1.35 ${ALM_FONT.data}`,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: ALM.inkMuted,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <Box
                component="span"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  font: `400 1.6rem/1 ${ALM_FONT.figure}`,
                  letterSpacing: '0.06em',
                  // `inkFaint` daba 2.89:1 sobre el papel, por debajo del
                  // mínimo. `inkMuted` da 5.3:1 y sigue siendo el extremo
                  // callado de la columna.
                  color: ALM.inkMuted,
                }}
              >
                {yearOf(today)}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {/* En el teléfono la ficha del menú va primero: dos líneas de
                    dato de almanaque no pueden ganarle sitio a lo accionable. */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', md: 'column' },
                    flexWrap: 'wrap',
                    columnGap: 1.25,
                    rowGap: 0.75,
                    order: { xs: 1, md: 0 },
                  }}
                >
                  <Box component="span">Día {dayOfYear(today)} del año</Box>
                  <Box component="span">Faltan {daysLeftInYear(today)}</Box>
                </Box>
                {spec ? (
                  <>
                    <Box
                      aria-hidden="true"
                      sx={{
                        display: { xs: 'none', md: 'block' },
                        width: 28,
                        height: '1px',
                        bgcolor: ALM.rule,
                      }}
                    />
                    <Box component="span" sx={{ order: { xs: 0, md: 0 }, color: ALM.ink }}>
                      {spec}
                    </Box>
                  </>
                ) : null}
              </Box>
            </Box>

            {preview ? (
              // El recuadro ilustrado de la hoja: filete de tinta, sin rotación
              // y sin sombra. Está impreso sobre el papel, no flotando encima.
              // El lienzo de dentro pierde su radio y su sombra para que la
              // ilustración llegue al filete, que aquí no admite curvas.
              <Box
                aria-hidden="true"
                sx={{
                  gridArea: { xs: '1 / 2 / 3 / 3', md: '1 / 3 / 2 / 4' },
                  width: { xs: 110, sm: 148, md: 172 },
                  flex: 'none',
                  border: `2px solid ${ALM.ink}`,
                  bgcolor: ALM.paperShade,
                  overflow: 'hidden',
                  '& > *': { borderRadius: 0, boxShadow: 'none' },
                }}
              >
                {preview}
              </Box>
            ) : null}
          </Box>

          <Box
            aria-hidden="true"
            sx={{ height: '2px', bgcolor: ALM.ink, mt: { xs: 2.5, md: 3 }, mb: 2 }}
          />

          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <AlmanacButton variant="stamp" onClick={tearOff} disabled={busy}>
              {continueLabel ? <IconArrowRight /> : <IconPlus />}
              {continueLabel ?? 'Armar el menú de hoy'}
            </AlmanacButton>

            {/* Duplicar es el camino corriente, no un atajo: se ofrece siempre
                y con el mismo peso, no solo los días sin menú. */}
            {onDuplicateLast ? (
              <AlmanacButton variant="stampGhost" onClick={onDuplicateLast} disabled={busy}>
                <IconDuplicate />
                Duplicar el último
              </AlmanacButton>
            ) : null}
          </Box>

          {foot}
        </Box>
      </Box>
    </Box>
  )
}
