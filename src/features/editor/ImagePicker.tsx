import { useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react'
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternateOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useToast } from '@/components/Toast'
import { errorMessage } from '@/hooks/useAsync'
import { ACCEPT_ATTRIBUTE, processImageFile } from '@/lib/image'
import { saveImage, updateFocalPoint, type ResolvedImage } from '@/lib/imageStore'

interface DishPhotoButtonProps {
  dishName: string
  image: ResolvedImage | undefined
  onPicked: (imageId: string) => void
  onRemoved: () => void
}

/**
 * One control for the whole photo lifecycle: tap to add, tap again to replace,
 * re-frame or remove. Fewer buttons on a phone-sized row, and the destructive
 * option is never the one you hit by accident.
 */
export function DishPhotoButton({ dishName, image, onPicked, onRemoved }: DishPhotoButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const toast = useToast()

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const processed = await processImageFile(file)
      await saveImage(processed)
      onPicked(processed.id)
      setDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(errorMessage(error, 'No se pudo agregar la foto.'))
    } finally {
      setBusy(false)
    }
  }

  const label = image
    ? `Cambiar foto de ${dishName || 'este platillo'}`
    : `Agregar foto a ${dishName || 'este platillo'}`

  return (
    <>
      <ButtonBase
        onClick={() => (image ? setDialogOpen(true) : inputRef.current?.click())}
        aria-label={label}
        title={label}
        disabled={busy}
        sx={{
          position: 'relative',
          width: 44,
          height: 44,
          flex: 'none',
          borderRadius: 1.25,
          overflow: 'hidden',
          border: 1,
          borderStyle: image ? 'solid' : 'dashed',
          borderColor: 'divider',
          bgcolor: image ? 'transparent' : 'rgb(0 0 0 / 3%)',
          color: 'text.disabled',
          '&:hover': { borderColor: 'text.disabled' },
        }}
      >
        {image ? (
          <Box
            component="img"
            src={image.src}
            alt=""
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            style={{ objectPosition: `${image.focalX * 100}% ${image.focalY * 100}%` }}
          />
        ) : (
          <AddPhotoIcon fontSize="small" />
        )}
        {busy ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgb(255 255 255 / 78%)',
            }}
          >
            <CircularProgress size={18} aria-label="Procesando foto" />
          </Box>
        ) : null}
      </ButtonBase>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={(event) => void handleFile(event)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      {image ? (
        <PhotoDialog
          open={dialogOpen}
          image={image}
          busy={busy}
          onClose={() => setDialogOpen(false)}
          onReplace={() => inputRef.current?.click()}
          onRemove={() => {
            onRemoved()
            setDialogOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

interface PhotoDialogProps {
  open: boolean
  image: ResolvedImage
  busy: boolean
  onClose: () => void
  onReplace: () => void
  onRemove: () => void
}

function PhotoDialog({ open, image, busy, onClose, onReplace, onRemove }: PhotoDialogProps) {
  const [focal, setFocal] = useState({ x: image.focalX, y: image.focalY })
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const toast = useToast()

  const pick = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setFocal({
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    })
  }

  const save = async () => {
    try {
      await updateFocalPoint(image.id, focal.x, focal.y)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(errorMessage(error, 'No se pudo guardar el encuadre.'))
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Fotografía</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Toca la parte de la foto que quieres que siempre se vea.
          </Typography>

          <Box
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              pick(event)
            }}
            onPointerMove={(event) => {
              if (event.buttons > 0) pick(event)
            }}
            role="application"
            aria-label="Elegir el centro de la fotografía"
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: '#f4ede3',
              cursor: 'crosshair',
              touchAction: 'none',
            }}
          >
            <Box
              component="img"
              src={image.src}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              style={{ objectPosition: `${focal.x * 100}% ${focal.y * 100}%` }}
            />
            <Box
              sx={{
                position: 'absolute',
                width: 34,
                height: 34,
                mt: '-17px',
                ml: '-17px',
                border: '3px solid #fff',
                borderRadius: '50%',
                boxShadow: '0 0 0 2px rgb(0 0 0 / 35%)',
                pointerEvents: 'none',
              }}
              style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
            />
          </Box>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Button size="small" onClick={onReplace} disabled={busy} loading={busy}>
              Cambiar foto
            </Button>
            {confirmingRemove ? (
              <Button size="small" variant="contained" color="error" onClick={onRemove}>
                Sí, quitar foto
              </Button>
            ) : (
              <Button size="small" variant="text" color="inherit" onClick={() => setConfirmingRemove(true)}>
                Quitar foto
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => void save()} disabled={busy}>
          Guardar encuadre
        </Button>
      </DialogActions>
    </Dialog>
  )
}
