import type { FormatId } from '@/types/menu'
import type { MenuFormat } from './types'

/** 1080px wide is the native upload width for every platform they post to. */
export const FORMATS: Record<FormatId, MenuFormat> = {
  story: {
    id: 'story',
    label: 'Estado 9:16',
    width: 1080,
    height: 1920,
    hint: 'Estados de WhatsApp e Instagram Stories',
  },
  post: {
    id: 'post',
    label: 'Publicación 4:5',
    width: 1080,
    height: 1350,
    hint: 'Feed de Instagram y Facebook',
  },
  square: {
    id: 'square',
    label: 'Cuadrado 1:1',
    width: 1080,
    height: 1080,
    hint: 'Mensajes directos de WhatsApp',
  },
}

export const FORMAT_LIST: readonly MenuFormat[] = [FORMATS.story, FORMATS.post, FORMATS.square]
