import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotesIcon from '@mui/icons-material/NotesOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
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

/**
 * One dish, one line.
 *
 * The previous version stacked the price and the secondary controls onto their
 * own row, which made every dish 126px tall — a 24-dish menu became four
 * thousand pixels of scrolling and read as an unfinished form. Everything now
 * sits on a single wrapping line, and the rarely used actions (description,
 * delete) moved into an overflow menu, so a whole section fits on screen.
 */
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | undefined>(undefined)
  const [editingNote, setEditingNote] = useState(false)
  const [nameTouched, setNameTouched] = useState(false)
  const noteRef = useRef<HTMLInputElement>(null)

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

  const openNote = () => {
    setMenuAnchor(undefined)
    setEditingNote(true)
    // Let the collapse mount before reaching for the field.
    setTimeout(() => noteRef.current?.focus(), 60)
  }

  return (
    <Paper
      ref={setNodeRef}
      variant="outlined"
      sx={{
        px: 1,
        py: 0.75,
        // 1.25 x 12px. Anything larger turns a 58px row into a capsule, which is
        // what made a list of them read as bubbly rather than crisp.
        borderRadius: 1.25,
        borderColor: dish.featured ? 'secondary.light' : 'divider',
        bgcolor: dish.featured ? 'rgb(247 194 75 / 8%)' : 'background.paper',
        transition: 'border-color .15s ease, background-color .15s ease',
        '&:hover': { borderColor: dish.featured ? 'secondary.main' : 'text.disabled' },
        '&:focus-within': { borderColor: 'secondary.main' },
        ...(isDragging && { boxShadow: 6, opacity: 0.97, position: 'relative', zIndex: 1 }),
      }}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {/* Wrapping flex, not a media query: the name keeps a 180px basis, so the
          price and actions drop to a second line only when they truly cannot fit. */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          aria-label={`Mover ${dish.name || 'platillo'}`}
          sx={{
            width: 28,
            height: 36,
            borderRadius: 1.5,
            cursor: 'grab',
            touchAction: 'none',
            color: 'text.disabled',
            flex: 'none',
          }}
          {...attributes}
          {...listeners}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <DishPhotoButton
          dishName={dish.name}
          image={image}
          onPicked={(imageId) => onChange({ imageId })}
          onRemoved={() => onChange({ imageId: undefined })}
        />

        <Box sx={{ flex: '1 1 180px', minWidth: 0 }}>
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
            slotProps={{
              popper: { placement: 'bottom-start', modifiers: [{ name: 'flip', enabled: false }] },
              paper: { sx: { minWidth: 240 } },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Nombre del platillo"
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
                    sx: { fontWeight: 600, fontSize: '0.98rem' },
                  },
                }}
              />
            )}
          />
          {dish.description && !editingNote ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ pl: 0.25, mt: -0.25, lineHeight: 1.3 }}
            >
              {dish.description}
            </Typography>
          ) : null}
        </Box>

        {priceRequired ? (
          <TextField
            size="small"
            placeholder="0"
            value={priceDraft}
            error={Boolean(priceError)}
            onChange={(event) => handlePrice(event.target.value)}
            sx={{
              flex: 'none',
              width: 116,
              '& .MuiOutlinedInput-root': { bgcolor: 'transparent', borderRadius: 1.25 },
            }}
            slotProps={{
              htmlInput: { inputMode: 'decimal', 'aria-label': 'Precio' },
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 0.5 }}>
                    <Typography variant="body2" color="text.disabled">
                      {currency}
                    </Typography>
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : null}

        <Box sx={{ display: 'flex', flex: 'none', ml: 'auto' }}>
          <Tooltip title={dish.featured ? 'Quitar de especial del día' : 'Especial del día'}>
            <IconButton
              size="small"
              onClick={onToggleFeatured}
              aria-pressed={Boolean(dish.featured)}
              aria-label={dish.featured ? 'Quitar de especial del día' : 'Marcar como especial del día'}
              sx={{ color: dish.featured ? 'secondary.main' : 'text.disabled' }}
            >
              {dish.featured ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            aria-label={`Más opciones de ${dish.name || 'este platillo'}`}
            sx={{ color: 'text.disabled' }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={editingNote} unmountOnExit>
        <Box sx={{ pl: { xs: 0, sm: 5.5 }, pr: 0.5, pt: 1, pb: 0.5 }}>
          <TextField
            inputRef={noteRef}
            label="Descripción"
            placeholder="Ej. servido con arroz y ensalada"
            multiline
            minRows={2}
            size="small"
            value={dish.description ?? ''}
            onChange={(event) => onChange({ description: event.target.value || undefined })}
            onBlur={() => setEditingNote(false)}
            slotProps={{ htmlInput: { maxLength: LIMITS.dishDescription } }}
          />
        </Box>
      </Collapse>

      <Menu
        anchorEl={menuAnchor}
        open={menuAnchor !== undefined}
        onClose={() => setMenuAnchor(undefined)}
        slotProps={{ paper: { sx: { minWidth: 216 } } }}
      >
        <MenuItem onClick={openNote}>
          <ListItemIcon>
            <NotesIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{dish.description ? 'Editar descripción' : 'Agregar descripción'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            setMenuAnchor(undefined)
            onRemove()
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar platillo</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  )
}
