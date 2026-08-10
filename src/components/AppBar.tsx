import type { ReactNode } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MuiAppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

interface TopBarProps {
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: ReactNode
}

/**
 * Sticky screen header. Translucent rather than solid so the menu preview
 * scrolling underneath still reads as one surface.
 */
export function TopBar({ title, subtitle, onBack, actions }: TopBarProps) {
  return (
    <MuiAppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backgroundColor: 'rgb(250 246 240 / 88%)',
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar disableGutters sx={{ gap: 1, px: 1.5, minHeight: 56 }}>
        {onBack ? (
          <IconButton onClick={onBack} aria-label="Volver" edge="start">
            <ChevronLeftIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 4 }} />
        )}

        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Typography variant="h6" noWrap component="h1">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 'none' }}>{actions}</Box>
      </Toolbar>
    </MuiAppBar>
  )
}
