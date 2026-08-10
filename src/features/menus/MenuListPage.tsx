import { useState } from 'react'
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
import { useMenuImages } from '@/hooks/useMenuImages'
import { paths, useNavigate } from '@/hooks/useRoute'
import { indexedDbRepository } from '@/lib/db'
import { formatLongDate, relativeDayLabel, todayIso } from '@/lib/date'
import { createMenu, createStarterMenu, duplicateMenu } from '@/lib/defaults'
import { TEMPLATES } from '@/templates'
import type { Menu, MenuSummary } from '@/types/menu'
import { useBusiness } from '@/features/business/BusinessContext'
import { MenuStage } from '@/features/preview/MenuStage'
import { HomeHero } from './HomeHero'
import { VerseOfTheDay } from './VerseOfTheDay'

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

  const saved = menus ?? []
  const today = saved.find((summary) => summary.date === todayIso())
  const latest = saved[0]

  // The hero shows the real thing rather than an illustration: this is exactly
  // what they are about to send. One menu, loaded only when one exists.
  const featuredId = (today ?? latest)?.id
  const { data: featured } = useAsyncData(
    () => (featuredId ? indexedDbRepository.getMenu(featuredId) : Promise.resolve(undefined)),
    [featuredId],
  )
  const { images: featuredImages } = useMenuImages(featured)
  const { business } = useBusiness()

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
        spacing={{ xs: 3, md: 4 }}
        sx={{
          width: '100%',
          maxWidth: 1080,
          mx: 'auto',
          p: { xs: 2, md: 4 },
          pb: 'calc(48px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <HomeHero
          continueLabel={today ? 'Continuar el menú de hoy' : undefined}
          busy={working}
          onPrimary={() => {
            // Two menus on the same date is confusing, and it is the mistake
            // most likely to happen mid-shift. Reopen instead of duplicating.
            if (today) navigate(paths.editor(today.id))
            else void createAndOpen(saved.length > 0 ? createMenu() : createStarterMenu())
          }}
          onDuplicateLast={latest && !today ? () => void duplicate(latest) : undefined}
          preview={
            featured ? (
              <MenuStage menu={featured} business={business} images={featuredImages} />
            ) : undefined
          }
        />

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(290px, 340px)' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.disabled">
              Menús guardados
            </Typography>

            {isLoading ? (
              <PageSpinner label="Cargando menús" />
            ) : saved.length === 0 ? (
              <Paper variant="outlined" sx={{ borderRadius: 4, borderStyle: 'dashed' }}>
                <EmptyState
                  icon="🍽️"
                  title="Aún no hay menús"
                  description="Crea el primero desde el botón de arriba: ya viene con los platillos y precios de siempre, listos para ajustar."
                />
              </Paper>
            ) : (
              <Stack spacing={2} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {saved.map((summary) => (
                  <MenuCard
                    key={summary.id}
                    summary={summary}
                    working={working}
                    onEdit={() => navigate(paths.editor(summary.id))}
                    onView={() => navigate(paths.preview(summary.id))}
                    onDuplicate={() => void duplicate(summary)}
                    onDelete={() => setPendingDelete(summary)}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" color="text.disabled">
              Para tus menús
            </Typography>
            <VerseOfTheDay />
          </Stack>
        </Box>
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

interface MenuCardProps {
  summary: MenuSummary
  working: boolean
  onEdit: () => void
  onView: () => void
  onDuplicate: () => void
  onDelete: () => void
}

function MenuCard({ summary, working, onEdit, onView, onDuplicate, onDelete }: MenuCardProps) {
  const badge = relativeDayLabel(summary.date)
  const template = TEMPLATES[summary.templateId]

  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        p: 2.5,
        // Colour spine in the template's own palette: tells you at a glance
        // which design a saved menu uses, without another line of text. A real
        // left border follows the rounded corners; an absolutely positioned
        // strip gets clipped into a sliver and reads as a rendering glitch.
        borderLeft: '7px solid',
        borderLeftColor: template.swatch[1],
        transition: 'box-shadow .18s ease, transform .18s ease',
        '&:hover': { boxShadow: 3, transform: 'translateY(-1px)' },
      }}
    >
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
            {summary.dishCount === 1 ? 'platillo' : 'platillos'} · {template.name}
          </Typography>
        </Box>
        <Tooltip title="Eliminar menú">
          <IconButton
            aria-label={`Eliminar menú del ${formatLongDate(summary.date)}`}
            onClick={onDelete}
            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
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
        <Button size="small" startIcon={<EditIcon />} onClick={onEdit}>
          Editar
        </Button>
        <Button size="small" startIcon={<VisibilityIcon />} onClick={onView}>
          Ver
        </Button>
        <Button size="small" startIcon={<ContentCopyIcon />} disabled={working} onClick={onDuplicate}>
          Duplicar
        </Button>
      </Stack>
    </Paper>
  )
}
