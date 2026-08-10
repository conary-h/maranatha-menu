import type { ImageMap } from '@/hooks/useMenuImages'
import { focalPosition } from '@/lib/image'
import type { ResolvedImage } from '@/lib/imageStore'
import { effectivePrice, formatPrice } from '@/lib/validation'
import type { Dish, Menu, MenuSection } from '@/types/menu'

/** Helpers every template needs; deliberately layout-free. */

export function photoOf(dish: Dish, images: ImageMap): ResolvedImage | undefined {
  return dish.imageId ? images.get(dish.imageId) : undefined
}

export function photoStyle(image: ResolvedImage): { objectPosition: string } {
  return { objectPosition: focalPosition(image) }
}

export function priceLabel(
  dish: Dish,
  section: MenuSection,
  currency: string,
): string | undefined {
  const price = effectivePrice(dish, section)
  return price === undefined ? undefined : formatPrice(price, currency)
}

/** The section-level price badge: "Incluidos" or "L. 28 c/u". */
export function sectionBadge(section: MenuSection, currency: string): string | undefined {
  if (section.priceMode === 'included') return 'Incluidos'
  if (section.priceMode === 'flat' && section.flatPrice !== undefined) {
    return `${formatPrice(section.flatPrice, currency)} c/u`
  }
  return undefined
}

/** The single highlighted dish, if the user marked one. */
export function featuredOf(menu: Menu): { dish: Dish; section: MenuSection } | undefined {
  for (const section of menu.sections) {
    const dish = section.dishes.find((candidate) => candidate.featured)
    if (dish) return { dish, section }
  }
  return undefined
}

/** Sections that actually have something to print. */
export function printableSections(menu: Menu): MenuSection[] {
  return menu.sections.filter((section) => section.dishes.length > 0)
}
