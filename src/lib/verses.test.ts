import { describe, expect, it } from 'vitest'
import { VERSES, verseOfTheDay } from './verses'
import { toIso } from './date'

/**
 * El versículo se elige por número de día a propósito: tiene que ser
 * determinista para que un menú guardado ayer siga mostrando lo mismo, y tiene
 * que recorrer la lista sin repetir hasta agotarla.
 */

const shift = (iso: string, days: number): string => {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year!, month! - 1, day! + days)
  return toIso(date)
}

describe('verseOfTheDay', () => {
  it('devuelve siempre lo mismo para la misma fecha', () => {
    const first = verseOfTheDay('2026-08-10')
    const second = verseOfTheDay('2026-08-10')
    expect(second).toEqual(first)
  })

  it('cambia de un día al siguiente', () => {
    expect(verseOfTheDay('2026-08-11').ref).not.toBe(verseOfTheDay('2026-08-10').ref)
  })

  it('no repite hasta recorrer todo el catálogo', () => {
    const seen = new Set<string>()
    let date = '2026-08-10'
    for (let i = 0; i < VERSES.length; i += 1) {
      seen.add(verseOfTheDay(date).ref)
      date = shift(date, 1)
    }
    expect(seen.size).toBe(VERSES.length)
  })

  it('vuelve al principio al agotar la lista', () => {
    const start = verseOfTheDay('2026-08-10')
    const afterFullCycle = verseOfTheDay(shift('2026-08-10', VERSES.length))
    expect(afterFullCycle).toEqual(start)
  })

  it('funciona con fechas anteriores a 1970', () => {
    // El número de día se vuelve negativo; sin normalizar el módulo, el índice
    // se saldría del arreglo.
    expect(verseOfTheDay('1965-03-04')).toBeDefined()
    expect(VERSES).toContainEqual(verseOfTheDay('1965-03-04'))
  })

  it('el desplazamiento avanza dentro del mismo catálogo', () => {
    const base = verseOfTheDay('2026-08-10')
    const next = verseOfTheDay('2026-08-10', 1)
    expect(next.ref).not.toBe(base.ref)
    expect(VERSES).toContainEqual(next)
  })

  it('un desplazamiento de una vuelta completa regresa al mismo', () => {
    expect(verseOfTheDay('2026-08-10', VERSES.length)).toEqual(verseOfTheDay('2026-08-10'))
  })

  it('acepta desplazamientos negativos sin salirse del catálogo', () => {
    expect(VERSES).toContainEqual(verseOfTheDay('2026-08-10', -1))
    expect(VERSES).toContainEqual(verseOfTheDay('2026-08-10', -500))
  })
})

describe('catálogo de versículos', () => {
  it('no tiene referencias repetidas', () => {
    const refs = VERSES.map((verse) => verse.ref)
    expect(new Set(refs).size).toBe(refs.length)
  })

  it('todos tienen referencia y texto', () => {
    for (const verse of VERSES) {
      expect(verse.ref.trim().length).toBeGreaterThan(0)
      expect(verse.text.trim().length).toBeGreaterThan(0)
    }
  })

  it('ninguno excede el límite del campo del negocio', () => {
    // Se guardan en BusinessInfo.verseText, validado a 400 caracteres.
    for (const verse of VERSES) {
      expect(verse.text.length).toBeLessThanOrEqual(400)
      expect(verse.ref.length).toBeLessThanOrEqual(60)
    }
  })
})
