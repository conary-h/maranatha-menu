/**
 * Domain model.
 *
 * The old printed menu (img/menu-old.jpg) is not a flat list of dishes: it is a
 * set of *sections* that price their items differently — "Carnes" prices every
 * dish, "Complementos" are included with the meal and show no price at all, and
 * "Refrescos" are all L.28. Modelling that explicitly is what keeps the printed
 * output honest, so `priceMode` lives on the section rather than on each dish.
 *
 * Ordering is the array index, not an `order: number` field. An integer field
 * has to be renormalised after every insert/remove/reorder and can silently go
 * inconsistent (duplicates, gaps); an array cannot.
 */

export const TEMPLATE_IDS = [
  'classic',
  'modern',
  'social',
  'jade',
  'marina',
  'menta',
] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

export const FORMAT_IDS = ['story', 'post', 'square'] as const
export type FormatId = (typeof FORMAT_IDS)[number]

/** How a section assigns prices to its dishes. */
export type PriceMode =
  /** Every dish carries its own price. */
  | 'per-item'
  /** Nothing is priced — the section is included with the meal (Complementos). */
  | 'included'
  /** One price applies to every dish in the section (Refrescos, L.28). */
  | 'flat'

export interface Dish {
  id: string
  name: string
  description?: string
  /** Only meaningful when the parent section is `per-item`. Lempiras. */
  price?: number
  /** Key into the `images` object store. */
  imageId?: string
  /** Renders larger / accented in the templates — e.g. the daily special. */
  featured?: boolean
}

export interface MenuSection {
  id: string
  title: string
  priceMode: PriceMode
  /** Only meaningful when `priceMode === 'flat'`. Lempiras. */
  flatPrice?: number
  /** Small line under the title, e.g. "Incluidos con todos los almuerzos". */
  note?: string
  dishes: Dish[]
}

export interface Menu {
  id: string
  /** Local calendar date, `YYYY-MM-DD`. Never a Date — timezones would shift it. */
  date: string
  title: string
  sections: MenuSection[]
  templateId: TemplateId
  formatId: FormatId
  createdAt: number
  updatedAt: number
}

/** Stored once and reused by every menu. */
export interface BusinessInfo {
  name: string
  phone: string
  /** Currency prefix shown before every amount. */
  currency: string
  verseRef: string
  verseText: string
  footerNote: string
}

/**
 * Uploaded photo. Stored resized-but-not-cropped so the crop stays a purely
 * presentational decision: templates cover-crop with `object-position`, and the
 * user can re-frame at any time without needing the original file back.
 */
export interface StoredImage {
  id: string
  blob: Blob
  width: number
  height: number
  /** Focal point in 0..1, used as `object-position`. Defaults to dead centre. */
  focalX: number
  focalY: number
}

export type MenuSummary = Pick<Menu, 'id' | 'date' | 'title' | 'templateId' | 'updatedAt'> & {
  dishCount: number
}
