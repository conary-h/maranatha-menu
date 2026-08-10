import { Component, type ErrorInfo, type ReactNode } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | undefined
}

/**
 * Last line of defence: a render crash should show a way out, not a blank page
 * on someone's phone in the middle of service.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: undefined }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Error no controlado:', error, info.componentStack)
  }

  override render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <Stack
        spacing={2}
        sx={{
          minHeight: '100dvh',
          p: 4,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" component="h1">
          Algo salió mal
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: '32ch' }}>
          Tus menús siguen guardados. Vuelve a cargar la aplicación para continuar.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            window.location.hash = '#/'
            window.location.reload()
          }}
        >
          Recargar
        </Button>
      </Stack>
    )
  }
}
