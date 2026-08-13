import { useState } from 'react'
import Box from '@mui/material/Box'
import { todayIso } from '@/lib/date'
import { verseOfTheDay } from '@/lib/verses'
import { ALM, ALM_FONT } from '@/almanac/tokens'
import { AlmanacButton, IconRefresh } from '@/almanac/AlmanacUi'

/**
 * Versículo del día, al pie de la hoja.
 *
 * Antes vivía en una tarjeta propia en una segunda columna, que es donde la
 * pone una aplicación. Un almanaque de taco lo imprime en la banda de abajo,
 * junto al santoral y la fase de la luna, en el mismo cuerpo pequeño que el
 * resto de la letra marginal. Ahí vuelve.
 *
 * Sigue sin guardar nada ni tocar los menús: el versículo que se imprime en el
 * menú se escribe en el editor, con las palabras de la familia. «Otro
 * versículo» avanza por la lista curada sin cambiar de fecha, y el
 * desplazamiento vive solo aquí, así que mañana vuelve a abrir con el del día.
 */
export function VerseOfTheDay() {
  const [offset, setOffset] = useState(0)
  const verse = verseOfTheDay(todayIso(), offset)

  return (
    <Box
      component="section"
      aria-label="Versículo del día"
      sx={{
        mt: { xs: 2.5, md: 3 },
        pt: 1.75,
        borderTop: `1px solid ${ALM.rule}`,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
        alignItems: 'end',
        columnGap: 2,
        rowGap: 1,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box
          component="blockquote"
          sx={{
            m: 0,
            font: `400 0.95rem/1.5 ${ALM_FONT.text}`,
            fontStyle: 'italic',
            color: ALM.inkMuted,
            textWrap: 'pretty',
            maxWidth: '68ch',
          }}
        >
          «{verse.text}»
        </Box>
        <Box
          component="cite"
          sx={{
            display: 'block',
            mt: 0.75,
            font: `400 0.72rem/1 ${ALM_FONT.figure}`,
            fontStyle: 'normal',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: ALM.red,
          }}
        >
          {verse.ref}
        </Box>
      </Box>

      {/* `justifySelf` explícito: en una sola columna la celda estira el botón
          a todo el ancho y el rótulo se va al centro, que es donde no va. */}
      <AlmanacButton
        variant="quiet"
        onClick={() => setOffset((current) => current + 1)}
        aria-label="Mostrar otro versículo"
        style={{ justifySelf: 'start', marginInlineStart: -10 }}
      >
        <IconRefresh size={16} />
        Otro
      </AlmanacButton>
    </Box>
  )
}
