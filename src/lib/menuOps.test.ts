import { describe, expect, it } from 'vitest'
import { createDish, createMenu, createSection, duplicateMenu } from './defaults'
import {
  addDish,
  addSection,
  allowsDescription,
  allowsFeatured,
  moveDish,
  moveItem,
  moveSection,
  removeDish,
  removeSection,
  setFeaturedDish,
  updateDish,
  updateSection,
} from './menuOps'
import type { Menu, MenuSection } from '@/types/menu'

/**
 * Las reglas que decidimos por escrito y que se han ido moviendo: qué campos
 * sobreviven a un cambio de modo de precio, quién puede ser el especial del día
 * y qué pasa al duplicar. Cada una de estas pruebas corresponde a una decisión
 * tomada durante el proyecto, no a una invención.
 */

function menuWith(section: MenuSection): Menu {
  return { ...createMenu('2026-08-10'), sections: [section] }
}

function sectionOf(menu: Menu): MenuSection {
  const section = menu.sections[0]
  if (!section) throw new Error('menú sin secciones')
  return section
}

describe('moveItem', () => {
  it('reordena moviendo un elemento a otra posición', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
  })

  it('devuelve una copia intacta ante índices imposibles', () => {
    const items = ['a', 'b', 'c']
    expect(moveItem(items, 0, 9)).toEqual(items)
    expect(moveItem(items, -1, 1)).toEqual(items)
    expect(moveItem(items, 1, 1)).toEqual(items)
  })

  it('no muta el arreglo original', () => {
    const items = ['a', 'b', 'c']
    moveItem(items, 0, 2)
    expect(items).toEqual(['a', 'b', 'c'])
  })
})

describe('permisos por modo de precio', () => {
  it('solo los platillos con precio propio pueden ser el especial del día', () => {
    expect(allowsFeatured({ priceMode: 'per-item' })).toBe(true)
    // Un complemento va incluido; un refresco cuesta lo mismo que los otros.
    expect(allowsFeatured({ priceMode: 'included' })).toBe(false)
    expect(allowsFeatured({ priceMode: 'flat' })).toBe(false)
  })

  it('los complementos no llevan descripción, los demás sí', () => {
    expect(allowsDescription({ priceMode: 'included' })).toBe(false)
    expect(allowsDescription({ priceMode: 'per-item' })).toBe(true)
    expect(allowsDescription({ priceMode: 'flat' })).toBe(true)
  })
})

describe('updateSection', () => {
  it('borra los precios al dejar de cobrar por platillo', () => {
    const section = { ...createSection('Carnes'), dishes: [createDish('Pollo al horno', 130)] }
    const next = updateSection(menuWith(section), section.id, { priceMode: 'included' })
    expect(sectionOf(next).dishes[0]?.price).toBeUndefined()
  })

  it('borra las descripciones al pasar a complementos', () => {
    const dish = { ...createDish('Arroz', 20), description: 'con vegetales' }
    const section = { ...createSection('Carnes'), dishes: [dish] }
    const next = updateSection(menuWith(section), section.id, { priceMode: 'included' })
    expect(sectionOf(next).dishes[0]?.description).toBeUndefined()
  })

  it('borra el destacado al pasar a un modo que no lo admite', () => {
    const dish = { ...createDish('Sopa', 180), featured: true }
    const section = { ...createSection('Carnes'), dishes: [dish] }

    const included = updateSection(menuWith(section), section.id, { priceMode: 'included' })
    expect(sectionOf(included).dishes[0]?.featured).toBeUndefined()

    const flat = updateSection(menuWith(section), section.id, { priceMode: 'flat' })
    expect(sectionOf(flat).dishes[0]?.featured).toBeUndefined()
  })

  it('no deja reaparecer un precio viejo al volver al modo anterior', () => {
    // Es la razón de ser de la limpieza: sin ella el precio quedaba oculto en
    // los datos y volvía a imprimirse al cambiar de opinión.
    const section = { ...createSection('Carnes'), dishes: [createDish('Pollo', 130)] }
    const menu = menuWith(section)
    const included = updateSection(menu, section.id, { priceMode: 'included' })
    const back = updateSection(included, section.id, { priceMode: 'per-item' })
    expect(sectionOf(back).dishes[0]?.price).toBeUndefined()
  })

  it('descarta el precio único al dejar de ser precio único', () => {
    const section = { ...createSection('Refrescos', 'flat'), flatPrice: 28 }
    const next = updateSection(menuWith(section), section.id, { priceMode: 'per-item' })
    expect(sectionOf(next).flatPrice).toBeUndefined()
  })

  it('conserva los precios propios al editar una sección de precio único', () => {
    // La regresión que esto vigila: la limpieza corría en cada patch, así que
    // teclear el precio de la sección borraba el de la bebida más cara.
    const section = {
      ...createSection('Refrescos', 'flat'),
      flatPrice: 28,
      dishes: [{ ...createDish('Jugo natural'), price: 40 }],
    }
    const next = updateSection(menuWith(section), section.id, { flatPrice: 30 })
    expect(sectionOf(next).dishes[0]?.price).toBe(40)
  })

  it('borra los precios propios al pasar a precio único', () => {
    // Cambiar de modo sí es pedir un precio para toda la lista.
    const section = { ...createSection('Carnes'), dishes: [createDish('Pollo', 130)] }
    const next = updateSection(menuWith(section), section.id, { priceMode: 'flat' })
    expect(sectionOf(next).dishes[0]?.price).toBeUndefined()
  })

  it('conserva el precio único mientras siga siéndolo', () => {
    const section = { ...createSection('Refrescos', 'flat'), flatPrice: 28 }
    const next = updateSection(menuWith(section), section.id, { title: 'Bebidas' })
    expect(sectionOf(next).flatPrice).toBe(28)
    expect(sectionOf(next).title).toBe('Bebidas')
  })
})

describe('setFeaturedDish', () => {
  it('solo puede haber un especial en todo el menú', () => {
    const carnes = {
      ...createSection('Carnes'),
      dishes: [{ ...createDish('Sopa', 180), featured: true }, createDish('Pollo', 130)],
    }
    const menu = menuWith(carnes)
    const second = carnes.dishes[1]!

    const next = setFeaturedDish(menu, carnes.id, second.id, true)
    const dishes = sectionOf(next).dishes
    expect(dishes.filter((dish) => dish.featured)).toHaveLength(1)
    expect(dishes[1]?.featured).toBe(true)
    expect(dishes[0]?.featured).toBeUndefined()
  })

  it('quitar el destacado desmarca el platillo', () => {
    // Nota: deja `featured: false` en vez de borrar el campo. Es inofensivo —
    // las plantillas miran el valor de verdad — pero difiere de la limpieza de
    // updateSection, que sí lo elimina. Se documenta para que nadie asuma lo
    // contrario al leer solo una de las dos.

    const carnes = {
      ...createSection('Carnes'),
      dishes: [{ ...createDish('Sopa', 180), featured: true }],
    }
    const first = carnes.dishes[0]!
    const next = setFeaturedDish(menuWith(carnes), carnes.id, first.id, false)
    expect(sectionOf(next).dishes[0]?.featured).toBe(false)
  })
})

describe('operaciones sobre platillos', () => {
  it('agrega al final, edita por id y elimina por id', () => {
    const section = createSection('Carnes')
    let menu = menuWith(section)
    const dish = createDish('Pollo', 130)

    menu = addDish(menu, section.id, dish)
    expect(sectionOf(menu).dishes).toHaveLength(1)

    menu = updateDish(menu, section.id, dish.id, { name: 'Pollo al horno' })
    expect(sectionOf(menu).dishes[0]?.name).toBe('Pollo al horno')

    menu = removeDish(menu, section.id, dish.id)
    expect(sectionOf(menu).dishes).toHaveLength(0)
  })

  it('reordena dentro de la sección', () => {
    const section = {
      ...createSection('Carnes'),
      dishes: [createDish('A', 1), createDish('B', 2), createDish('C', 3)],
    }
    const next = moveDish(menuWith(section), section.id, 0, 2)
    expect(sectionOf(next).dishes.map((dish) => dish.name)).toEqual(['B', 'C', 'A'])
  })

  it('actualiza la marca de tiempo en cada cambio', () => {
    const menu = { ...createMenu('2026-08-10'), updatedAt: 0 }
    expect(addSection(menu, createSection('Postres')).updatedAt).toBeGreaterThan(0)
  })

  it('elimina y reordena secciones', () => {
    let menu = createMenu('2026-08-10')
    const titles = () => menu.sections.map((section) => section.title)
    expect(titles()).toEqual(['Carnes', 'Complementos', 'Refrescos'])

    menu = moveSection(menu, 0, 2)
    expect(titles()).toEqual(['Complementos', 'Refrescos', 'Carnes'])

    const first = menu.sections[0]!
    menu = removeSection(menu, first.id)
    expect(titles()).toEqual(['Refrescos', 'Carnes'])
  })
})

describe('duplicateMenu', () => {
  const source = (): Menu => {
    const menu = createMenu('2026-08-10')
    const carnes = menu.sections[0]!
    carnes.dishes = [{ ...createDish('Sopa', 180), imageId: 'img_abc' }]
    return menu
  }

  it('genera identificadores nuevos para el menú, secciones y platillos', () => {
    const original = source()
    const copy = duplicateMenu(original, '2026-08-11')

    expect(copy.id).not.toBe(original.id)
    expect(copy.sections[0]?.id).not.toBe(original.sections[0]?.id)
    expect(copy.sections[0]?.dishes[0]?.id).not.toBe(original.sections[0]?.dishes[0]?.id)
  })

  it('reutiliza la misma fotografía en vez de copiarla', () => {
    // Es lo que hace que duplicar no ocupe almacenamiento extra; el recolector
    // de imágenes huérfanas depende de esta referencia compartida.
    const copy = duplicateMenu(source(), '2026-08-11')
    expect(copy.sections[0]?.dishes[0]?.imageId).toBe('img_abc')
  })

  it('toma la fecha nueva y conserva el contenido', () => {
    const copy = duplicateMenu(source(), '2026-08-11')
    expect(copy.date).toBe('2026-08-11')
    expect(copy.sections[0]?.dishes[0]?.name).toBe('Sopa')
    expect(copy.templateId).toBe(source().templateId)
  })

  it('no altera el menú original', () => {
    const original = source()
    const before = JSON.stringify(original)
    duplicateMenu(original, '2026-08-11')
    expect(JSON.stringify(original)).toBe(before)
  })
})
