import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TopBar } from '@/components/AppBar'
import { EmptyState, PageSpinner } from '@/components/Feedback'
import { useMenuEditor, type SaveState } from '@/hooks/useMenuEditor'
import { useMenuImages } from '@/hooks/useMenuImages'
import { paths, useNavigate } from '@/hooks/useRoute'
import { formatLongDate, isValidIsoDate } from '@/lib/date'
import { createDish, createSection } from '@/lib/defaults'
import {
  addDish,
  addSection,
  moveDish,
  moveSection,
  removeDish,
  removeSection,
  setFeaturedDish,
  touch,
  updateDish,
  updateSection,
} from '@/lib/menuOps'
import { LIMITS } from '@/lib/validation'
import { useBusiness } from '@/features/business/BusinessContext'
import { MenuStage } from '@/features/preview/MenuStage'
import { SectionCard } from './SectionCard'

const SAVE_LABEL: Record<SaveState, string> = {
  loading: 'Cargando…',
  saving: 'Guardando…',
  saved: 'Guardado',
  unsaved: 'Sin guardar',
  error: 'Error al guardar',
}

/** Room for the fixed action bar so the last section is never trapped under it. */
const BOTTOM_BAR_SPACE = 14

export function MenuEditorPage({ menuId }: { menuId: string }) {
  const navigate = useNavigate()
  const { business } = useBusiness()
  const { menu, isLoading, loadError, saveState, saveError, update, saveNow } = useMenuEditor(menuId)
  const { images } = useMenuImages(menu)
  const [dateError, setDateError] = useState<string | undefined>(undefined)

  const goBack = async () => {
    await saveNow()
    navigate(paths.list())
  }

  const goPreview = async () => {
    await saveNow()
    navigate(paths.preview(menuId))
  }

  if (isLoading) {
    return (
      <>
        <TopBar title="Cargando menú…" onBack={() => navigate(paths.list())} />
        <PageSpinner label="Cargando menú" />
      </>
    )
  }

  if (loadError || !menu) {
    return (
      <>
        <TopBar title="Menú" onBack={() => navigate(paths.list())} />
        <EmptyState
          icon="🤔"
          title="No encontramos este menú"
          description={loadError ?? 'Puede que se haya eliminado desde otra pestaña.'}
          action={
            <Button variant="contained" onClick={() => navigate(paths.list())}>
              Ver mis menús
            </Button>
          }
        />
      </>
    )
  }

  const atSectionLimit = menu.sections.length >= LIMITS.maxSections

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) minmax(380px, 480px)' }, minHeight: '100dvh' }}>
      <Box sx={{ minWidth: 0 }}>
        <TopBar
          title={formatLongDate(menu.date)}
          subtitle={menu.title}
          onBack={() => void goBack()}
          actions={
            <Button size="small" startIcon={<VisibilityIcon />} onClick={() => void goPreview()}>
              Vista previa
            </Button>
          }
        />

        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: { xs: 720, lg: 780 },
            mx: 'auto',
            p: 2,
            pb: `calc(${BOTTOM_BAR_SPACE * 8}px + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          {saveError ? <Alert severity="error">{saveError}</Alert> : null}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) minmax(0, 1fr)' }, gap: 2 }}>
              <TextField
                label="Fecha del menú"
                type="date"
                value={menu.date}
                error={Boolean(dateError)}
                helperText={dateError}
                onChange={(event) => {
                  const date = event.target.value
                  if (!isValidIsoDate(date)) {
                    setDateError('Elige una fecha válida.')
                    return
                  }
                  setDateError(undefined)
                  update((current) => touch({ ...current, date }))
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Título"
                value={menu.title}
                placeholder="Menú del día"
                onChange={(event) => update((current) => touch({ ...current, title: event.target.value }))}
                slotProps={{ htmlInput: { maxLength: LIMITS.menuTitle } }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Se mostrará como <strong>{formatLongDate(menu.date)}</strong>
            </Typography>
          </Paper>

          {menu.sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              menu={menu}
              images={images}
              currency={business.currency}
              canMoveUp={index > 0}
              canMoveDown={index < menu.sections.length - 1}
              onSectionChange={(patch) => update((current) => updateSection(current, section.id, patch))}
              onSectionRemove={() => update((current) => removeSection(current, section.id))}
              onMove={(direction) => update((current) => moveSection(current, index, index + direction))}
              onDishAdd={() => update((current) => addDish(current, section.id, createDish()))}
              onDishChange={(dishId, patch) => update((current) => updateDish(current, section.id, dishId, patch))}
              onDishRemove={(dishId) => update((current) => removeDish(current, section.id, dishId))}
              onDishToggleFeatured={(dishId) =>
                update((current) => {
                  const dish = section.dishes.find((candidate) => candidate.id === dishId)
                  return setFeaturedDish(current, section.id, dishId, !dish?.featured)
                })
              }
              onDishReorder={(from, to) => update((current) => moveDish(current, section.id, from, to))}
            />
          ))}

          <Button
            startIcon={<AddIcon />}
            fullWidth
            disabled={atSectionLimit}
            onClick={() => update((current) => addSection(current, createSection()))}
          >
            Agregar sección
          </Button>
        </Stack>

        <Paper
          square
          elevation={0}
          sx={{
            position: 'fixed',
            insetInline: { xs: 0, lg: '0 min(480px, 44%)' },
            bottom: 0,
            zIndex: 30,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'rgb(250 246 240 / 94%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              width: '100%',
              maxWidth: 720,
              mx: 'auto',
              px: 2,
              py: 1.5,
              pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <SaveIndicator state={saveState} />
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={() => void goPreview()}
              fullWidth
            >
              Ver y exportar
            </Button>
          </Stack>
        </Paper>
      </Box>

      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          position: 'sticky',
          top: 0,
          flexDirection: 'column',
          gap: 1.5,
          alignItems: 'center',
          height: '100dvh',
          p: 3,
          borderLeft: 1,
          borderColor: 'divider',
          bgcolor: '#f4ede3',
          overflowY: 'auto',
        }}
      >
        <Typography variant="subtitle2" color="text.disabled" sx={{ alignSelf: 'flex-start' }}>
          Vista previa en vivo
        </Typography>
        <Box sx={{ width: '100%', maxWidth: 340 }}>
          <MenuStage menu={menu} business={business} images={images} />
        </Box>
      </Box>
    </Box>
  )
}

function SaveIndicator({ state }: { state: SaveState }) {
  const color = state === 'error' ? 'error.main' : state === 'saved' ? 'success.main' : 'text.secondary'
  return (
    <Stack
      direction="row"
      spacing={0.5}
      role="status"
      sx={{
        color,
        alignItems: 'center',
        flex: 'none',
        fontSize: '0.82rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {state === 'saving' ? <CircularProgress size={14} color="inherit" /> : null}
      {state === 'saved' ? <CheckIcon sx={{ fontSize: 16 }} /> : null}
      <span>{SAVE_LABEL[state]}</span>
    </Stack>
  )
}
