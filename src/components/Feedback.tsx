import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function PageSpinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress aria-label={label} />
    </Box>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Stack spacing={2} sx={{ py: 6, px: 2, alignItems: 'center', textAlign: 'center' }}>
      {icon ? (
        <Box component="span" sx={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">
          {icon}
        </Box>
      ) : null}
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
