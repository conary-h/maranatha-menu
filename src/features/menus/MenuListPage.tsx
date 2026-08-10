import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditIcon from '@mui/icons-material/EditOutlined'
import SettingsIcon from '@mui/icons-material/Settings'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { TopBar } from '@/components/AppBar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState, PageSpinner } from '@/components/Feedback'
import { useToast } from '@/components/Toast'
import { errorMessage, useAsyncData } from '@/hooks/useAsync'
import { paths, useNavigate } from '@/hooks/useRoute'
import { indexedDbRepository } from '@/lib/db'
import { formatLongDate, relativeDayLabel, todayIso } from '@/lib/date'
import { createMenu, createStarterMenu, duplicateMenu } from '@/lib/defaults'
import { LOGO_ALT, LOGO_SRC } from '@/templates/logo'
import { TEMPLATES } from '@/templates'
import type { Menu, MenuSummary } from '@/types/menu'

export function MenuListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const {
    data: menus,
    isLoading,
    error,
    reload,
  } = useAsyncData(() => indexedDbRepository.listMenus(), [])
  const [pendingDelete, setPendingDelete] = useState<MenuSummary | undefined>(undefined)
  const [working, setWorking] = useState(false)

  const createAndOpen = async (menu: Menu) => {
    setWorking(true)
    try {
      await indexedDbRepository.saveMenu(menu)
      navigate(paths.editor(menu.id))
    } catch (thrown) {
      console.error(thrown)
      toast.error(errorMessage(thrown, 'No se pudo crear el menú.'))
    } finally {
      setWorking(false)
    }
  }

  const duplicate = async (summary: MenuSummary) => {
    setWorking(true)
    try {
      const source = await indexedDbRepository.getMenu(summary.id)
      if (!source) throw new Error('No encontramos el menú original.')
      const copy = duplicateMenu(source, todayIso())
      await indexedDbRepository.saveMenu(copy)
      toast.success('Menú duplicado con la fecha de hoy.')
      navigate(paths.editor(copy.id))
    } catch (thrown) {
      console.error(thrown)
      toast.error(errorMessage(thrown, 'No se pudo duplicar el menú.'))
    } finally {
      setWorking(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setWorking(true)
    try {
      await indexedDbRepository.deleteMenu(pendingDelete.id)
      setPendingDelete(undefined)
      toast.success('Menú eliminado.')
      reload()
    } catch (thrown) {
      console.error(thrown)
      toast.error(errorMessage(thrown, 'No se pudo eliminar el menú.'))
    } finally {
      setWorking(false)
    }
  }

  const hasMenus = (menus?.length ?? 0) > 0

  return (
    <>
      <TopBar
        title="Menús"
        actions={
          <Tooltip title="Datos del negocio">
            <IconButton onClick={() => navigate(paths.settings())} aria-label="Datos del negocio">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <Stack
        spacing={2}
        sx={{
          width: '100%',
          maxWidth: 680,
          mx: 'auto',
          p: 2,
          pb: 'calc(32px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 6,
            color: '#fff',
            background:
              'radial-gradient(120% 120% at 100% 0%, rgb(247 194 75 / 55%) 0%, transparent 55%),' +
              'linear-gradient(135deg, #be1a0d 0%, #b96c11 100%)',
          }}
        >
          <Stack spacing={2}>
            <Box
              component="img"
              src={LOGO_SRC}
              alt={LOGO_ALT}
              sx={{ width: 190, height: 'auto', filter: 'drop-shadow(0 0 2px rgb(255 255 255 / 85%))' }}
            />
            <Typography sx={{ color: 'rgb(255 255 255 / 92%)' }}>
              Arma el menú del día y compártelo por WhatsApp en un par de minutos.
            </Typography>
            <Button
              variant="contained"
              color="inherit"
              size="large"
              startIcon={<AddIcon />}
              fullWidth
              loading={working}
              onClick={() => void createAndOpen(hasMenus ? createMenu() : createStarterMenu())}
              sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#fff' } }}
            >
              Nuevo menú de hoy
            </Button>
          </Stack>
        </Paper>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {isLoading ? (
          <PageSpinner label="Cargando menús" />
        ) : !hasMenus ? (
          <EmptyState
            icon="🍽️"
            title="Todavía no hay menús"
            description="Crea el primero: ya viene con los platillos y precios que usan normalmente, listos para ajustar."
          />
        ) : (
          <>
            <Typography variant="subtitle2" color="text.disabled">
              Menús guardados
            </Typography>
            <Stack spacing={2} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {menus?.map((summary) => {
                const badge = relativeDayLabel(summary.date)
                return (
                  <Paper key={summary.id} component="li" variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="h6" component="p">
                            {formatLongDate(summary.date)}
                          </Typography>
                          {badge ? <Chip label={badge} color="primary" size="small" /> : null}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {summary.title} · {summary.dishCount}{' '}
                          {summary.dishCount === 1 ? 'platillo' : 'platillos'} ·{' '}
                          {TEMPLATES[summary.templateId].name}
                        </Typography>
                      </Box>
                      <Tooltip title="Eliminar menú">
                        <IconButton
                          aria-label={`Eliminar menú del ${formatLongDate(summary.date)}`}
                          onClick={() => setPendingDelete(summary)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      sx={{ mt: 2, flexWrap: 'wrap', '& > *': { flex: '1 1 auto' } }}
                    >
                      <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(paths.editor(summary.id))}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(paths.preview(summary.id))}
                      >
                        Ver
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        disabled={working}
                        onClick={() => void duplicate(summary)}
                      >
                        Duplicar
                      </Button>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          </>
        )}
      </Stack>

      <ConfirmDialog
        open={pendingDelete !== undefined}
        title="¿Eliminar este menú?"
        message={
          pendingDelete
            ? `Se eliminará el menú del ${formatLongDate(pendingDelete.date)}. No se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        destructive
        loading={working}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(undefined)}
      />
    </>
  )
}
