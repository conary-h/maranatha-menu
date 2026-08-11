import type { TemplateId } from '@/types/menu'
import { MenuLayout } from './MenuLayout'
import { PALETTES } from './palettes'
import type { TemplateDefinition, TemplateProps } from './types'

/**
 * Registro de plantillas.
 *
 * Hoy todas comparten la misma maquetación (`MenuLayout`) y solo cambian de
 * paleta, que es lo que las hace fáciles de mantener: una corrección al diseño
 * impreso vale para todas a la vez.
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
  jade: {
    id: 'jade',
    name: 'Jade',
    description: 'Verde bosque con detalles en oro. Sobria y cálida.',
    swatch: ['#0b2019', '#efc463'],
    Component: withPalette('jade'),
  },
  marina: {
    id: 'marina',
    name: 'Marina',
    description: 'Azul noche y celeste. Fría y muy legible.',
    swatch: ['#0a1e33', '#6cc6ec'],
    Component: withPalette('marina'),
  },
  menta: {
    id: 'menta',
    name: 'Menta',
    description: 'Verde claro y fresco, sobre papel casi blanco.',
    swatch: ['#e9f7ef', '#0e7a52'],
    Component: withPalette('menta'),
  },
  lavanda: {
    id: 'lavanda',
    name: 'Lavanda',
    description: 'Lila muy claro con violeta profundo. Serena y elegante.',
    swatch: ['#efe9ff', '#6b3fa0'],
    Component: withPalette('lavanda'),
  },
  frambuesa: {
    id: 'frambuesa',
    name: 'Frambuesa',
    description: 'Rosa pálido y frambuesa. Alegre, para postres y días de fiesta.',
    swatch: ['#ffe9ee', '#c8305e'],
    Component: withPalette('frambuesa'),
  },
  cacao: {
    id: 'cacao',
    name: 'Cacao',
    description: 'Chocolate y caramelo. Oscura, pero cálida y apetitosa.',
    swatch: ['#22140a', '#e9b872'],
    Component: withPalette('cacao'),
  },
}

export const TEMPLATE_LIST: readonly TemplateDefinition[] = [
  TEMPLATES.classic,
  TEMPLATES.modern,
  TEMPLATES.jade,
  TEMPLATES.marina,
  TEMPLATES.menta,
  TEMPLATES.lavanda,
  TEMPLATES.frambuesa,
  TEMPLATES.cacao,
]

export * from './formats'
export type { MenuFormat, TemplateDefinition, TemplateProps } from './types'
