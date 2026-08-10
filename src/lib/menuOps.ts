import type { Dish, Menu, MenuSection } from '@/types/menu'

/**
 * Pure transformations on a menu. Keeping them out of components means the
 * editor hook stays small and every rule (ordering, price-mode clean-up) lives
 * in one readable place.
 */

export function touch(menu: Menu): Menu {
  return { ...menu, updatedAt: Date.now() }
}

function mapSections(menu: Menu, map: (section: MenuSection) => MenuSection): Menu {
  return touch({ ...menu, sections: menu.sections.map(map) })
}

function inSection(menu: Menu, sectionId: string, map: (section: MenuSection) => MenuSection): Menu {
  return mapSections(menu, (section) => (section.id === sectionId ? map(section) : section))
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items]
  }
  const next = [...items]
  const [moved] = next.splice(from, 1)
  if (moved !== undefined) next.splice(to, 0, moved)
  return next
}

/* -------------------------------- sections -------------------------------- */

export function addSection(menu: Menu, section: MenuSection): Menu {
  return touch({ ...menu, sections: [...menu.sections, section] })
}

export function removeSection(menu: Menu, sectionId: string): Menu {
  return touch({ ...menu, sections: menu.sections.filter((section) => section.id !== sectionId) })
}

export function moveSection(menu: Menu, from: number, to: number): Menu {
  return touch({ ...menu, sections: moveItem(menu.sections, from, to) })
}

/**
 * Whether a section's dishes can carry a description.
 *
 * Los complementos no la llevan: son una lista de acompañamientos que se
 * imprime como etiquetas ("Arroz blanco", "Frijoles"), sin espacio ni razón
 * para una frase debajo de cada uno.
 */
export function allowsDescription(section: Pick<MenuSection, 'priceMode'>): boolean {
  return section.priceMode !== 'included'
}

/**
 * Whether a dish in this section can be the day's highlight.
 *
 * Solo los platillos con precio propio. Un complemento va incluido con el
 * almuerzo y un refresco cuesta lo mismo que los otros nueve: ninguno de los
 * dos es algo que se anuncie como el especial del día.
 */
export function allowsFeatured(section: Pick<MenuSection, 'priceMode'>): boolean {
  return section.priceMode === 'per-item'
}

/**
 * Switching how a section is priced also cleans up the values that no longer
 * apply, so a section can never silently keep stale prices, descriptions or
 * highlights that would reappear if the user switched back and exported.
 */
export function updateSection(menu: Menu, sectionId: string, patch: Partial<MenuSection>): Menu {
  return inSection(menu, sectionId, (section) => {
    const next: MenuSection = { ...section, ...patch }
    if (next.priceMode !== 'flat') delete next.flatPrice
    if (next.priceMode !== 'per-item') {
      next.dishes = next.dishes.map(({ price: _price, ...dish }) => dish)
    }
    if (!allowsDescription(next)) {
      next.dishes = next.dishes.map(({ description: _description, ...dish }) => dish)
    }
    if (!allowsFeatured(next)) {
      next.dishes = next.dishes.map(({ featured: _featured, ...dish }) => dish)
    }
    return next
  })
}

/* --------------------------------- dishes --------------------------------- */

export function addDish(menu: Menu, sectionId: string, dish: Dish): Menu {
  return inSection(menu, sectionId, (section) => ({ ...section, dishes: [...section.dishes, dish] }))
}

export function updateDish(
  menu: Menu,
  sectionId: string,
  dishId: string,
  patch: Partial<Dish>,
): Menu {
  return inSection(menu, sectionId, (section) => ({
    ...section,
    dishes: section.dishes.map((dish) => (dish.id === dishId ? { ...dish, ...patch } : dish)),
  }))
}

export function removeDish(menu: Menu, sectionId: string, dishId: string): Menu {
  return inSection(menu, sectionId, (section) => ({
    ...section,
    dishes: section.dishes.filter((dish) => dish.id !== dishId),
  }))
}

export function moveDish(menu: Menu, sectionId: string, from: number, to: number): Menu {
  return inSection(menu, sectionId, (section) => ({
    ...section,
    dishes: moveItem(section.dishes, from, to),
  }))
}

/** Only one dish can be the day's highlight — setting one clears the others. */
export function setFeaturedDish(menu: Menu, sectionId: string, dishId: string, featured: boolean): Menu {
  return mapSections(menu, (section) => ({
    ...section,
    dishes: section.dishes.map((dish) => {
      if (dish.id === dishId && section.id === sectionId) return { ...dish, featured }
      if (!featured || !dish.featured) return dish
      const { featured: _wasFeatured, ...rest } = dish
      return rest
    }),
  }))
}

