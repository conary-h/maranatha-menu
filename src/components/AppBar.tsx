import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ALM, ALM_FONT } from '@/almanac/tokens'
import { TinRivet, TinSheet } from '@/almanac/AlmanacUi'

/**
 * El canto superior de la aplicación: el mismo fleje de hojalata del taco.
 *
 * En el inicio el fleje sujeta las hojas del almanaque; aquí dentro es la
 * misma lámina, con el título troquelado en lugar del logotipo. Así el editor
 * y la vista previa no se sienten como otra aplicación al llegar desde la
 * portada — que es exactamente lo que pasaba con una barra crema translúcida.
 */

/** Alto del fleje. Lo comparten los rótulos pegajosos que se anclan bajo él. */
export const HANGER_H = 60

/** El galón de volver, con el mismo trazo duro que el resto del juego. */
function IconBack() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 12H4.5" />
      <path d="M10.5 6 4.5 12l6 6" />
    </svg>
  )
}

interface TopBarProps {
  /** Siempre presente como encabezado accesible, se vea o no. */
  title: string
  subtitle?: string
  /** En el inicio, el logotipo troquelado ocupa el sitio del título. */
  brand?: ReactNode
  onBack?: () => void
  actions?: ReactNode
}

export function TopBar({ title, subtitle, brand, onBack, actions }: TopBarProps) {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        // Deja libres las esquinas donde van los remaches.
        px: { xs: 4.5, md: 5.5 },
        height: HANGER_H,
        bgcolor: ALM.tin,
        // Un filete y una sombra corta. La banda pesada de antes hacía que la
        // lámina flotara sobre la página como una barra de herramientas.
        borderBottom: `1px solid ${ALM.tinDark}`,
        boxShadow: '0 2px 6px rgb(18 28 23 / 18%)',
      }}
    >
      <TinSheet />
      <TinRivet side="left" />
      <TinRivet side="right" />

      {onBack ? (
        <IconButton
          onClick={onBack}
          aria-label="Volver"
          sx={{ position: 'relative', flex: 'none', ml: -1.5, color: ALM.ink }}
        >
          <IconBack />
        </IconButton>
      ) : null}

      <Box sx={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }}>
        <Typography
          variant="h6"
          noWrap
          component="h1"
          sx={
            brand
              ? // El logotipo dice la marca a la vista; el título sigue ahí
                // para quien navega con lector de pantalla.
                { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }
              : { color: ALM.ink }
          }
        >
          {title}
        </Typography>
        {brand}
        {subtitle ? (
          <Typography
            noWrap
            sx={{
              font: `500 0.72rem/1.2 ${ALM_FONT.data}`,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: ALM.inkMuted,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flex: 'none',
          color: ALM.ink,
        }}
      >
        {actions}
      </Box>
    </Box>
  )
}
