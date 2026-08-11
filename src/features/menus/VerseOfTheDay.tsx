import { useState } from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RefreshIcon from '@mui/icons-material/Refresh'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { todayIso } from '@/lib/date'
import { verseOfTheDay } from '@/lib/verses'

/**
 * Versículo del día.
 *
 * Es para quien usa la app, no para el menú: un momento de lectura antes de
 * ponerse a trabajar. Por eso no guarda nada ni toca los menús —el versículo
 * que se imprime se escribe en el editor, con las palabras de la familia—.
 *
 * «Otro versículo» avanza por la lista curada sin cambiar de fecha, para cuando
 * el del día no es el que se quiere leer hoy. El desplazamiento vive solo en la
 * tarjeta, así que mañana vuelve a abrir con el del día.
 */
export function VerseOfTheDay() {
  const [offset, setOffset] = useState(0)
  const verse = verseOfTheDay(todayIso(), offset)

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Versículo del día"
      sx={{
        position: 'relative',
        p: 3,
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #fffaf2 0%, #fff3e0 100%)',
      }}
    >
      {/* Comilla tipográfica de fondo: da profundidad sin añadir un elemento más. */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -6,
          right: 14,
          fontFamily: 'var(--font-display)',
          fontSize: 150,
          lineHeight: 1,
          color: 'rgb(190 26 13 / 7%)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        &rdquo;
      </Box>

      <Stack spacing={2} sx={{ position: 'relative' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'secondary.dark' }}>
          <AutoAwesomeIcon sx={{ fontSize: 18 }} />
          <Typography variant="subtitle2">Versículo del día</Typography>
        </Stack>

        <Typography
          component="blockquote"
          sx={{
            m: 0,
            fontSize: '1.05rem',
            fontStyle: 'italic',
            lineHeight: 1.55,
            color: 'text.primary',
            textWrap: 'pretty',
          }}
        >
          «{verse.text}»
        </Typography>

        <Typography
          component="cite"
          sx={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'normal',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            color: 'primary.main',
          }}
        >
          {verse.ref}
        </Typography>

        <Button
          size="small"
          color="inherit"
          startIcon={<RefreshIcon />}
          onClick={() => setOffset((current) => current + 1)}
          sx={{ alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          Otro versículo
        </Button>
      </Stack>
    </Paper>
  )
}
