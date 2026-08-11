import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createDish, createMenu, DEFAULT_BUSINESS } from './defaults'
import type { StoredImage } from '@/types/menu'

/**
 * El repositorio sobre IndexedDB.
 *
 * Lo que de verdad hay que vigilar aquí es el recolector de fotografías: las
 * imágenes se comparten por referencia (por eso duplicar un menú no ocupa
 * espacio), así que ninguna es «propiedad» de un menú concreto. Si el barrido
 * se equivoca, o se borra una foto en uso o se acumulan huérfanas para siempre.
 */

/**
 * `db.ts` memoriza la conexión en una variable de módulo, así que cada prueba
 * necesita una base nueva *y* una instancia nueva del módulo. Un sufijo en la
 * ruta no sirve: Vite deja de reconocer el archivo como TypeScript.
 */
async function freshDb() {
  globalThis.indexedDB = new IDBFactory()
  vi.resetModules()
  return import('./db')
}

function imageOf(id: string): StoredImage {
  return { id, blob: new Blob(['x']), width: 10, height: 10, focalX: 0.5, focalY: 0.5 }
}

let db: Awaited<ReturnType<typeof freshDb>>

beforeEach(async () => {
  db = await freshDb()
})

describe('menús', () => {
  it('guarda y recupera un menú completo', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('Pollo al horno', 130)]

    await db.indexedDbRepository.saveMenu(menu)
    const loaded = await db.indexedDbRepository.getMenu(menu.id)

    expect(loaded?.id).toBe(menu.id)
    expect(loaded?.sections[0]?.dishes[0]?.name).toBe('Pollo al horno')
  })

  it('rechaza guardar un menú con formato inválido', async () => {
    const menu = { ...createMenu('2026-08-10'), date: 'ayer' }
    await expect(db.indexedDbRepository.saveMenu(menu)).rejects.toThrow()
  })

  it('lista los menús con el más reciente primero', async () => {
    for (const date of ['2026-08-08', '2026-08-10', '2026-08-09']) {
      await db.indexedDbRepository.saveMenu(createMenu(date))
    }
    const list = await db.indexedDbRepository.listMenus()
    expect(list.map((summary) => summary.date)).toEqual(['2026-08-10', '2026-08-09', '2026-08-08'])
  })

  it('el resumen trae el conteo de platillos de todas las secciones', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('A', 1), createDish('B', 2)]
    menu.sections[2]!.dishes = [createDish('C')]
    await db.indexedDbRepository.saveMenu(menu)

    const [summary] = await db.indexedDbRepository.listMenus()
    expect(summary?.dishCount).toBe(3)
  })

  it('elimina un menú', async () => {
    const menu = createMenu('2026-08-10')
    await db.indexedDbRepository.saveMenu(menu)
    await db.indexedDbRepository.deleteMenu(menu.id)
    expect(await db.indexedDbRepository.getMenu(menu.id)).toBeUndefined()
  })

  it('devuelve indefinido para un menú que no existe', async () => {
    expect(await db.indexedDbRepository.getMenu('m_inexistente')).toBeUndefined()
  })
})

describe('recolección de fotografías huérfanas', () => {
  it('conserva la foto mientras un menú la use', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]

    await db.indexedDbRepository.putImage(imageOf('img_1'))
    await db.indexedDbRepository.saveMenu(menu)

    expect(await db.indexedDbRepository.getImage('img_1')).toBeDefined()
  })

  it('borra la foto al dejar de estar referenciada', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]
    await db.indexedDbRepository.putImage(imageOf('img_1'))
    await db.indexedDbRepository.saveMenu(menu)

    // La quitamos del platillo y volvemos a guardar.
    menu.sections[0]!.dishes = [createDish('Sopa', 180)]
    await db.indexedDbRepository.saveMenu(menu)

    expect(await db.indexedDbRepository.getImage('img_1')).toBeUndefined()
  })

  it('no borra una foto que otro menú sigue usando', async () => {
    // Es el caso de «duplicar»: dos menús, la misma imagen.
    const first = createMenu('2026-08-10')
    first.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]
    const second = createMenu('2026-08-11')
    second.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]

    await db.indexedDbRepository.putImage(imageOf('img_1'))
    await db.indexedDbRepository.saveMenu(first)
    await db.indexedDbRepository.saveMenu(second)

    await db.indexedDbRepository.deleteMenu(first.id)

    expect(await db.indexedDbRepository.getImage('img_1')).toBeDefined()
  })

  it('borra la foto cuando desaparece el último menú que la usaba', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_1' }]
    await db.indexedDbRepository.putImage(imageOf('img_1'))
    await db.indexedDbRepository.saveMenu(menu)

    await db.indexedDbRepository.deleteMenu(menu.id)

    expect(await db.indexedDbRepository.getImage('img_1')).toBeUndefined()
  })
})

describe('datos del negocio', () => {
  it('devuelve los valores por defecto cuando no hay nada guardado', async () => {
    const info = await db.indexedDbRepository.getBusiness()
    expect(info).toEqual(DEFAULT_BUSINESS)
  })

  it('guarda y recupera los cambios', async () => {
    await db.indexedDbRepository.saveBusiness({ ...DEFAULT_BUSINESS, phone: '+504 9999-9999' })
    expect((await db.indexedDbRepository.getBusiness()).phone).toBe('+504 9999-9999')
  })

  it('completa los campos que falten en datos antiguos', async () => {
    // Un respaldo viejo puede no traer un campo añadido después.
    const partial = { ...DEFAULT_BUSINESS } as Record<string, unknown>
    delete partial.footerNote
    await db.indexedDbRepository.saveBusiness(partial as never)

    expect((await db.indexedDbRepository.getBusiness()).footerNote).toBe(DEFAULT_BUSINESS.footerNote)
  })
})

describe('collectDishNameCounts', () => {
  it('cuenta cuántas veces se ha usado cada nombre', async () => {
    const first = createMenu('2026-08-10')
    first.sections[0]!.dishes = [createDish('Pollo al horno', 130), createDish('Cordon bleu', 130)]
    const second = createMenu('2026-08-11')
    second.sections[0]!.dishes = [createDish('Pollo al horno', 130)]

    await db.indexedDbRepository.saveMenu(first)
    await db.indexedDbRepository.saveMenu(second)

    const counts = await db.collectDishNameCounts()
    expect(counts.get('pollo al horno')?.count).toBe(2)
    expect(counts.get('cordon bleu')?.count).toBe(1)
  })

  it('agrupa las variantes de escritura bajo una sola entrada', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('Maracuyá', 28), createDish('MARACUYA', 28)]
    await db.indexedDbRepository.saveMenu(menu)

    const counts = await db.collectDishNameCounts()
    expect(counts.get('maracuya')?.count).toBe(2)
  })

  it('ignora los platillos sin nombre', async () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('', 10), createDish('   ', 10)]
    await db.indexedDbRepository.saveMenu(menu)

    expect((await db.collectDishNameCounts()).size).toBe(0)
  })
})
