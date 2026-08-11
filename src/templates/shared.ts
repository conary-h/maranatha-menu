import type { ImageMap } from '@/hooks/useMenuImages'
import { focalPosition } from '@/lib/image'
import type { ResolvedImage } from '@/lib/imageStore'
import { allowsDescription, allowsFeatured } from '@/lib/menuOps'
import { effectivePrice, formatPrice } from '@/lib/validation'
import type { BusinessInfo, Dish, Menu, MenuSection } from '@/types/menu'

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
    // Cubre además los menús guardados antes de la regla, que pueden tener un
    // complemento marcado como especial.
    if (!allowsFeatured(section)) continue
    const dish = section.dishes.find((candidate) => candidate.featured)
    if (dish) return { dish, section }
  }
  return undefined
}

/**
 * El versículo que va al pie.
 *
 * Manda el del menú, que es el que la familia escribió para ese día. Solo cuando
 * el campo no existe —los menús guardados antes de que se agregara— se hereda el
 * de Ajustes, para que ninguno pierda el suyo; borrarlo a mano deja el campo en
 * blanco, y eso sí significa «este menú sale sin versículo».
 *
 * La referencia acompaña al texto que ganó: mezclar el texto de uno con la cita
 * del otro sería atribuir mal el versículo.
 */
export function printableVerse(
  menu: Menu,
  business: BusinessInfo,
): { text: string; ref: string } | undefined {
  if (menu.verseText !== undefined) {
    const own = menu.verseText.trim()
    return own ? { text: own, ref: menu.verseRef?.trim() ?? '' } : undefined
  }
  const inherited = business.verseText.trim()
  return inherited ? { text: inherited, ref: business.verseRef.trim() } : undefined
}

/** Sections that actually have something to print. */
export function printableSections(menu: Menu): MenuSection[] {
  return menu.sections.filter((section) => section.dishes.length > 0)
}

/**
 * La descripción que debe imprimirse, si la sección admite una.
 *
 * Los complementos se imprimen como etiquetas y nunca llevan descripción; el
 * editor ya no la ofrece, y esto además cubre los menús guardados antes del
 * cambio, que pueden conservar una en los datos.
 */
export function printableDescription(dish: Dish, section: MenuSection): string | undefined {
  return allowsDescription(section) ? dish.description : undefined
}
