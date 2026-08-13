import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ALM } from '@/almanac/tokens'

export function PageSpinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress aria-label={label} size={28} thickness={5} />
    </Box>
  )
}

interface EmptyStateProps {
  /**
   * Un glifo dibujado, no un emoji: un emoji lo pinta el sistema operativo con
   * su propio color y su propio trazo, y no pertenece a ningún diseño.
   */
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack spacing={2} sx={{ py: 6, px: 2, alignItems: 'center', textAlign: 'center' }}>
      {icon ? <Box sx={{ color: ALM.inkFaint, lineHeight: 0 }}>{icon}</Box> : null}
      <Typography variant="h5" component="h2">
        {title}
      </Typography>
      {description ? (
        <Typography color="text.secondary" sx={{ maxWidth: '38ch' }}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Stack>
  )
}
