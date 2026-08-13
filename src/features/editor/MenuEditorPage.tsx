import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'
import SmartphoneIcon from '@mui/icons-material/SmartphoneOutlined'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { HANGER_H, TopBar } from '@/components/AppBar'
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
import { IconMissingLeaf } from '@/almanac/AlmanacUi'
import { ALM } from '@/almanac/tokens'
import { MenuVerseCard } from './MenuVerseCard'
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

/** Alto del lienzo dentro del cajón; el resto del 92dvh es asa, título y aire. */
const PREVIEW_HEIGHT = '72dvh'

export function MenuEditorPage({ menuId }: { menuId: string }) {
  const navigate = useNavigate()
  const { business } = useBusiness()
  const { menu, isLoading, loadError, saveState, saveError, update, saveNow } = useMenuEditor(menuId)
  const { images } = useMenuImages(menu)
  const [dateError, setDateError] = useState<string | undefined>(undefined)
  const [previewOpen, setPreviewOpen] = useState(false)
  // El lateral y el cajón son la misma vista previa en dos sitios: se decide en
  // JS, no en CSS, para que el teléfono monte un solo MenuStage. Ocultar el
  // lateral con `display: none` lo dejaba renderizando la plantilla entera en
  // cada tecleo, invisible y por nada.
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true })

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
          icon={<IconMissingLeaf />}
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
    <>
      {/* El fleje cruza la ventana entera. Partido a la altura de la rejilla
          dejaba un remache colgando en mitad de la pantalla y el lateral de la
          vista previa sin canto superior. */}
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

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(320px, 420px)' },
          minHeight: `calc(100dvh - ${HANGER_H}px)`,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
        <Stack
          spacing={2}
          sx={{
            width: '100%',
            maxWidth: { xs: 720, md: 760 },
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
              onDishAdd={(name) => update((current) => addDish(current, section.id, createDish(name)))}
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

          {/* Al final, como en el menú impreso: el versículo va al pie. */}
          <MenuVerseCard
            menu={menu}
            business={business}
            onChange={(patch) => update((current) => touch({ ...current, ...patch }))}
          />
        </Stack>

        <Paper
          square
          elevation={0}
          sx={{
            position: 'fixed',
            insetInline: { xs: 0, md: '0 min(420px, 36%)' },
            bottom: 0,
            zIndex: 30,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: ALM.paper,
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
            {!isDesktop ? (
              <Tooltip title="Ver cómo va quedando">
                <IconButton
                  aria-label="Ver cómo va quedando"
                  onClick={() => setPreviewOpen(true)}
                  sx={{
                    flex: 'none',
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <SmartphoneIcon />
                </IconButton>
              </Tooltip>
            ) : null}
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

      {isDesktop ? (
        <Box
          component="aside"
          sx={{
            display: 'flex',
            position: 'sticky',
            top: HANGER_H,
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
            height: `calc(100dvh - ${HANGER_H}px)`,
            p: 3,
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: ALM.paperShade,
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
      ) : (
        // Sin `swipeAreaWidth`: el borde inferior ya lo ocupa la barra de
        // acciones, así que se abre con el botón y se cierra deslizando.
        <SwipeableDrawer
          anchor="bottom"
          open={previewOpen}
          onOpen={() => setPreviewOpen(true)}
          onClose={() => setPreviewOpen(false)}
          disableSwipeToOpen
          slotProps={{
            paper: {
              'aria-label': 'Vista previa en vivo',
              sx: { maxHeight: '92dvh', bgcolor: ALM.paperShade },
            },
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              alignItems: 'center',
              px: 2,
              pt: 1,
              pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{ width: 40, height: 5, borderRadius: 999, bgcolor: 'divider', flex: 'none' }}
            />
            <Typography variant="subtitle2" color="text.disabled">
              Vista previa en vivo
            </Typography>
            {/* El alto manda: MenuStage se escala por su ancho, así que el ancho
                se despeja del alto disponible para que el 9:16 entre completo. */}
            <Box sx={{ width: `min(100%, calc(${PREVIEW_HEIGHT} * 9 / 16))` }}>
              <MenuStage menu={menu} business={business} images={images} />
            </Box>
          </Stack>
        </SwipeableDrawer>
      )}
      </Box>
    </>
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
