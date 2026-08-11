import type { FormatId } from '@/types/menu'
import type { MenuFormat } from './types'

/**
 * 1080px wide is the native upload width for every platform they post to.
 *
 * Hoy solo se publica en 9:16, que es donde el menú se lee de un vistazo y sin
 * abrir nada: el estado de WhatsApp. Los formatos 4:5 y 1:1 se retiraron —el
 * registro admite más de uno y el selector reaparece solo si vuelve a haberlos.
 */
export const FORMATS: Record<FormatId, MenuFormat> = {
  story: {
    id: 'story',
    label: 'Estado 9:16',
    width: 1080,
    height: 1920,
    hint: 'Estados de WhatsApp e Instagram Stories',
  },
}

export const FORMAT_LIST: readonly MenuFormat[] = [FORMATS.story]
