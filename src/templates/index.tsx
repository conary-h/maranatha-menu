import type { TemplateId } from '@/types/menu'
import { MenuLayout } from './MenuLayout'
import { PALETTES } from './palettes'
import type { TemplateDefinition, TemplateProps } from './types'

/**
 * Registro de plantillas.
 *
 * Hoy las tres comparten la misma maquetación (`MenuLayout`) y solo cambian de
 * paleta, que es lo que las hace fáciles de mantener: una corrección al diseño
 * impreso vale para las tres a la vez.
 *
 * La estructura sigue siendo la de antes: `Component` admite cualquier
 * componente que reciba `TemplateProps`, así que una plantilla con una forma
 * realmente distinta se añade sin tocar el editor ni esta forma de registrarlas.
 */
function withPalette(id: TemplateId) {
  const palette = PALETTES[id]
  return function TemplateComponent(props: TemplateProps) {
    return <MenuLayout {...props} palette={palette} />
  }
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Clásica',
    description: 'Papel crema y rojo del logotipo. Elegante y muy legible.',
    swatch: ['#fff5e6', '#be1a0d'],
    Component: withPalette('classic'),
  },
  modern: {
    id: 'modern',
    name: 'Moderna',
    description: 'La misma página en oscuro, con acentos ámbar.',
    swatch: ['#17110a', '#f7c24b'],
    Component: withPalette('modern'),
  },
  social: {
    id: 'social',
    name: 'Redes',
    description: 'Naranja de marca y texto blanco: máximo contraste para el feed.',
    swatch: ['#e08a1e', '#a51708'],
    Component: withPalette('social'),
  },
}

export const TEMPLATE_LIST: readonly TemplateDefinition[] = [
  TEMPLATES.classic,
  TEMPLATES.modern,
  TEMPLATES.social,
]

export * from './formats'
export type { MenuFormat, TemplateDefinition, TemplateProps } from './types'
