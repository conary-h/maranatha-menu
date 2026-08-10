import type { TemplateId } from '@/types/menu'
import { ClassicTemplate } from './ClassicTemplate'
import { ModernTemplate } from './ModernTemplate'
import { SocialTemplate } from './SocialTemplate'
import type { TemplateDefinition } from './types'

/**
 * The template registry. Adding a design is: one component file, one entry
 * here, one id in `TEMPLATE_IDS`. The editor never changes.
 */
export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Clásica',
    description: 'Elegante y clara, con precios fáciles de leer.',
    swatch: ['#fff5e6', '#be1a0d'],
    Component: ClassicTemplate,
  },
  modern: {
    id: 'modern',
    name: 'Moderna',
    description: 'Fondo oscuro y las fotos como protagonistas.',
    swatch: ['#17110a', '#f7c24b'],
    Component: ModernTemplate,
  },
  social: {
    id: 'social',
    name: 'Redes',
    description: 'Letras grandes, pensada para WhatsApp e Instagram.',
    swatch: ['#e8951f', '#be1a0d'],
    Component: SocialTemplate,
  },
}

export const TEMPLATE_LIST: readonly TemplateDefinition[] = [
  TEMPLATES.classic,
  TEMPLATES.modern,
  TEMPLATES.social,
]

export * from './formats'
export type { MenuFormat, TemplateDefinition, TemplateProps } from './types'
