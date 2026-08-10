import { useCallback, useRef, useState } from 'react'
import EditIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { TopBar } from '@/components/AppBar'
import { EmptyState, PageSpinner } from '@/components/Feedback'
import { useMenuEditor } from '@/hooks/useMenuEditor'
import { useMenuImages } from '@/hooks/useMenuImages'
import { paths, useNavigate } from '@/hooks/useRoute'
import { formatLongDate } from '@/lib/date'
import { touch } from '@/lib/menuOps'
import { countDishes } from '@/lib/validation'
import { FORMAT_LIST, TEMPLATE_LIST } from '@/templates'
import type { FormatId } from '@/types/menu'
import { useBusiness } from '@/features/business/BusinessContext'
import { MenuStage } from './MenuStage'
import { ExportBar } from './ExportBar'

export function PreviewPage({ menuId }: { menuId: string }) {
  const navigate = useNavigate()
  const { business } = useBusiness()
  const { menu, isLoading, loadError, saveError, update } = useMenuEditor(menuId)
  const { images, isLoading: imagesLoading } = useMenuImages(menu)
  const captureRef = useRef<HTMLDivElement>(null)
  const [clipped, setClipped] = useState(false)
  const handleOverflow = useCallback((value: boolean) => setClipped(value), [])

  if (isLoading) {
    return (
      <>
        <TopBar title="Vista previa" onBack={() => navigate(paths.list())} />
        <PageSpinner label="Cargando menú" />
      </>
    )
  }

  if (loadError || !menu) {
    return (
      <>
        <TopBar title="Vista previa" onBack={() => navigate(paths.list())} />
        <EmptyState
          icon="🤔"
          title="No encontramos este menú"
          action={
            <Button variant="contained" onClick={() => navigate(paths.list())}>
              Ver mis menús
            </Button>
          }
        />
      </>
    )
  }

  const isEmpty = countDishes(menu) === 0
  const activeTemplate = TEMPLATE_LIST.find((template) => template.id === menu.templateId)
  const activeFormat = FORMAT_LIST.find((format) => format.id === menu.formatId)

  return (
    <>
      <TopBar
        title="Vista previa"
        subtitle={formatLongDate(menu.date)}
        onBack={() => navigate(paths.editor(menuId))}
        actions={
          <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(paths.editor(menuId))}>
            Editar
          </Button>
        }
      />

      <Box
        sx={{
          display: { xs: 'flex', md: 'grid' },
          flexDirection: 'column',
          gridTemplateColumns: { md: 'minmax(300px, 380px) minmax(0, 1fr)' },
          alignItems: { md: 'start' },
          gap: { xs: 2, md: 4 },
          width: '100%',
          maxWidth: { xs: 560, md: 900 },
          mx: 'auto',
          p: 2,
          pb: 'calc(160px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380, mx: { xs: 'auto', md: 0 }, position: { md: 'sticky' }, top: { md: 16 } }}>
          <MenuStage
            menu={menu}
            business={business}
            images={images}
            captureRef={captureRef}
            onOverflow={handleOverflow}
          />
        </Box>

        <Stack spacing={3} sx={{ width: '100%', minWidth: 0 }}>
          {saveError ? <Alert severity="error">{saveError}</Alert> : null}
          {isEmpty ? (
            <Alert severity="warning">
              Este menú todavía no tiene platillos. Agrégalos antes de compartirlo.
            </Alert>
          ) : null}
          {clipped ? (
            <Alert severity="warning">
              El menú es muy largo para este formato y no cabe completo. Prueba con «Estado 9:16» o
              quita algunos platillos.
            </Alert>
          ) : null}

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.disabled">
              Diseño
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
              {TEMPLATE_LIST.map((template) => {
                const active = template.id === menu.templateId
                return (
                  <ButtonBase
                    key={template.id}
                    aria-pressed={active}
                    onClick={() => update((current) => touch({ ...current, templateId: template.id }))}
                    sx={{
                      flexDirection: 'column',
                      gap: 1,
                      p: 1,
                      border: 2,
                      borderColor: active ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: active ? '0 0 0 3px rgb(190 26 13 / 12%)' : 'none',
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{ width: '100%', height: 44, borderRadius: 1, border: '1px solid rgb(0 0 0 / 8%)' }}
                      style={{
                        background: `linear-gradient(135deg, ${template.swatch[0]} 0 50%, ${template.swatch[1]} 50% 100%)`,
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {template.name}
                    </Typography>
                  </ButtonBase>
                )
              })}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {activeTemplate?.description}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.disabled">
              Formato
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={menu.formatId}
              onChange={(_event, value: FormatId | null) => {
                if (value) update((current) => touch({ ...current, formatId: value }))
              }}
              aria-label="Formato de salida"
            >
              {FORMAT_LIST.map((format) => (
                <ToggleButton key={format.id} value={format.id}>
                  {format.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="body2" color="text.secondary">
              {activeFormat?.hint}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <ExportBar
        menu={menu}
        business={business}
        captureRef={captureRef}
        ready={!imagesLoading && !isEmpty}
      />
    </>
  )
}
