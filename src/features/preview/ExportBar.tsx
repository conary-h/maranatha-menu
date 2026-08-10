import { useState, type RefObject } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ShareIcon from '@mui/icons-material/IosShare'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useToast } from '@/components/Toast'
import { errorMessage } from '@/hooks/useAsync'
import { exportMenu, type ExportKind } from '@/lib/export'
import { downloadBlob, shareOrDownload, whatsappShareUrl } from '@/lib/share'
import { formatLongDate } from '@/lib/date'
import { FORMATS } from '@/templates'
import type { BusinessInfo, Menu } from '@/types/menu'

interface ExportBarProps {
  menu: Menu
  business: BusinessInfo
  captureRef: RefObject<HTMLDivElement | null>
  /** Blocks export until every photo has been decoded into the canvas. */
  ready: boolean
}

const BUSY_LABEL: Record<ExportKind, string> = {
  png: 'Generando la imagen…',
  jpg: 'Generando la imagen…',
  pdf: 'Generando el PDF…',
}

export function ExportBar({ menu, business, captureRef, ready }: ExportBarProps) {
  const [busy, setBusy] = useState<ExportKind | undefined>(undefined)
  const [status, setStatus] = useState<{ text: string; error: boolean } | undefined>(undefined)
  const toast = useToast()

  const run = async (kind: ExportKind, mode: 'share' | 'download') => {
    const node = captureRef.current
    if (!node) return
    setBusy(kind)
    setStatus({ text: BUSY_LABEL[kind], error: false })
    try {
      const format = FORMATS[menu.formatId]
      const result = await exportMenu(node, kind, menu.date, {
        width: format.width,
        height: format.height,
      })
      if (mode === 'share') {
        const outcome = await shareOrDownload(result, `${business.name} — ${formatLongDate(menu.date)}`)
        setStatus({
          text:
            outcome === 'shared'
              ? 'Listo, menú compartido.'
              : outcome === 'downloaded'
                ? 'Listo, se descargó a tu dispositivo.'
                : 'Se canceló al compartir.',
          error: false,
        })
      } else {
        downloadBlob(result.blob, result.filename)
        setStatus({ text: `Listo: ${result.filename}`, error: false })
      }
    } catch (error) {
      console.error(error)
      const message = errorMessage(error, 'No se pudo exportar el menú.')
      setStatus({ text: message, error: true })
      toast.error(message)
    } finally {
      setBusy(undefined)
    }
  }

  const caption = `${business.name}\n${formatLongDate(menu.date)}\n${business.phone}`
  const disabled = !ready || busy !== undefined

  return (
    <Paper
      square
      elevation={0}
      sx={{
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        zIndex: 30,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'rgb(250 246 240 / 94%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack
        spacing={1}
        sx={{
          width: '100%',
          maxWidth: 560,
          mx: 'auto',
          px: 2,
          py: 1.5,
          pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={<ShareIcon />}
          fullWidth
          disabled={disabled}
          loading={busy === 'png'}
          onClick={() => void run('png', 'share')}
        >
          Compartir menú
        </Button>

        <Stack direction="row" spacing={1} sx={{ '& > *': { flex: '1 1 0', minWidth: 0 } }}>
          <Button
            startIcon={<DownloadIcon />}
            disabled={disabled}
            loading={busy === 'jpg'}
            onClick={() => void run('jpg', 'download')}
          >
            JPG
          </Button>
          <Button
            startIcon={<PictureAsPdfIcon />}
            disabled={disabled}
            loading={busy === 'pdf'}
            onClick={() => void run('pdf', 'download')}
          >
            PDF
          </Button>
          <Button
            startIcon={<WhatsAppIcon />}
            onClick={() => window.open(whatsappShareUrl(caption), '_blank', 'noopener')}
            title="Abre WhatsApp con el texto listo; adjunta la imagen descargada"
          >
            WhatsApp
          </Button>
        </Stack>

        <Typography
          variant="caption"
          role="status"
          aria-live="polite"
          sx={{
            minHeight: '1.1rem',
            fontWeight: 600,
            textAlign: 'center',
            color: status?.error ? 'error.main' : 'text.secondary',
          }}
        >
          {status?.text ?? (ready ? '' : 'Preparando las fotografías…')}
        </Typography>
      </Stack>
    </Paper>
  )
}
