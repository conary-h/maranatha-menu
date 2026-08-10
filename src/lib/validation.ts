import { isValidIsoDate } from '@/lib/date'
import {
  FORMAT_IDS,
  TEMPLATE_IDS,
  type BusinessInfo,
  type Dish,
  type Menu,
  type MenuSection,
  type PriceMode,
} from '@/types/menu'

export const LIMITS = {
  dishName: 60,
  dishDescription: 120,
  sectionTitle: 32,
  sectionNote: 80,
  menuTitle: 40,
  maxPrice: 99_999,
  maxSections: 12,
  maxDishesPerSection: 40,
} as const

export class ValidationError extends Error {
  override readonly name = 'ValidationError'
}

/* -------------------------------------------------------------------------- */
/* Field-level checks — used by the editor to show inline messages.            */
/* -------------------------------------------------------------------------- */

export function validateDishName(value: string): string | undefined {
  if (value.trim().length === 0) return 'Escribe el nombre del platillo.'
  if (value.length > LIMITS.dishName) return `Máximo ${LIMITS.dishName} caracteres.`
  return undefined
}

export function validatePrice(value: string, required: boolean): string | undefined {
  const trimmed = value.trim()
  if (trimmed.length === 0) return required ? 'Escribe el precio.' : undefined
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(trimmed)) return 'Usa solo números, por ejemplo 130.'
  const parsed = parsePrice(trimmed)
  if (parsed === undefined || parsed < 0 || parsed > LIMITS.maxPrice) return 'Precio fuera de rango.'
  return undefined
}

export function parsePrice(value: string): number | undefined {
  const trimmed = value.trim().replace(',', '.')
  if (trimmed.length === 0) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > LIMITS.maxPrice) return undefined
  return Math.round(parsed * 100) / 100
}

export function formatPrice(value: number, currency: string): string {
  const amount = Number.isInteger(value) ? `${value}` : value.toFixed(2)
  return `${currency} ${amount}`
}

/** The price a dish actually shows, given how its section is priced. */
export function effectivePrice(dish: Dish, section: MenuSection): number | undefined {
  switch (section.priceMode) {
    case 'per-item':
      return dish.price
    case 'flat':
      return section.flatPrice
    case 'included':
      return undefined
  }
}

/* -------------------------------------------------------------------------- */
/* Whole-menu validation — the last gate before anything is persisted.         */
/* -------------------------------------------------------------------------- */

export function assertValidMenu(menu: Menu): void {
  if (!isMenu(menu)) throw new ValidationError('El menú tiene un formato inválido y no se guardó.')
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isText = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max

const isOptionalText = (value: unknown, max: number): boolean =>
  value === undefined || isText(value, max)

const isOptionalPrice = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= LIMITS.maxPrice)

const PRICE_MODES: readonly PriceMode[] = ['per-item', 'included', 'flat']

function isDish(value: unknown): value is Dish {
  if (!isRecord(value)) return false
  return (
    isText(value.id, 64) &&
    isText(value.name, LIMITS.dishName) &&
    isOptionalText(value.description, LIMITS.dishDescription) &&
    isOptionalPrice(value.price) &&
    isOptionalText(value.imageId, 64) &&
    (value.featured === undefined || typeof value.featured === 'boolean')
  )
}

function isSection(value: unknown): value is MenuSection {
  if (!isRecord(value)) return false
  return (
    isText(value.id, 64) &&
    isText(value.title, LIMITS.sectionTitle) &&
    PRICE_MODES.includes(value.priceMode as PriceMode) &&
    isOptionalPrice(value.flatPrice) &&
    isOptionalText(value.note, LIMITS.sectionNote) &&
    Array.isArray(value.dishes) &&
    value.dishes.length <= LIMITS.maxDishesPerSection &&
    value.dishes.every(isDish)
  )
}

/**
 * Full structural check. Also used on restored backup files, which are ordinary
 * user-supplied JSON and must never be trusted straight into the database.
 */
export function isMenu(value: unknown): value is Menu {
  if (!isRecord(value)) return false
  return (
    isText(value.id, 64) &&
    typeof value.date === 'string' &&
    isValidIsoDate(value.date) &&
    isText(value.title, LIMITS.menuTitle) &&
    TEMPLATE_IDS.includes(value.templateId as Menu['templateId']) &&
    FORMAT_IDS.includes(value.formatId as Menu['formatId']) &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    Array.isArray(value.sections) &&
    value.sections.length <= LIMITS.maxSections &&
    value.sections.every(isSection)
  )
}

export function isBusinessInfo(value: unknown): value is BusinessInfo {
  if (!isRecord(value)) return false
  return (
    isText(value.name, 80) &&
    isText(value.phone, 32) &&
    isText(value.currency, 8) &&
    isText(value.verseRef, 60) &&
    isText(value.verseText, 400) &&
    isText(value.footerNote, 200)
  )
}

/** A menu with nothing in it exports as an empty card — worth warning about. */
export function countDishes(menu: Menu): number {
  return menu.sections.reduce((total, section) => total + section.dishes.length, 0)
}

