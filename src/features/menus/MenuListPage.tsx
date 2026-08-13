import { useState } from 'react'
import Box from '@mui/material/Box'
import GlobalStyles from '@mui/material/GlobalStyles'
import Skeleton from '@mui/material/Skeleton'
import { useToast } from '@/components/Toast'
import { errorMessage, useAsyncData } from '@/hooks/useAsync'
import { useMenuImages } from '@/hooks/useMenuImages'
import { paths, useNavigate } from '@/hooks/useRoute'
import { indexedDbRepository } from '@/lib/db'
import {
  dayOfMonth,
  formatLongDate,
  formatMonthYear,
  formatWeekdayShort,
  isSunday,
  monthKey,
  relativeDayLabel,
  todayIso,
} from '@/lib/date'
import { createMenu, createStarterMenu, duplicateMenu } from '@/lib/defaults'
import { TEMPLATES } from '@/templates'
import type { Menu, MenuSummary } from '@/types/menu'
import { useBusiness } from '@/features/business/BusinessContext'
import { MenuStage } from '@/features/preview/MenuStage'
import { LOGO_ALT, LOGO_SRC } from '@/templates/logo'
import {
  ALM,
  ALM_FONT,
  BOARD_SHEEN,
  PAPER_GRAIN,
  SHEET_SHADOW,
  TORN_EDGE_MASK,
} from '@/almanac/tokens'
import {
  AlmanacButton,
  IconDelete,
  IconDuplicate,
  IconEdit,
  IconEmptyPlate,
  IconSettings,
  IconView,
  InkStamp,
} from '@/almanac/AlmanacUi'
import { HANGER_H, TopBar } from '@/components/AppBar'
import { TodayLeaf } from './TodayLeaf'
import { VerseOfTheDay } from './VerseOfTheDay'

/**
 * El inicio es un almanaque de taco colgado en la pared.
 *
 * Cartón de respaldo a sangre en el rojo hondo del logotipo, fleje de hojalata
 * plano arriba con el
 * logotipo troquelado —que es exactamente el sitio donde un taco lleva la marca
 * de quien lo regala—, la hoja de hoy todavía prendida, y debajo el archivo de
 * las hojas ya arrancadas, agrupadas por mes.
 *
 * El contrato completo de la dirección vive en el comentario HTML de
 * `index.html`, que es el único sitio donde sobrevive a la compilación.
 */

export function MenuListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const {
    data: menus,
    isLoading,
    error,
    reload,
  } = useAsyncData(() => indexedDbRepository.listMenus(), [])
  const [pendingDelete, setPendingDelete] = useState<string | undefined>(undefined)
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

  const confirmDelete = async (summary: MenuSummary) => {
    setWorking(true)
    try {
      await indexedDbRepository.deleteMenu(summary.id)
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

  // La hoja enseña el menú de verdad, no una ilustración: es exactamente lo que
  // se está por mandar. Uno solo, y solo cuando existe.
  const featuredSummary = today ?? latest
  const featuredId = featuredSummary?.id
  const { data: featured, isLoading: featuredLoading } = useAsyncData(
    () => (featuredId ? indexedDbRepository.getMenu(featuredId) : Promise.resolve(undefined)),
    [featuredId],
  )
  const { images: featuredImages } = useMenuImages(featured)
  const { business } = useBusiness()

  const spec = featuredSummary
    ? `${featuredSummary.dishCount} ${featuredSummary.dishCount === 1 ? 'platillo' : 'platillos'} · ${TEMPLATES[featuredSummary.templateId].name}`
    : undefined

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: ALM.card,
        // El cartón está impreso, no pintado: la luz le cae desde el clavo del
        // que cuelga.
        backgroundImage: BOARD_SHEEN,
      }}
    >
      {/* El rebote del scroll en iOS enseñaría el crema del `body` por encima
          del fleje. Mientras esta ruta esté montada, el cartón llega al canto. */}
      <GlobalStyles
        styles={{
          body: { backgroundColor: ALM.card },
          '::selection': { background: ALM.red, color: ALM.paper },
        }}
      />

      <TopBar
        title="Menús"
        brand={
          <Box
            component="img"
            src={LOGO_SRC}
            alt={LOGO_ALT}
            sx={{ height: { xs: 26, md: 30 }, width: 'auto' }}
          />
        }
        actions={
          <AlmanacButton
            variant="icon"
            onClick={() => navigate(paths.settings())}
            aria-label="Datos del negocio"
            title="Datos del negocio"
            style={{ color: ALM.ink }}
          >
            <IconSettings size={22} />
          </AlmanacButton>
        }
      />

      <Box
        sx={{
          width: '100%',
          // Más ancha que antes (940): el cartón no debe comerse media pantalla a
          // los lados de la hoja.
          maxWidth: 1120,
          mx: 'auto',
          px: { xs: 1.5, md: 3 },
          pt: { xs: 3, md: 4.5 },
          pb: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <TodayLeaf
          continueLabel={today ? 'Continuar el menú de hoy' : undefined}
          busy={working}
          spec={spec}
          onPrimary={() => {
            // Dos menús con la misma fecha confunden, y es el error más fácil de
            // cometer a media mañana. Se reabre en vez de duplicar.
            if (today) navigate(paths.editor(today.id))
            else void createAndOpen(saved.length > 0 ? createMenu() : createStarterMenu())
          }}
          onDuplicateLast={latest && !today ? () => void duplicate(latest) : undefined}
          preview={
            // El menú anterior, aunque esté rancio, antes que un hueco: al
            // cambiar de destacado `featured` conserva el valor viejo mientras
            // carga el nuevo, y sustituirlo sería un parpadeo gratis.
            featured ? (
              <MenuStage menu={featured} business={business} images={featuredImages} />
            ) : featuredId && featuredLoading ? (
              <Box sx={{ aspectRatio: '9 / 16', bgcolor: ALM.paperShade }} />
            ) : undefined
          }
          foot={<VerseOfTheDay />}
        />

        {error ? <Errata>{error}</Errata> : null}

        <Box
          component="section"
          aria-label="Hojas arrancadas"
          sx={{ mt: { xs: 5, md: 7 } }}
        >
          <Box
            component="h2"
            sx={{
              m: 0,
              mb: 2,
              font: `400 0.9rem/1 ${ALM_FONT.figure}`,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'rgb(230 229 220 / 82%)',
            }}
          >
            Hojas arrancadas
          </Box>

          {isLoading ? (
            <Box aria-busy="true" aria-label="Cargando menús">
              <LeafSkeleton />
              <LeafSkeleton />
            </Box>
          ) : saved.length === 0 ? (
            <BlankLeaf />
          ) : (
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {groupByMonth(saved).map((group) => (
                <Box component="li" key={group.key} sx={{ mb: 3.5 }}>
                  {/* Pegajoso bajo el fleje: con un año de hojas encima, saber
                      en qué mes vas es la única forma de no perderse. */}
                  <Box
                    sx={{
                      position: 'sticky',
                      top: HANGER_H,
                      zIndex: 5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.25,
                      bgcolor: ALM.card,
                      font: `500 0.72rem/1 ${ALM_FONT.data}`,
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: 'rgb(230 229 220 / 74%)',
                    }}
                  >
                    {group.label}
                    <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgb(230 229 220 / 22%)' }} />
                  </Box>

                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                    {group.items.map((summary, index) => (
                      <TornLeaf
                        key={summary.id}
                        summary={summary}
                        tearOffset={index}
                        working={working}
                        confirming={pendingDelete === summary.id}
                        onEdit={() => navigate(paths.editor(summary.id))}
                        onView={() => navigate(paths.preview(summary.id))}
                        onDuplicate={() => void duplicate(summary)}
                        onAskDelete={() => setPendingDelete(summary.id)}
                        onCancelDelete={() => setPendingDelete(undefined)}
                        onConfirmDelete={() => void confirmDelete(summary)}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

/* ── Una hoja arrancada ─────────────────────────────────────────────────── */

interface TornLeafProps {
  summary: MenuSummary
  /** Corre la máscara del rasgado para que no haya dos cantos iguales. */
  tearOffset: number
  working: boolean
  confirming: boolean
  onEdit: () => void
  onView: () => void
  onDuplicate: () => void
  onAskDelete: () => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
}

function TornLeaf({
  summary,
  tearOffset,
  working,
  confirming,
  onEdit,
  onView,
  onDuplicate,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: TornLeafProps) {
  const template = TEMPLATES[summary.templateId]
  const badge = relativeDayLabel(summary.date)
  const sunday = isSunday(summary.date)
  const long = formatLongDate(summary.date)

  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        mt: '13px',
        bgcolor: ALM.paper,
        color: ALM.ink,
        boxShadow: SHEET_SHADOW,
        // El canto de arriba está roto; el de abajo es corte de guillotina.
        '&::before': {
          content: '""',
          position: 'absolute',
          insetInline: 0,
          top: '-11px',
          height: 12,
          bgcolor: ALM.paper,
          maskImage: TORN_EDGE_MASK,
          WebkitMaskImage: TORN_EDGE_MASK,
          maskSize: '96px 12px',
          WebkitMaskSize: '96px 12px',
          maskRepeat: 'repeat-x',
          WebkitMaskRepeat: 'repeat-x',
          maskPosition: `${(tearOffset * 29) % 96}px 0`,
          WebkitMaskPosition: `${(tearOffset * 29) % 96}px 0`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: PAPER_GRAIN,
          opacity: 0.03,
          pointerEvents: 'none',
        },
        '&:hover .alm-open::after': { background: 'rgb(27 26 21 / 4%)' },
      }}
    >
      {/* Sin envolver: en el teléfono, los iconos cayendo a una segunda línea
          hacían la fila de 180 px, y treinta menús eran cinco mil de scroll. */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: { xs: 1, md: 2 },
          px: { xs: 1.25, md: 2.5 },
          py: { xs: 1, md: 1.5 },
        }}
      >
        {/* La cifra y el día, como en la esquina de cualquier hoja. Alineada
            arriba y no al centro: la cifra y el título son lo que se recorre
            con la vista, y tienen que arrancar en la misma línea. */}
        <Box
          sx={{
            flex: 'none',
            alignSelf: 'flex-start',
            mt: '1px',
            textAlign: 'center',
            width: { xs: 42, md: 52 },
          }}
        >
          <Box
            sx={{
              font: `400 2rem/0.85 ${ALM_FONT.figure}`,
              fontVariantNumeric: 'tabular-nums',
              color: sunday ? ALM.red : ALM.ink,
            }}
          >
            {dayOfMonth(summary.date)}
          </Box>
          <Box
            sx={{
              mt: 0.5,
              font: `500 0.66rem/1 ${ALM_FONT.data}`,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: sunday ? ALM.red : ALM.inkMuted,
            }}
          >
            {formatWeekdayShort(summary.date)}
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {/* Enlace estirado: toda la hoja abre el editor sin anidar un botón
              dentro de otro, así los iconos de la derecha siguen siendo suyos. */}
          <Box
            component="button"
            type="button"
            className="alm-open"
            onClick={onEdit}
            sx={{
              appearance: 'none',
              border: 0,
              background: 'transparent',
              p: 0,
              maxWidth: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              font: `600 1.02rem/1.25 ${ALM_FONT.text}`,
              color: ALM.ink,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
              '&::after': { content: '""', position: 'absolute', inset: 0 },
              '&:focus-visible': { outline: 'none' },
              '&:focus-visible::after': { outline: `2px solid ${ALM.red}`, outlineOffset: -3 },
            }}
          >
            {summary.title}
          </Box>
            {/* El sello viaja con el título: en la línea de datos no le cabía
                a 390 px y partía la fila en un párrafo de tres renglones. */}
            {badge ? (
              <Box sx={{ flex: 'none', position: 'relative', zIndex: 1 }}>
                <InkStamp>{badge}</InkStamp>
              </Box>
            ) : null}
          </Box>
          <Box
            sx={{
              mt: 0.4,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
              gap: { xs: 0.75, sm: 1 },
              // Un cuerpo menor y menos prosa en el teléfono, para que el
              // nombre de la plantilla quepa: dos muestras amarillas sin
              // nombre no contestan «¿cuál diseño era ese?».
              font: {
                xs: `500 0.66rem/1.2 ${ALM_FONT.data}`,
                sm: `500 0.72rem/1.2 ${ALM_FONT.data}`,
              },
              letterSpacing: { xs: '0.06em', sm: '0.1em' },
              textTransform: 'uppercase',
              color: ALM.inkMuted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Box component="span" sx={{ whiteSpace: 'nowrap', flex: 'none' }}>
              {summary.dishCount}
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {' '}
                {summary.dishCount === 1 ? 'platillo' : 'platillos'}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {' '}
                plat.
              </Box>
            </Box>
            <Box
              component="span"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
            >
              {/* Muestra de tinta, no una franja de color en el canto. En el
                  teléfono la muestra basta: el color es la marca y el nombre
                  es el pie de foto que solo cabe en escritorio. */}
              <Box
                aria-hidden="true"
                sx={{
                  width: 9,
                  height: 9,
                  flex: 'none',
                  bgcolor: template.swatch[1],
                  outline: `1px solid rgb(27 26 21 / 30%)`,
                }}
              />
              <Box
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {template.name}
              </Box>
            </Box>
          </Box>
        </Box>

        {confirming ? (
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'nowrap',
              gap: 0.5,
            }}
          >
            <AlmanacButton
              variant="outline"
              onClick={onConfirmDelete}
              disabled={working}
              aria-label={`Confirmar que se elimina el menú del ${long}`}
              style={{ padding: '0 14px', borderColor: ALM.red, color: ALM.red }}
            >
              Eliminar
            </AlmanacButton>
            <AlmanacButton variant="quiet" onClick={onCancelDelete} autoFocus>
              No
            </AlmanacButton>
          </Box>
        ) : (
          <Box
            sx={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'nowrap' }}
          >
            {/* Solo el lápiz se cae en el teléfono: la hoja entera ya es un
                enlace al editor, así que repetía el gesto. «Ver» se queda —es
                la ruta desde la que se comparte, y el teléfono es justo la
                escena donde se comparte un menú viejo desde el mostrador. */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <AlmanacButton
                variant="icon"
                onClick={onEdit}
                aria-label={`Editar el menú del ${long}`}
                title="Editar"
              >
                <IconEdit />
              </AlmanacButton>
            </Box>
            <AlmanacButton
              variant="icon"
              onClick={onView}
              aria-label={`Ver y compartir el menú del ${long}`}
              title="Ver y compartir"
            >
              <IconView />
            </AlmanacButton>
            <AlmanacButton
              variant="icon"
              onClick={onDuplicate}
              disabled={working}
              aria-label={`Duplicar el menú del ${long}`}
              title="Duplicar"
            >
              <IconDuplicate />
            </AlmanacButton>
            <AlmanacButton
              variant="icon"
              onClick={onAskDelete}
              aria-label={`Eliminar el menú del ${long}`}
              title="Eliminar"
            >
              <IconDelete />
            </AlmanacButton>
          </Box>
        )}
      </Box>
    </Box>
  )
}

/* ── Estados ────────────────────────────────────────────────────────────── */

/** La hoja en blanco: nadie ha arrancado nada todavía. */
function BlankLeaf() {
  return (
    <Box
      sx={{
        bgcolor: ALM.paper,
        color: ALM.ink,
        px: 3,
        py: { xs: 5, md: 6 },
        textAlign: 'center',
        boxShadow: SHEET_SHADOW,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', color: ALM.inkFaint, mb: 2 }}>
        <IconEmptyPlate size={40} />
      </Box>
      <Box
        component="p"
        sx={{
          font: `400 1.05rem/1 ${ALM_FONT.figure}`,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Ninguna hoja arrancada
      </Box>
      <Box
        component="p"
        sx={{
          mt: 1.5,
          mx: 'auto',
          maxWidth: '46ch',
          font: `400 0.95rem/1.55 ${ALM_FONT.text}`,
          color: ALM.inkMuted,
        }}
      >
        Armá el menú de hoy con el botón de arriba: el primero llega con los platillos y
        precios de siempre, listos para ajustar. Cuando lo compartás, esta hoja queda
        guardada aquí.
      </Box>
    </Box>
  )
}

function LeafSkeleton() {
  return (
    <Box sx={{ position: 'relative', mt: '13px', bgcolor: ALM.paper, px: 2.5, py: 2 }}>
      <Skeleton variant="rectangular" width="45%" height={20} sx={{ bgcolor: ALM.paperShade }} />
      <Skeleton
        variant="rectangular"
        width="28%"
        height={12}
        sx={{ bgcolor: ALM.paperShade, mt: 1.25 }}
      />
    </Box>
  )
}

/** Fe de erratas: la banda con que un impreso reconoce su propio error. */
function Errata({ children }: { children: string }) {
  return (
    <Box
      role="alert"
      sx={{
        mt: 2,
        bgcolor: ALM.paper,
        // Regla arriba y no franja al canto: una fe de erratas se anuncia con
        // un filete sobre el texto, como cualquier corrección impresa.
        borderTop: `3px solid ${ALM.red}`,
        px: 2,
        py: 1.5,
        font: `500 0.9rem/1.45 ${ALM_FONT.text}`,
        color: ALM.ink,
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'block',
          font: `400 0.68rem/1 ${ALM_FONT.figure}`,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: ALM.red,
          mb: 0.75,
        }}
      >
        Fe de erratas
      </Box>
      {children}
    </Box>
  )
}

/* ── Agrupación ─────────────────────────────────────────────────────────── */

interface MonthGroup {
  key: string
  label: string
  items: MenuSummary[]
}

/**
 * Las hojas arrancadas se guardan por mes, que es como se guardan de verdad.
 * La clave es `YYYY-MM` y no el nombre del mes: agrupar por una cadena que
 * depende del idioma junta enero de dos años distintos.
 */
function groupByMonth(summaries: readonly MenuSummary[]): MonthGroup[] {
  const groups: MonthGroup[] = []
  for (const summary of summaries) {
    const key = monthKey(summary.date)
    const current = groups.at(-1)
    if (current?.key === key) current.items.push(summary)
    else groups.push({ key, label: formatMonthYear(summary.date), items: [summary] })
  }
  return groups
}
