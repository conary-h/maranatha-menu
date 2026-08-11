import { useRef, useState, type ChangeEvent } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import RestoreIcon from '@mui/icons-material/SettingsBackupRestore'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TopBar } from '@/components/AppBar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { useAsyncAction } from '@/hooks/useAsync'
import { paths, useNavigate } from '@/hooks/useRoute'
import { downloadBackup, restoreBackup } from '@/lib/backup'
import { resetImageCache } from '@/lib/imageStore'
import { LIMITS, isBusinessInfo } from '@/lib/validation'
import type { BusinessInfo } from '@/types/menu'
import { useBusiness } from './BusinessContext'

export function BusinessSettingsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { business, save } = useBusiness()
  const [draft, setDraft] = useState<BusinessInfo>(business)
  const [pendingRestore, setPendingRestore] = useState<File | undefined>(undefined)
  const restoreInputRef = useRef<HTMLInputElement>(null)

  const saving = useAsyncAction(async (info: BusinessInfo) => {
    if (!isBusinessInfo(info)) throw new Error('Revisa los datos: algún campo es demasiado largo.')
    await save(info)
    toast.success('Datos del negocio guardados.')
  })

  const backup = useAsyncAction(async () => {
    await downloadBackup()
    toast.success('Respaldo descargado.')
  })

  const restoring = useAsyncAction(async (file: File) => {
    const { menus } = await restoreBackup(file)
    resetImageCache()
    toast.success(`Se restauraron ${menus} menú(s).`)
    navigate(paths.list())
  })

  const pickRestore = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) setPendingRestore(file)
  }

  const field = <K extends keyof BusinessInfo>(key: K, maxLength: number) => ({
    value: draft[key],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((current) => ({ ...current, [key]: event.target.value })),
    slotProps: { htmlInput: { maxLength } },
  })

  return (
    <>
      <TopBar title="Datos del negocio" onBack={() => navigate(paths.list())} />

      <Stack
        spacing={2}
        sx={{
          width: '100%',
          maxWidth: 620,
          mx: 'auto',
          p: 2,
          pb: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Paper
          variant="outlined"
          component="form"
          sx={{ p: 2 }}
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault()
            void saving.run(draft)
          }}
        >
          <Stack spacing={2}>
            <Typography variant="h5" component="h2">
              Información que aparece en cada menú
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 2fr) minmax(0, 1fr)' },
                gap: 2,
              }}
            >
              <TextField label="Nombre del negocio" required {...field('name', 80)} />
              <TextField label="Moneda" required {...field('currency', 8)} />
            </Box>

            <TextField label="WhatsApp" type="tel" placeholder="+504 0000-0000" {...field('phone', 32)} />

            <TextField
              label="Nota al pie"
              helperText="Ej. condiciones de los almuerzos o el horario."
              {...field('footerNote', 200)}
            />

            <TextField label="Referencia bíblica" {...field('verseRef', LIMITS.verseRef)} />
            <TextField
              label="Versículo de respaldo"
              multiline
              minRows={3}
              helperText="Cada menú lleva el suyo, escrito en el editor. Este solo se usa en los menús que nunca lo han tocado."
              {...field('verseText', LIMITS.verseText)}
            />

            {saving.error ? <Alert severity="error">{saving.error}</Alert> : null}

            <Button type="submit" variant="contained" size="large" fullWidth loading={saving.isPending}>
              Guardar cambios
            </Button>
          </Stack>
        </Paper>

        <Paper variant="outlined" component="section" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h2">
              Copia de seguridad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los menús se guardan en este teléfono o computadora. Descarga un respaldo de vez en
              cuando para no perderlos si borras los datos del navegador o cambias de dispositivo.
            </Typography>

            {backup.error ? <Alert severity="error">{backup.error}</Alert> : null}
            {restoring.error ? <Alert severity="error">{restoring.error}</Alert> : null}

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', '& > *': { flex: '1 1 180px' } }}>
              <Button
                startIcon={<DownloadIcon />}
                loading={backup.isPending}
                onClick={() => void backup.run()}
              >
                Descargar respaldo
              </Button>
              <Button
                startIcon={<RestoreIcon />}
                loading={restoring.isPending}
                onClick={() => restoreInputRef.current?.click()}
              >
                Restaurar respaldo
              </Button>
            </Stack>

            <input
              ref={restoreInputRef}
              type="file"
              accept="application/json,.json"
              onChange={pickRestore}
              tabIndex={-1}
              aria-hidden="true"
              style={{ display: 'none' }}
            />
          </Stack>
        </Paper>
      </Stack>

      <ConfirmDialog
        open={pendingRestore !== undefined}
        title="¿Restaurar el respaldo?"
        message="Los menús del respaldo se agregarán a este dispositivo y reemplazarán a los que tengan el mismo identificador."
        confirmLabel="Restaurar"
        loading={restoring.isPending}
        onConfirm={() => {
          const file = pendingRestore
          setPendingRestore(undefined)
          if (file) void restoring.run(file)
        }}
        onCancel={() => setPendingRestore(undefined)}
      />
    </>
  )
}
