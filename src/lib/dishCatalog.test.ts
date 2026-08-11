import { describe, expect, it } from 'vitest'
import { ALL_SEEDS, normalise, seedsFor, sectionKind } from './dishCatalog'

/**
 * `sectionKind` ya tuvo un bug real: la palabra clave `res` (de «lomo de res»)
 * casaba como subcadena dentro de «Refrescos», así que la sección de bebidas
 * recibía sugerencias de carnes. Por eso la coincidencia es por prefijo de
 * palabra, y por eso hay tantos casos aquí.
 */

describe('normalise', () => {
  it('quita acentos, mayúsculas y espacios sobrantes', () => {
    expect(normalise('  Plátano   Frito ')).toBe('platano frito')
    expect(normalise('MARACUYÁ')).toBe('maracuya')
    expect(normalise('Té frío')).toBe('te frio')
  })

  it('deja igual dos escrituras del mismo platillo', () => {
    expect(normalise('Cordon Bleu')).toBe(normalise('cordon bleu'))
  })
})

describe('sectionKind', () => {
  it('no confunde «Refrescos» con carnes por la subcadena «res»', () => {
    // La regresión concreta que motivó el cambio a prefijo de palabra.
    expect(sectionKind({ title: 'Refrescos', priceMode: 'flat' })).toBe('refrescos')
  })

  it('reconoce las secciones de siempre', () => {
    expect(sectionKind({ title: 'Carnes', priceMode: 'per-item' })).toBe('carnes')
    expect(sectionKind({ title: 'Complementos', priceMode: 'included' })).toBe('complementos')
  })

  it('reconoce sinónimos que podrían escribir', () => {
    expect(sectionKind({ title: 'Bebidas', priceMode: 'flat' })).toBe('refrescos')
    expect(sectionKind({ title: 'Frescos naturales', priceMode: 'flat' })).toBe('refrescos')
    expect(sectionKind({ title: 'Platos fuertes', priceMode: 'per-item' })).toBe('carnes')
    expect(sectionKind({ title: 'Guarniciones', priceMode: 'included' })).toBe('complementos')
    expect(sectionKind({ title: 'Postres', priceMode: 'per-item' })).toBe('postres')
    expect(sectionKind({ title: 'Desayunos', priceMode: 'per-item' })).toBe('desayunos')
  })

  it('ignora acentos y mayúsculas en el título', () => {
    expect(sectionKind({ title: 'BEBIDAS', priceMode: 'flat' })).toBe('refrescos')
    expect(sectionKind({ title: 'Guarniciónes', priceMode: 'included' })).toBe('complementos')
  })

  it('usa el modo de precio cuando el título no dice nada', () => {
    // Sin pista en el nombre, una sección «incluida» son casi siempre acompañamientos.
    expect(sectionKind({ title: 'Extras del día', priceMode: 'included' })).toBe('complementos')
    expect(sectionKind({ title: 'Lo que sea', priceMode: 'per-item' })).toBe('otros')
  })

  it('no clasifica «Postres» como carnes pese a terminar en «res»', () => {
    expect(sectionKind({ title: 'Postres', priceMode: 'per-item' })).not.toBe('carnes')
  })

  it('sí reconoce «res» cuando es una palabra propia', () => {
    expect(sectionKind({ title: 'Res y cerdo', priceMode: 'per-item' })).toBe('carnes')
  })
})

describe('seedsFor', () => {
  it('da sugerencias del tipo pedido', () => {
    expect(seedsFor('refrescos')).toContain('Horchata')
    expect(seedsFor('carnes')).toContain('Sopa de caracol')
    expect(seedsFor('complementos')).toContain('Arroz blanco')
  })

  it('no mezcla bebidas dentro de carnes', () => {
    expect(seedsFor('carnes')).not.toContain('Horchata')
  })

  it('para una sección sin clasificar ofrece de todo', () => {
    const otros = seedsFor('otros')
    expect(otros).toContain('Horchata')
    expect(otros).toContain('Sopa de caracol')
  })

  it('el catálogo completo no tiene nombres repetidos', () => {
    const keys = ALL_SEEDS.map(normalise)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('ningún nombre del catálogo está vacío ni desbordado', () => {
    for (const name of ALL_SEEDS) {
      expect(name.trim().length).toBeGreaterThan(0)
      expect(name.length).toBeLessThanOrEqual(60)
    }
  })
})
