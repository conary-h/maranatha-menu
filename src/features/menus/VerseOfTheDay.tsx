import CheckIcon from '@mui/icons-material/Check'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useToast } from '@/components/Toast'
import { useAsyncAction } from '@/hooks/useAsync'
import { todayIso } from '@/lib/date'
import { verseOfTheDay } from '@/lib/verses'
import { useBusiness } from '@/features/business/BusinessContext'

/**
 * Versículo del día.
 *
 * No es decoración: el menú impreso ya lleva un versículo al pie, así que la
 * tarjeta ofrece ponerlo ahí de un toque. Sin ese botón sería un adorno; con
 * él, es la forma más rápida de cambiar el versículo del menú.
 */
export function VerseOfTheDay() {
  const { business, save } = useBusiness()
  const toast = useToast()
  const verse = verseOfTheDay(todayIso())
  const inUse = business.verseRef === verse.ref && business.verseText === verse.text

  const apply = useAsyncAction(async () => {
    await save({ ...business, verseRef: verse.ref, verseText: verse.text })
    toast.success('Listo, aparecerá al pie de tus menús.')
  })

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
          startIcon={inUse ? <CheckIcon /> : undefined}
          disabled={inUse}
          loading={apply.isPending}
          onClick={() => void apply.run()}
          sx={{ alignSelf: 'flex-start' }}
        >
          {inUse ? 'Ya está en tus menús' : 'Usar en mis menús'}
        </Button>
      </Stack>
    </Paper>
  )
}
