import type { ReactNode } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatLongDate, todayIso } from '@/lib/date'
import { LOGO_ALT, LOGO_SRC } from '@/templates/logo'

/**
 * Film grain. A flat CSS gradient reads as cheap at this size; a very light
 * noise layer is what makes a large colour field look like a printed surface.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

interface HomeHeroProps {
  /** Set when a menu already exists for today. */
  continueLabel: string | undefined
  onPrimary: () => void
  onDuplicateLast: (() => void) | undefined
  busy: boolean
  /** Live thumbnail of the most recent menu; fills the right half on desktop. */
  preview?: ReactNode
}

export function HomeHero({
  continueLabel,
  onPrimary,
  onDuplicateLast,
  busy,
  preview,
}: HomeHeroProps) {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 5, md: 7 },
        px: { xs: 3, md: 6 },
        py: { xs: 3.5, md: 5 },
        color: '#fff',
        isolation: 'isolate',
        // Layered lights over a deep base: the highlights are what give a flat
        // fill the depth a single linear-gradient never has.
        background:
          'radial-gradient(58% 90% at 78% 8%, rgb(250 196 84 / 88%) 0%, rgb(226 122 26 / 45%) 38%, transparent 72%),' +
          'radial-gradient(75% 95% at 4% 104%, rgb(104 10 3 / 88%) 0%, transparent 64%),' +
          'linear-gradient(148deg, #cf3d0e 0%, #ac1a0b 46%, #7a1105 100%)',
        boxShadow: '0 24px 60px rgb(120 40 10 / 26%), 0 4px 12px rgb(120 40 10 / 14%)',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: GRAIN,
          opacity: 0.13,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: preview ? { xs: '1fr', md: 'minmax(0, 1fr) auto' } : '1fr',
          gap: { xs: 3, md: 5 },
          alignItems: 'center',
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          {/* The wordmark's upper half is black; a light plate keeps it legible
              instead of relying on a glow that only half works. */}
          <Box
            sx={{
              px: { xs: 2, md: 2.5 },
              py: { xs: 1.25, md: 1.5 },
              borderRadius: 3,
              bgcolor: '#fff',
              boxShadow: '0 10px 26px rgb(80 26 6 / 26%)',
            }}
          >
            <Box
              component="img"
              src={LOGO_SRC}
              alt={LOGO_ALT}
              sx={{ width: { xs: 160, md: 190 }, height: 'auto' }}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: 'rgb(255 232 200 / 88%)', letterSpacing: '0.22em' }}
            >
              Menú del día
            </Typography>
            <Typography
              variant="h1"
              sx={{
                mt: 0.5,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.02,
                textShadow: '0 3px 18px rgb(90 20 4 / 35%)',
              }}
            >
              {formatLongDate(todayIso())}
            </Typography>
          </Box>

          <Typography sx={{ maxWidth: '42ch', color: 'rgb(255 240 225 / 92%)' }}>
            Arma el menú, elige un diseño y compártelo por WhatsApp en un par de minutos.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' }, pt: 0.5 }}
          >
            <Button
              size="large"
              variant="contained"
              color="inherit"
              loading={busy}
              startIcon={continueLabel ? <ArrowForwardIcon /> : <AddIcon />}
              onClick={onPrimary}
              sx={{
                bgcolor: '#fff',
                color: 'primary.dark',
                px: 3.5,
                boxShadow: '0 8px 22px rgb(60 12 2 / 30%)',
                '&:hover': { bgcolor: '#fff7ef' },
              }}
            >
              {continueLabel ?? 'Nuevo menú de hoy'}
            </Button>

            {onDuplicateLast ? (
              <Button
                size="large"
                variant="outlined"
                color="inherit"
                disabled={busy}
                startIcon={<ContentCopyIcon />}
                onClick={onDuplicateLast}
                sx={{
                  borderColor: 'rgb(255 255 255 / 45%)',
                  color: '#fff',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgb(255 255 255 / 10%)' },
                }}
              >
                Duplicar el último
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {preview ? (
          <Box
            aria-hidden="true"
            sx={{
              display: { xs: 'none', md: 'block' },
              width: 214,
              flex: 'none',
              transform: 'rotate(3deg)',
              filter: 'drop-shadow(0 26px 42px rgb(60 12 2 / 45%))',
            }}
          >
            {preview}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
