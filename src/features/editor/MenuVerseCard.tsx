import AutoStoriesIcon from '@mui/icons-material/AutoStoriesOutlined'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LIMITS } from '@/lib/validation'
import type { BusinessInfo, Menu } from '@/types/menu'

interface MenuVerseCardProps {
  menu: Menu
  business: BusinessInfo
  onChange: (patch: Pick<Menu, 'verseText' | 'verseRef'>) => void
}

/**
 * El versículo de este menú.
 *
 * Se escribe a mano y sin catálogo: el versículo que va al pie del menú es una
 * decisión de la familia, no algo que la app deba elegir por ellos. Va al final
 * del editor porque ese es su lugar en el menú impreso.
 *
 * Tres estados, y la tarjeta dice en cuál está: heredado de Ajustes (el campo
 * nunca se ha tocado), propio de este menú, o vacío a propósito —que significa
 * que este menú sale sin versículo, no que vuelva a heredar—.
 */
export function MenuVerseCard({ menu, business, onChange }: MenuVerseCardProps) {
  const inherited = menu.verseText === undefined
  const inheritedText = business.verseText.trim()

  return (
    <Paper variant="outlined" component="section" aria-label="Versículo del menú" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <AutoStoriesIcon fontSize="small" color="primary" />
          <Typography variant="h6" component="h2" sx={{ fontSize: '1.05rem' }}>
            Versículo de este menú
          </Typography>
        </Stack>

        <TextField
          label="Versículo"
          placeholder="Escribe aquí el versículo que quieres al pie de este menú"
          multiline
          minRows={3}
          value={menu.verseText ?? ''}
          onChange={(event) => onChange({ verseText: event.target.value, verseRef: menu.verseRef })}
          slotProps={{ htmlInput: { maxLength: LIMITS.verseText } }}
        />

        <TextField
          label="Referencia (opcional)"
          placeholder="Ej. Salmos 34:8"
          value={menu.verseRef ?? ''}
          onChange={(event) => onChange({ verseText: menu.verseText ?? '', verseRef: event.target.value })}
          slotProps={{ htmlInput: { maxLength: LIMITS.verseRef } }}
        />

        {inherited && inheritedText ? (
          <>
            <Typography variant="body2" color="text.secondary">
              Mientras esté vacío, este menú imprime el versículo de Ajustes:{' '}
              <em>«{inheritedText}»</em>
              {business.verseRef ? ` — ${business.verseRef}` : ''}
            </Typography>
            <Button
              size="small"
              onClick={() => onChange({ verseText: inheritedText, verseRef: business.verseRef })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Copiarlo aquí para editarlo
            </Button>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {menu.verseText?.trim()
              ? 'Este versículo solo afecta a este menú.'
              : 'Vacío: este menú saldrá sin versículo.'}
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}
