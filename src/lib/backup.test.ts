import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createDish, createMenu } from './defaults'
import type { Menu } from '@/types/menu'

/**
 * Restaurar un respaldo es el único punto de la app que ingiere un archivo
 * escrito fuera de ella. Todo lo que entra por aquí es entrada no confiable:
 * si la validación falla, la basura acaba en la base de datos y en el menú
 * impreso. De ahí que estas pruebas insistan tanto en el rechazo.
 */

/** Un PNG de 1x1 real, para el camino feliz. */
const PNG_1X1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function freshModules() {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
  return { backup: await import('./backup'), db: await import('./db') }
}

let mod: Awaited<ReturnType<typeof freshModules>>

beforeEach(async () => {
  mod = await freshModules()
})

function menuFixture(date = '2026-08-10'): Menu {
  const menu = createMenu(date)
  menu.sections[0]!.dishes = [createDish('Pollo al horno', 130)]
  return menu
}

function fileOf(payload: unknown): File {
  return new File([JSON.stringify(payload)], 'respaldo.json', { type: 'application/json' })
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    format: 'maranatha-menu-backup',
    version: 1,
    exportedAt: '2026-08-10T00:00:00.000Z',
    business: {
      name: 'Maranatha',
      phone: '+504 3212-3576',
      currency: 'L.',
      verseRef: 'Efesios 1:20',
      verseText: 'texto',
      footerNote: 'nota',
    },
    menus: [menuFixture()],
    images: [],
    ...overrides,
  }
}

describe('restoreBackup — rechazos', () => {
  it('rechaza un archivo que no es JSON', async () => {
    const file = new File(['no soy json'], 'x.json', { type: 'application/json' })
    await expect(mod.backup.restoreBackup(file)).rejects.toThrow(/no es un respaldo válido/i)
  })

  it('rechaza un JSON que no es un respaldo de esta app', async () => {
    await expect(mod.backup.restoreBackup(fileOf({ hola: 'mundo' }))).rejects.toThrow(/Maranatha/i)
  })

  it('rechaza un respaldo de otra versión', async () => {
    const file = fileOf(validPayload({ version: 99 }))
    await expect(mod.backup.restoreBackup(file)).rejects.toThrow(/versión/i)
  })

  it('rechaza un respaldo sin ningún menú válido', async () => {
    const file = fileOf(validPayload({ menus: [{ id: 'x' }, null, 'menú'] }))
    await expect(mod.backup.restoreBackup(file)).rejects.toThrow(/no contiene menús/i)
  })

  it('rechaza un archivo demasiado grande sin llegar a analizarlo', async () => {
    const huge = new File([], 'grande.json')
    Object.defineProperty(huge, 'size', { value: 500 * 1024 * 1024 })
    await expect(mod.backup.restoreBackup(huge)).rejects.toThrow(/demasiado grande/i)
  })
})

describe('restoreBackup — filtrado', () => {
  it('descarta los menús corruptos y conserva los buenos', async () => {
    const file = fileOf(
      validPayload({ menus: [menuFixture('2026-08-10'), { id: 'roto' }, menuFixture('2026-08-11')] }),
    )
    const result = await mod.backup.restoreBackup(file)
    expect(result.menus).toBe(2)
    expect(await mod.db.indexedDbRepository.listMenus()).toHaveLength(2)
  })

  it('no acepta una URL de datos que no sea una imagen', async () => {
    // La guarda que impide meter `data:text/html` en la base como si fuera foto.
    const file = fileOf(
      validPayload({
        images: [
          { id: 'img_malo', dataUrl: 'data:text/html;base64,PHNjcmlwdD4=', width: 1, height: 1, focalX: 0.5, focalY: 0.5 },
          { id: 'img_remoto', dataUrl: 'https://ejemplo.com/foto.png', width: 1, height: 1, focalX: 0.5, focalY: 0.5 },
        ],
      }),
    )
    const result = await mod.backup.restoreBackup(file)
    expect(result.images).toBe(0)
    expect(await mod.db.indexedDbRepository.getImage('img_malo')).toBeUndefined()
    expect(await mod.db.indexedDbRepository.getImage('img_remoto')).toBeUndefined()
  })

  it('rechaza un punto focal fuera de rango', async () => {
    const file = fileOf(
      validPayload({
        images: [{ id: 'img_1', dataUrl: PNG_1X1, width: 1, height: 1, focalX: 5, focalY: 0.5 }],
      }),
    )
    expect((await mod.backup.restoreBackup(file)).images).toBe(0)
  })

  it('acepta una imagen legítima y la deja disponible para su platillo', async () => {
    const menu = menuFixture()
    menu.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]
    const file = fileOf(
      validPayload({
        menus: [menu],
        images: [{ id: 'img_1', dataUrl: PNG_1X1, width: 1, height: 1, focalX: 0.5, focalY: 0.5 }],
      }),
    )
    const result = await mod.backup.restoreBackup(file)
    expect(result.images).toBe(1)
    expect(await mod.db.indexedDbRepository.getImage('img_1')).toBeDefined()
  })

  it('barre una imagen del respaldo que ningún platillo usa', async () => {
    // No es un fallo: el respaldo puede traer fotos de un platillo que ya se
    // borró. Guardarlas sería acumular peso muerto para siempre.
    const file = fileOf(
      validPayload({
        images: [{ id: 'img_suelta', dataUrl: PNG_1X1, width: 1, height: 1, focalX: 0.5, focalY: 0.5 }],
      }),
    )
    await mod.backup.restoreBackup(file)
    expect(await mod.db.indexedDbRepository.getImage('img_suelta')).toBeUndefined()
  })

  it('usa los datos por defecto si los del negocio vienen corruptos', async () => {
    const file = fileOf(validPayload({ business: { name: 123 } }))
    await mod.backup.restoreBackup(file)
    expect((await mod.db.indexedDbRepository.getBusiness()).name).toBe('Comida Buffet Maranatha')
  })

  it('restaura también los datos del negocio cuando son válidos', async () => {
    const file = fileOf(validPayload())
    await mod.backup.restoreBackup(file)
    expect((await mod.db.indexedDbRepository.getBusiness()).name).toBe('Maranatha')
  })
})
