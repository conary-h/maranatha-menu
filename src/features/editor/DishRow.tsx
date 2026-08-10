import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NotesIcon from '@mui/icons-material/NotesOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import type { ResolvedImage } from '@/lib/imageStore'
import { LIMITS, parsePrice, validateDishName, validatePrice } from '@/lib/validation'
import type { Dish, MenuSection } from '@/types/menu'
import { DishPhotoButton } from './ImagePicker'

function priceToText(price: number | undefined): string {
  return price === undefined ? '' : String(price)
}

interface DishRowProps {
  dish: Dish
  section: MenuSection
  image: ResolvedImage | undefined
  currency: string
  /** Ranked dish names offered while typing. */
  suggestions: readonly string[]
  onChange: (patch: Partial<Dish>) => void
  onRemove: () => void
  onToggleFeatured: () => void
}

export function DishRow({
  dish,
  section,
  image,
  currency,
  suggestions,
  onChange,
  onRemove,
  onToggleFeatured,
}: DishRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dish.id,
  })
  const [showDetail, setShowDetail] = useState(Boolean(dish.description))
  const [nameTouched, setNameTouched] = useState(false)

  const priceRequired = section.priceMode === 'per-item'
  // The draft is kept as text so half-typed values like "13" or "130." survive;
  // it re-syncs whenever the price changes from outside (duplicate, restore).
  const [priceDraft, setPriceDraft] = useState(priceToText(dish.price))
  const [lastPrice, setLastPrice] = useState(dish.price)
  if (lastPrice !== dish.price) {
    setLastPrice(dish.price)
    setPriceDraft(priceToText(dish.price))
  }

  const nameError = nameTouched ? validateDishName(dish.name) : undefined
  const priceError = priceRequired ? validatePrice(priceDraft, false) : undefined

  const handlePrice = (value: string) => {
    setPriceDraft(value)
    if (validatePrice(value, false)) return
    onChange({ price: parsePrice(value) })
  }

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 3,
        ...(isDragging && { boxShadow: 6, opacity: 0.95, position: 'relative', zIndex: 1 }),
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          aria-label={`Mover ${dish.name || 'platillo'}`}
          sx={{ cursor: 'grab', touchAction: 'none', color: 'text.disabled', flex: 'none' }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon />
        </IconButton>

        <DishPhotoButton
          dishName={dish.name}
          image={image}
          onPicked={(imageId) => onChange({ imageId })}
          onRemoved={() => onChange({ imageId: undefined })}
        />

        <Autocomplete
          // freeSolo: the catalogue is a shortcut, never a restriction — they
          // must always be able to type a dish nobody has cooked before.
          freeSolo
          autoHighlight
          selectOnFocus
          handleHomeEndKeys
          disableClearable
          options={suggestions}
          inputValue={dish.name}
          onInputChange={(_event, value) => onChange({ name: value })}
          filterOptions={(options, state) => {
            const query = state.inputValue.trim().toLowerCase()
            if (query.length < 2) return options.slice(0, 8)
            return options.filter((option) => option.toLowerCase().includes(query)).slice(0, 8)
          }}
          sx={{ flex: '1 1 auto', minWidth: 0 }}
          slotProps={{
            // The field sits after the drag handle and the photo, so it is far
            // narrower than the row; let the list use the whole card instead.
            popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] },
            paper: { sx: { minWidth: 240 } },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder="Nombre del platillo"
              label={undefined}
              error={Boolean(nameError)}
              helperText={nameError}
              onBlur={() => setNameTouched(true)}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  maxLength: LIMITS.dishName,
                  'aria-label': 'Nombre del platillo',
                },
                input: {
                  ...params.slotProps.input,
                  disableUnderline: !nameError,
                  sx: { fontWeight: 600 },
                },
              }}
            />
          )}
        />

        <Tooltip title="Eliminar platillo">
          <IconButton
            aria-label={`Eliminar ${dish.name || 'platillo'}`}
            onClick={onRemove}
            sx={{ flex: 'none', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, pl: 5.5, pt: 1 }}>
        {priceRequired ? (
          <TextField
            size="small"
            placeholder="0"
            value={priceDraft}
            error={Boolean(priceError)}
            helperText={priceError}
            onChange={(event) => handlePrice(event.target.value)}
            sx={{ width: 130 }}
            slotProps={{
              htmlInput: { inputMode: 'decimal', 'aria-label': 'Precio' },
              input: {
                startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
              },
            }}
          />
        ) : null}

        <Tooltip title={dish.featured ? 'Quitar de especial del día' : 'Marcar como especial del día'}>
          <IconButton
            onClick={onToggleFeatured}
            aria-pressed={Boolean(dish.featured)}
            aria-label={dish.featured ? 'Quitar de especial del día' : 'Marcar como especial del día'}
            sx={{ color: dish.featured ? 'secondary.main' : 'text.disabled' }}
          >
            {dish.featured ? <StarIcon /> : <StarBorderIcon />}
          </IconButton>
        </Tooltip>

        <Tooltip title={showDetail ? 'Ocultar descripción' : 'Agregar descripción'}>
          <IconButton
            onClick={() => setShowDetail((open) => !open)}
            aria-expanded={showDetail}
            aria-label={showDetail ? 'Ocultar descripción' : 'Agregar descripción'}
            sx={{ color: dish.description ? 'text.primary' : 'text.disabled' }}
          >
            {showDetail ? <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} /> : <NotesIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={showDetail} unmountOnExit>
        <Box sx={{ pl: 5.5, pt: 1, pb: 0.5 }}>
          <TextField
            label="Descripción (opcional)"
            placeholder="Ej. servido con arroz y ensalada"
            multiline
            minRows={2}
            size="small"
            value={dish.description ?? ''}
            onChange={(event) => onChange({ description: event.target.value || undefined })}
            slotProps={{ htmlInput: { maxLength: LIMITS.dishDescription } }}
          />
        </Box>
      </Collapse>
    </Paper>
  )
}
