import { createId } from '@/lib/id'
import { todayIso } from '@/lib/date'
import type { BusinessInfo, Dish, Menu, MenuSection, PriceMode } from '@/types/menu'

/** Transcribed from the business's current printed menu (img/menu-old.jpg). */
export const DEFAULT_BUSINESS: BusinessInfo = {
  name: 'Comida Buffet Maranatha',
  phone: '+504 3212-3576',
  currency: 'L.',
  verseRef: 'Efesios 1:20',
  verseText:
    'la cual operó en Cristo, resucitándole de los muertos y sentándole a su diestra en los lugares celestiales.',
  footerNote: 'Todos los almuerzos incluyen complementos a elección.',
}

export function createDish(name = '', price?: number): Dish {
  return { id: createId('d'), name, ...(price === undefined ? {} : { price }) }
}

export function createSection(title = 'Nueva sección', priceMode: PriceMode = 'per-item'): MenuSection {
  return { id: createId('s'), title, priceMode, dishes: [] }
}

export function createMenu(date = todayIso()): Menu {
  const now = Date.now()
  return {
    id: createId('m'),
    date,
    title: 'Menú del día',
    templateId: 'classic',
    formatId: 'story',
    createdAt: now,
    updatedAt: now,
    sections: [
      { ...createSection('Carnes', 'per-item') },
      {
        ...createSection('Complementos', 'included'),
        note: 'Incluidos con todos los almuerzos',
      },
      { ...createSection('Refrescos', 'flat'), flatPrice: 28 },
    ],
  }
}

/**
 * The business's usual offering, pre-loaded so the first menu is a few edits
 * away instead of a blank page. Straight from img/menu-old.jpg.
 */
export function createStarterMenu(date = todayIso()): Menu {
  const menu = createMenu(date)
  const [carnes, complementos, refrescos] = menu.sections
  if (!carnes || !complementos || !refrescos) return menu

  carnes.dishes = [
    { ...createDish('Sopa de caracol', 180), featured: true },
    createDish('Pollo al horno', 130),
    createDish('Lomo de res con chimichurri', 130),
    createDish('Cordon bleu', 130),
    createDish('Costilla de cerdo frita', 130),
    createDish('Pollo guisado', 110),
  ]

  complementos.dishes = [
    'Arroz blanco',
    'Arroz con pollo',
    'Frijoles',
    'Plátano frito',
    'Vegetales salteados',
    'Mac and cheese',
    'Papas rostizadas',
    'Ensalada de lechuga',
  ].map((name) => createDish(name))

  refrescos.dishes = [
    'Pepsi',
    'Coca cola',
    'Canada dry',
    'Jamaica',
    'Maracuyá',
    'Tamarindo',
    'Horchata',
    'Té frío',
    'Nance',
    'Limonada',
  ].map((name) => createDish(name))

  return menu
}

/** A deep copy with fresh ids, today's date and reset timestamps. */
export function duplicateMenu(source: Menu, date = todayIso()): Menu {
  const now = Date.now()
  return {
    ...source,
    id: createId('m'),
    date,
    createdAt: now,
    updatedAt: now,
    sections: source.sections.map((section) => ({
      ...section,
      id: createId('s'),
      // Photos are shared by reference on purpose: duplicating costs no storage.
      dishes: section.dishes.map((dish) => ({ ...dish, id: createId('d') })),
    })),
  }
}
