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

/**
 * Si en una sección de precio único hay platillos con precio propio.
 *
 * Un precio igual al de la sección no cuenta: lo que importa es si el «c/u» del
 * encabezado sigue siendo verdad para toda la lista.
 */
export function hasPriceOverrides(section: MenuSection): boolean {
  if (section.priceMode !== 'flat') return false
  return section.dishes.some((dish) => dish.price !== undefined && dish.price !== section.flatPrice)
}

/** The section-level price badge: "Incluidos" or "L. 28 c/u". */
export function sectionBadge(section: MenuSection, currency: string): string | undefined {
  if (section.priceMode === 'included') return 'Incluidos'
  if (section.priceMode === 'flat' && section.flatPrice !== undefined) {
    // Con precios distintos en la lista, un «L. 28 c/u» en el encabezado sería
    // falso: ahí cada platillo imprime el suyo y el rótulo sobra.
    return hasPriceOverrides(section) ? undefined : `${formatPrice(section.flatPrice, currency)} c/u`
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

/**
 * Los platillos más caros de una lista, que se imprimen en el color de acento.
 *
 * Solo en las secciones que cobran platillo por platillo. En los refrescos el
 * precio no es un argumento de venta —son diez bebidas que valen casi lo mismo—
 * y pintar la más cara solo la señalaría sin razón.
 *
 * Se calcula sobre los platillos que de verdad se van a imprimir, no sobre la
 * sección entera: si el especial del día es el más caro, ya tiene su tarjeta
 * arriba y el acento debe recaer en el más caro de los que quedan.
 *
 * Con un solo precio en la lista no se destaca nada: pintar de acento cuatro
 * platillos que cuestan lo mismo no distingue a ninguno.
 */
export function topPricedIds(
  dishes: readonly Dish[],
  section: MenuSection,
): ReadonlySet<string> {
  if (section.priceMode !== 'per-item') return new Set()

  const priced = dishes
    .map((dish) => ({ id: dish.id, price: effectivePrice(dish, section) }))
    .filter((entry): entry is { id: string; price: number } => entry.price !== undefined)

  const distinct = new Set(priced.map((entry) => entry.price))
  if (distinct.size < 2) return new Set()

  const top = Math.max(...distinct)
  return new Set(priced.filter((entry) => entry.price === top).map((entry) => entry.id))
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
