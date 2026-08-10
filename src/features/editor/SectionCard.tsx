import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { ImageMap } from '@/hooks/useMenuImages'
import { useDishSuggestions } from '@/hooks/useDishSuggestions'
import { LIMITS, parsePrice, validatePrice } from '@/lib/validation'
import type { Dish, Menu, MenuSection, PriceMode } from '@/types/menu'
import { DishRow } from './DishRow'

const PRICE_MODES: readonly { value: PriceMode; label: string }[] = [
  { value: 'per-item', label: 'Cada uno' },
  { value: 'included', label: 'Incluidos' },
  { value: 'flat', label: 'Precio único' },
]

function priceToText(price: number | undefined): string {
  return price === undefined ? '' : String(price)
}

interface SectionCardProps {
  section: MenuSection
  menu: Menu
  images: ImageMap
  currency: string
  canMoveUp: boolean
  canMoveDown: boolean
  onSectionChange: (patch: Partial<MenuSection>) => void
  onSectionRemove: () => void
  onMove: (direction: -1 | 1) => void
  onDishAdd: () => void
  onDishChange: (dishId: string, patch: Partial<Dish>) => void
  onDishRemove: (dishId: string) => void
  onDishToggleFeatured: (dishId: string) => void
  onDishReorder: (from: number, to: number) => void
}

export function SectionCard({
  section,
  menu,
  images,
  currency,
  canMoveUp,
  canMoveDown,
  onSectionChange,
  onSectionRemove,
  onMove,
  onDishAdd,
  onDishChange,
  onDishRemove,
  onDishToggleFeatured,
  onDishReorder,
}: SectionCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [flatDraft, setFlatDraft] = useState(priceToText(section.flatPrice))
  const [lastFlat, setLastFlat] = useState(section.flatPrice)
  if (lastFlat !== section.flatPrice) {
    setLastFlat(section.flatPrice)
    setFlatDraft(priceToText(section.flatPrice))
  }

  const suggestions = useDishSuggestions(section, menu)

  // A small activation distance keeps taps on the handle from starting a drag,
  // which is what makes this usable with a thumb.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = section.dishes.findIndex((dish) => dish.id === active.id)
    const to = section.dishes.findIndex((dish) => dish.id === over.id)
    if (from >= 0 && to >= 0) onDishReorder(from, to)
  }

  const flatError = section.priceMode === 'flat' ? validatePrice(flatDraft, false) : undefined
  const atDishLimit = section.dishes.length >= LIMITS.maxDishesPerSection

  return (
    <Paper variant="outlined" component="section" sx={{ overflow: 'hidden' }} aria-label={section.title || 'Sección'}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1.5, bgcolor: '#f4ede3' }}>
        <InputBase
          value={section.title}
          onChange={(event) => onSectionChange({ title: event.target.value })}
          placeholder="Nombre de la sección"
          // `width: 0` matters: an <input> keeps an intrinsic width from its
          // `size` attribute, which would push the page wider than a phone.
          sx={{
            flex: '1 1 auto',
            width: 0,
            minWidth: 0,
            px: 1,
            borderRadius: 1,
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 800,
            '&:hover, &.Mui-focused': { bgcolor: 'background.paper' },
          }}
          slotProps={{ input: { maxLength: LIMITS.sectionTitle, 'aria-label': 'Nombre de la sección' } }}
        />
        <Tooltip title="Subir sección">
          <span>
            <IconButton onClick={() => onMove(-1)} disabled={!canMoveUp} aria-label="Subir sección">
              <KeyboardArrowUpIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Bajar sección">
          <span>
            <IconButton onClick={() => onMove(1)} disabled={!canMoveDown} aria-label="Bajar sección">
              <KeyboardArrowDownIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Opciones de la sección">
          <IconButton
            onClick={() => setSettingsOpen((open) => !open)}
            aria-expanded={settingsOpen}
            aria-label="Opciones de la sección"
          >
            {/* A distinct glyph: two chevrons already mean "move" in this row. */}
            <TuneIcon color={settingsOpen ? 'primary' : 'inherit'} />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={settingsOpen} unmountOnExit>
        <Stack spacing={2} sx={{ p: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              ¿Cómo se cobran estos platillos?
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={section.priceMode}
              onChange={(_event, value: PriceMode | null) => {
                if (value) onSectionChange({ priceMode: value })
              }}
              aria-label="Modo de precio"
            >
              {PRICE_MODES.map((mode) => (
                <ToggleButton key={mode.value} value={mode.value}>
                  {mode.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {section.priceMode === 'flat' ? (
            <TextField
              label="Precio para todos"
              placeholder="28"
              value={flatDraft}
              error={Boolean(flatError)}
              helperText={flatError}
              onChange={(event) => {
                setFlatDraft(event.target.value)
                if (!validatePrice(event.target.value, false)) {
                  onSectionChange({ flatPrice: parsePrice(event.target.value) })
                }
              }}
              slotProps={{
                htmlInput: { inputMode: 'decimal' },
                input: { startAdornment: <InputAdornment position="start">{currency}</InputAdornment> },
              }}
            />
          ) : null}

          <TextField
            label="Nota (opcional)"
            placeholder="Ej. Incluidos con todos los almuerzos"
            value={section.note ?? ''}
            onChange={(event) => onSectionChange({ note: event.target.value || undefined })}
            slotProps={{ htmlInput: { maxLength: LIMITS.sectionNote } }}
          />

          {/* Tucked behind the disclosure: deleting a whole section should take
              one deliberate extra tap, not sit next to the everyday controls. */}
          <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmRemove(true)}>
            Eliminar sección
          </Button>
        </Stack>
      </Collapse>

      <Stack spacing={1} sx={{ p: 1.5 }}>
        {section.dishes.length === 0 ? (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ p: 2, border: 2, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}
          >
            Todavía no hay platillos en esta sección.
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={section.dishes.map((dish) => dish.id)}
              strategy={verticalListSortingStrategy}
            >
              <Stack spacing={1}>
                {section.dishes.map((dish) => (
                  <DishRow
                    key={dish.id}
                    dish={dish}
                    section={section}
                    currency={currency}
                    suggestions={suggestions}
                    image={dish.imageId ? images.get(dish.imageId) : undefined}
                    onChange={(patch) => onDishChange(dish.id, patch)}
                    onRemove={() => onDishRemove(dish.id)}
                    onToggleFeatured={() => onDishToggleFeatured(dish.id)}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}

        <Button
          startIcon={<AddIcon />}
          onClick={onDishAdd}
          disabled={atDishLimit}
          title={atDishLimit ? `Máximo ${LIMITS.maxDishesPerSection} platillos por sección` : undefined}
          fullWidth
        >
          Agregar platillo
        </Button>
      </Stack>

      <ConfirmDialog
        open={confirmRemove}
        title="¿Eliminar la sección?"
        message={`Se eliminarán "${section.title}" y sus ${section.dishes.length} platillo(s). No se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          setConfirmRemove(false)
          onSectionRemove()
        }}
        onCancel={() => setConfirmRemove(false)}
      />
    </Paper>
  )
}
