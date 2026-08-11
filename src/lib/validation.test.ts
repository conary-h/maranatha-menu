import { describe, expect, it } from 'vitest'
import { createDish, createMenu, createSection } from './defaults'
import {
  countDishes,
  effectivePrice,
  formatPrice,
  isBusinessInfo,
  isMenu,
  LIMITS,
  parsePrice,
  validateDishName,
  validatePrice,
} from './validation'
import { printableSections, sectionBadge, topPricedIds } from '@/templates/shared'
import { liveFormatId, liveTemplateId, type Menu } from '@/types/menu'

/**
 * `isMenu` no es solo una comprobación de tipos: es la puerta por la que pasa el
 * contenido de un archivo de respaldo, que es entrada no confiable. Si deja
 * pasar basura, la basura acaba en la base de datos y en el menú impreso.
 */

describe('parsePrice', () => {
  it('acepta enteros y decimales, con coma o punto', () => {
    expect(parsePrice('130')).toBe(130)
    expect(parsePrice('28.50')).toBe(28.5)
    expect(parsePrice('28,50')).toBe(28.5)
  })

  it('redondea a dos decimales', () => {
    expect(parsePrice('10.999')).toBe(11)
  })

  it('rechaza lo que no es un precio', () => {
    expect(parsePrice('')).toBeUndefined()
    expect(parsePrice('abc')).toBeUndefined()
    expect(parsePrice('-5')).toBeUndefined()
    expect(parsePrice('999999999')).toBeUndefined()
  })
})

describe('validatePrice', () => {
  it('deja pasar un precio bien escrito', () => {
    expect(validatePrice('130', true)).toBeUndefined()
    expect(validatePrice('28,50', true)).toBeUndefined()
  })

  it('solo exige valor cuando es obligatorio', () => {
    expect(validatePrice('', false)).toBeUndefined()
    expect(validatePrice('', true)).toBeDefined()
  })

  it('rechaza texto, negativos y demasiados decimales', () => {
    expect(validatePrice('L. 130', false)).toBeDefined()
    expect(validatePrice('-1', false)).toBeDefined()
    expect(validatePrice('1.234', false)).toBeDefined()
  })
})

describe('validateDishName', () => {
  it('exige un nombre no vacío', () => {
    expect(validateDishName('')).toBeDefined()
    expect(validateDishName('   ')).toBeDefined()
    expect(validateDishName('Pollo')).toBeUndefined()
  })

  it('rechaza nombres más largos que el límite', () => {
    expect(validateDishName('a'.repeat(LIMITS.dishName + 1))).toBeDefined()
  })
})

describe('formatPrice', () => {
  it('omite los decimales cuando el precio es entero', () => {
    expect(formatPrice(130, 'L.')).toBe('L. 130')
  })

  it('muestra siempre dos decimales cuando los hay', () => {
    expect(formatPrice(28.5, 'L.')).toBe('L. 28.50')
  })
})

describe('effectivePrice', () => {
  it('usa el precio del platillo cuando se cobra uno a uno', () => {
    const section = createSection('Carnes', 'per-item')
    expect(effectivePrice(createDish('Pollo', 130), section)).toBe(130)
  })

  it('usa el precio de la sección cuando es precio único', () => {
    const section = { ...createSection('Refrescos', 'flat'), flatPrice: 28 }
    // El platillo no tiene precio propio y aun así debe imprimirse a 28.
    expect(effectivePrice(createDish('Pepsi'), section)).toBe(28)
  })

  it('deja que una bebida se salga del precio único', () => {
    // Hay refrescos más caros que el resto: el precio del platillo gana sobre el
    // de la sección, que sigue valiendo para todos los demás.
    const section = { ...createSection('Refrescos', 'flat'), flatPrice: 28 }
    expect(effectivePrice({ ...createDish('Jugo natural'), price: 40 }, section)).toBe(40)
  })

  it('no devuelve precio para los complementos', () => {
    const section = createSection('Complementos', 'included')
    expect(effectivePrice({ ...createDish('Arroz'), price: 99 }, section)).toBeUndefined()
  })
})

describe('sectionBadge', () => {
  it('anuncia el precio único cuando vale para toda la lista', () => {
    const section = {
      ...createSection('Refrescos', 'flat'),
      flatPrice: 28,
      dishes: [createDish('Pepsi'), createDish('Horchata')],
    }
    expect(sectionBadge(section, 'L.')).toBe('L. 28 c/u')
  })

  it('se calla en cuanto una bebida cuesta distinto', () => {
    // Un «L. 28 c/u» con un jugo de 40 en la lista sería mentira; ahí cada
    // renglón imprime su precio.
    const section = {
      ...createSection('Refrescos', 'flat'),
      flatPrice: 28,
      dishes: [createDish('Pepsi'), { ...createDish('Jugo natural'), price: 40 }],
    }
    expect(sectionBadge(section, 'L.')).toBeUndefined()
  })
})

describe('topPricedIds', () => {
  it('marca a todos los que empatan en el precio más alto', () => {
    const section = {
      ...createSection('Carnes'),
      dishes: [
        createDish('Pollo', 130),
        createDish('Lomo', 160),
        createDish('Cordon bleu', 160),
        createDish('Costilla', 130),
      ],
    }
    const top = topPricedIds(section.dishes, section)
    expect([...top]).toEqual([section.dishes[1]!.id, section.dishes[2]!.id])
  })

  it('no marca nada cuando todo cuesta lo mismo', () => {
    // Pintar de acento la lista entera no destacaría a ninguno.
    const section = {
      ...createSection('Carnes'),
      dishes: [createDish('Pollo', 130), createDish('Lomo', 130)],
    }
    expect(topPricedIds(section.dishes, section).size).toBe(0)
  })

  it('se calcula sobre lo que se imprime, no sobre la sección entera', () => {
    // El especial del día sale en su propia tarjeta; si además es el más caro,
    // el acento debe recaer en el más caro de los que quedan en la lista.
    const section = {
      ...createSection('Carnes'),
      dishes: [
        { ...createDish('Sopa de caracol', 180), featured: true },
        createDish('Lomo', 160),
        createDish('Pollo', 130),
      ],
    }
    const printed = section.dishes.slice(1)
    expect([...topPricedIds(printed, section)]).toEqual([section.dishes[1]!.id])
  })

  it('no destaca nada en los refrescos, aunque uno cueste más', () => {
    // El acento marca el platillo caro de la comida; en las bebidas el precio no
    // es un argumento de venta y señalar la más cara no aporta nada.
    const section = {
      ...createSection('Refrescos', 'flat'),
      flatPrice: 28,
      dishes: [createDish('Pepsi'), { ...createDish('Jugo natural'), price: 40 }],
    }
    expect(topPricedIds(section.dishes, section).size).toBe(0)
  })
})

describe('isMenu', () => {
  const valid = (): Menu => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('Pollo', 130)]
    return menu
  }

  it('acepta un menú recién creado', () => {
    expect(isMenu(valid())).toBe(true)
  })

  it('rechaza lo que no es un objeto', () => {
    for (const value of [null, undefined, 'menu', 42, []]) {
      expect(isMenu(value)).toBe(false)
    }
  })

  it('rechaza fechas inválidas o mal formadas', () => {
    expect(isMenu({ ...valid(), date: '10/08/2026' })).toBe(false)
    expect(isMenu({ ...valid(), date: '2026-02-31' })).toBe(false)
    expect(isMenu({ ...valid(), date: '' })).toBe(false)
  })

  it('rechaza una plantilla o un formato desconocidos', () => {
    expect(isMenu({ ...valid(), templateId: 'neón' })).toBe(false)
    expect(isMenu({ ...valid(), formatId: 'panorámico' })).toBe(false)
  })

  it('acepta las plantillas añadidas después', () => {
    // Los ids nuevos cuelgan de TEMPLATE_IDS; si alguien añade una paleta sin
    // registrarla ahí, esta prueba lo delata.
    for (const templateId of ['jade', 'marina', 'menta', 'lavanda', 'frambuesa', 'cacao']) {
      expect(isMenu({ ...valid(), templateId })).toBe(true)
    }
  })

  it('rechaza una plantilla retirada, pero se puede traducir a una viva', () => {
    // «Redes» se eliminó del catálogo. La validación ya no la acepta y
    // `liveTemplateId` es lo que impide que un menú viejo se pierda por ello.
    expect(isMenu({ ...valid(), templateId: 'social' })).toBe(false)
    expect(liveTemplateId('social')).toBe('classic')
    expect(liveTemplateId('menta')).toBe('menta')
    expect(liveTemplateId(undefined)).toBe('classic')
    expect(isMenu({ ...valid(), templateId: liveTemplateId('social') })).toBe(true)
  })

  it('rechaza un formato retirado, pero se puede traducir a uno vivo', () => {
    // Igual que las plantillas: 4:5 y 1:1 salieron del catálogo y los menús que
    // los usaban se abren en 9:16 en lugar de quedarse sin lienzo.
    expect(isMenu({ ...valid(), formatId: 'square' })).toBe(false)
    expect(liveFormatId('post')).toBe('story')
    expect(liveFormatId('square')).toBe('story')
    expect(liveFormatId('story')).toBe('story')
    expect(liveFormatId(undefined)).toBe('story')
    expect(isMenu({ ...valid(), formatId: liveFormatId('square') })).toBe(true)
  })

  it('rechaza precios absurdos', () => {
    const menu = valid()
    menu.sections[0]!.dishes = [{ ...createDish('Pollo'), price: -1 }]
    expect(isMenu(menu)).toBe(false)

    menu.sections[0]!.dishes = [{ ...createDish('Pollo'), price: Number.POSITIVE_INFINITY }]
    expect(isMenu(menu)).toBe(false)
  })

  it('rechaza textos por encima de los límites', () => {
    const menu = valid()
    menu.sections[0]!.dishes = [createDish('a'.repeat(LIMITS.dishName + 1), 10)]
    expect(isMenu(menu)).toBe(false)
  })

  it('rechaza un número de secciones o platillos fuera de rango', () => {
    const many = { ...valid(), sections: Array.from({ length: LIMITS.maxSections + 1 }, () => createSection('X')) }
    expect(isMenu(many)).toBe(false)

    const menu = valid()
    menu.sections[0]!.dishes = Array.from({ length: LIMITS.maxDishesPerSection + 1 }, () =>
      createDish('Pollo', 1),
    )
    expect(isMenu(menu)).toBe(false)
  })

  it('rechaza un modo de precio inventado', () => {
    const menu = valid()
    // @ts-expect-error entrada no confiable a propósito
    menu.sections[0]!.priceMode = 'gratis'
    expect(isMenu(menu)).toBe(false)
  })
})

describe('isBusinessInfo', () => {
  const valid = {
    name: 'Comida Buffet Maranatha',
    phone: '+504 3212-3576',
    currency: 'L.',
    verseRef: 'Efesios 1:20',
    verseText: 'texto',
    footerNote: 'nota',
  }

  it('acepta los datos completos', () => {
    expect(isBusinessInfo(valid)).toBe(true)
  })

  it('rechaza campos faltantes o demasiado largos', () => {
    expect(isBusinessInfo({ ...valid, name: undefined })).toBe(false)
    expect(isBusinessInfo({ ...valid, currency: 'x'.repeat(20) })).toBe(false)
    expect(isBusinessInfo(null)).toBe(false)
  })
})

describe('conteo y secciones visibles', () => {
  it('cuenta los platillos de todas las secciones', () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('A', 1), createDish('B', 2)]
    menu.sections[2]!.dishes = [createDish('C')]
    expect(countDishes(menu)).toBe(3)
  })

  it('oculta del menú impreso las secciones vacías', () => {
    const menu = createMenu('2026-08-10')
    menu.sections[0]!.dishes = [createDish('A', 1)]
    expect(printableSections(menu).map((section) => section.title)).toEqual(['Carnes'])
  })
})
