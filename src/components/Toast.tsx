import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { createId } from '@/lib/id'

type ToastTone = 'info' | 'success' | 'error'

interface Toast {
  id: string
  message: string
  tone: ToastTone
}

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | undefined>(undefined)

/** Errors stay long enough to be read and acted on; confirmations do not. */
const DURATION_MS: Record<ToastTone, number> = { info: 2600, success: 2600, error: 6000 }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Toast[]>([])
  const current = queue[0]

  const dismiss = useCallback(() => setQueue((rest) => rest.slice(1)), [])

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    setQueue((rest) => [...rest, { id: createId('t'), message, tone }])
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        // `key` restarts the auto-hide timer when one toast replaces another.
        key={current?.id}
        open={current !== undefined}
        autoHideDuration={current ? DURATION_MS[current.tone] : undefined}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') dismiss()
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <Alert
          severity={current?.tone ?? 'info'}
          variant="filled"
          onClose={dismiss}
          sx={{ width: '100%', maxWidth: 420 }}
        >
          {current?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return context
}
