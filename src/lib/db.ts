import { type DBSchema, type IDBPDatabase, openDB } from 'idb'
import { DEFAULT_BUSINESS } from '@/lib/defaults'
import { normalise as normaliseName } from '@/lib/dishCatalog'
import { type MenuRepository, StorageError } from '@/lib/repository'
import { assertValidMenu } from '@/lib/validation'
import {
  type BusinessInfo,
  liveFormatId,
  liveTemplateId,
  type Menu,
  type MenuSummary,
  type StoredImage,
} from '@/types/menu'

const DB_NAME = 'maranatha-menu'
const DB_VERSION = 1
const BUSINESS_KEY = 'business'

interface MaranathaDB extends DBSchema {
  menus: {
    key: string
    value: Menu
    indexes: { 'by-date': string }
  }
  images: {
    key: string
    value: StoredImage
  }
  settings: {
    key: string
    value: BusinessInfo
  }
}

let dbPromise: Promise<IDBPDatabase<MaranathaDB>> | undefined

function getDB(): Promise<IDBPDatabase<MaranathaDB>> {
  dbPromise ??= openDB<MaranathaDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const menus = db.createObjectStore('menus', { keyPath: 'id' })
      menus.createIndex('by-date', 'date')
      db.createObjectStore('images', { keyPath: 'id' })
      db.createObjectStore('settings')
    },
    blocked() {
      // Another tab is holding an older version open.
      console.warn('[db] upgrade blocked by another open tab')
    },
  }).catch((cause: unknown) => {
    dbPromise = undefined
    throw new StorageError(
      'No se pudo abrir el almacenamiento del navegador. Si estás en modo privado, intenta en una ventana normal.',
      cause,
    )
  })
  return dbPromise
}

async function guard<T>(what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (cause) {
    if (cause instanceof StorageError) throw cause
    if (cause instanceof DOMException && cause.name === 'QuotaExceededError') {
      throw new StorageError(
        'Se llenó el espacio del navegador. Borra menús antiguos o usa fotos más pequeñas.',
        cause,
      )
    }
    throw new StorageError(what, cause)
  }
}

/**
 * Traduce al presente lo que quedó guardado.
 *
 * Repara la plantilla y el formato: quitar una paleta o un tamaño del catálogo
 * no puede dejar un menú antiguo sin diseño ni sin lienzo con el que dibujarse.
 * Se aplica en la lectura, así que el resto de la aplicación siempre recibe un
 * menú válido.
 */
function migrate(menu: Menu): Menu {
  const templateId = liveTemplateId(menu.templateId)
  const formatId = liveFormatId(menu.formatId)
  if (templateId === menu.templateId && formatId === menu.formatId) return menu
  return { ...menu, templateId, formatId }
}

function summarise(menu: Menu): MenuSummary {
  return {
    id: menu.id,
    date: menu.date,
    title: menu.title,
    templateId: liveTemplateId(menu.templateId),
    updatedAt: menu.updatedAt,
    dishCount: menu.sections.reduce((total, section) => total + section.dishes.length, 0),
  }
}

/** Ids of every image referenced by any stored menu. */
function collectImageIds(menus: readonly Menu[]): Set<string> {
  const ids = new Set<string>()
  for (const menu of menus) {
    for (const section of menu.sections) {
      for (const dish of section.dishes) {
        if (dish.imageId) ids.add(dish.imageId)
      }
    }
  }
  return ids
}

/**
 * Photos are shared by reference, so duplicating a menu is free — but that also
 * means no single menu "owns" a photo. Instead of reference counting (which
 * drifts), we sweep for unreachable images after any write that can orphan one.
 */
async function collectGarbage(db: IDBPDatabase<MaranathaDB>): Promise<void> {
  const [menus, imageIds] = await Promise.all([db.getAll('menus'), db.getAllKeys('images')])
  const reachable = collectImageIds(menus)
  const orphans = imageIds.filter((id) => !reachable.has(id))
  if (orphans.length === 0) return
  const tx = db.transaction('images', 'readwrite')
  await Promise.all([...orphans.map((id) => tx.store.delete(id)), tx.done])
}

export const indexedDbRepository: MenuRepository = {
  async listMenus() {
    return guard('No se pudieron cargar los menús.', async () => {
      const db = await getDB()
      const menus = await db.getAllFromIndex('menus', 'by-date')
      return menus.map(summarise).reverse() // newest date first
    })
  },

  async getMenu(id) {
    return guard('No se pudo cargar el menú.', async () => {
      const menu = await (await getDB()).get('menus', id)
      return menu && migrate(menu)
    })
  },

  async saveMenu(menu) {
    assertValidMenu(menu)
    return guard('No se pudo guardar el menú.', async () => {
      const db = await getDB()
      await db.put('menus', menu)
      await collectGarbage(db)
    })
  },

  async deleteMenu(id) {
    return guard('No se pudo eliminar el menú.', async () => {
      const db = await getDB()
      await db.delete('menus', id)
      await collectGarbage(db)
    })
  },

  async getImage(id) {
    return guard('No se pudo cargar la fotografía.', async () => (await getDB()).get('images', id))
  },

  async putImage(image) {
    return guard('No se pudo guardar la fotografía.', async () => {
      await (await getDB()).put('images', image)
    })
  },

  async getBusiness() {
    return guard('No se pudo cargar la información del negocio.', async () => {
      const stored = await (await getDB()).get('settings', BUSINESS_KEY)
      return { ...DEFAULT_BUSINESS, ...stored }
    })
  },

  async saveBusiness(info) {
    return guard('No se pudo guardar la información del negocio.', async () => {
      await (await getDB()).put('settings', info, BUSINESS_KEY)
    })
  },
}

/**
 * Every dish name ever saved, with how often it was used.
 *
 * Feeds the autocomplete. Reads the menu store only — never the image blobs —
 * so it stays cheap enough to run once when the editor opens.
 */
export async function collectDishNameCounts(): Promise<Map<string, { display: string; count: number }>> {
  return guard('No se pudieron cargar las sugerencias.', async () => {
    const menus = await (await getDB()).getAll('menus')
    const counts = new Map<string, { display: string; count: number }>()
    for (const menu of menus) {
      for (const section of menu.sections) {
        for (const dish of section.dishes) {
          const name = dish.name.trim()
          if (!name) continue
          const key = normaliseName(name)
          const existing = counts.get(key)
          if (existing) existing.count += 1
          else counts.set(key, { display: name, count: 1 })
        }
      }
    }
    return counts
  })
}

/** Used by the backup/restore feature — deliberately outside the repository API. */
export async function readAll(): Promise<{ menus: Menu[]; business: BusinessInfo; images: StoredImage[] }> {
  return guard('No se pudo leer la copia de seguridad.', async () => {
    const db = await getDB()
    const [menus, images, stored] = await Promise.all([
      db.getAll('menus'),
      db.getAll('images'),
      db.get('settings', BUSINESS_KEY),
    ])
    return { menus: menus.map(migrate), images, business: { ...DEFAULT_BUSINESS, ...stored } }
  })
}

export async function writeAll(data: {
  menus: Menu[]
  business: BusinessInfo
  images: StoredImage[]
}): Promise<void> {
  for (const menu of data.menus) assertValidMenu(menu)
  return guard('No se pudo restaurar la copia de seguridad.', async () => {
    const db = await getDB()
    const tx = db.transaction(['menus', 'images', 'settings'], 'readwrite')
    await Promise.all([
      ...data.menus.map((menu) => tx.objectStore('menus').put(menu)),
      ...data.images.map((image) => tx.objectStore('images').put(image)),
      tx.objectStore('settings').put(data.business, BUSINESS_KEY),
      tx.done,
    ])
    await collectGarbage(db)
  })
}
