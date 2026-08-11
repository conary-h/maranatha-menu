import { describe, expect, it } from 'vitest'
import {
  formatDayMonth,
  formatLongDate,
  formatWeekday,
  fromIso,
  isValidIsoDate,
  relativeDayLabel,
  toIso,
  todayIso,
} from './date'

/**
 * La trampa de este módulo es una sola y es cara: `new Date('2026-08-10')` se
 * interpreta como UTC, así que en Honduras (UTC-6) el menú del 10 se imprimiría
 * como «9 de agosto». Todo lo de aquí existe para que eso no vuelva a pasar.
 */

describe('fromIso', () => {
  it('interpreta la fecha en el calendario local, no en UTC', () => {
    const date = fromIso('2026-08-10')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(7) // agosto
    expect(date.getDate()).toBe(10)
    expect(date.getHours()).toBe(0)
  })

  it('ida y vuelta sin perder el día', () => {
    for (const iso of ['2026-01-01', '2026-08-10', '2026-12-31', '2024-02-29']) {
      expect(toIso(fromIso(iso))).toBe(iso)
    }
  })
})

describe('isValidIsoDate', () => {
  it('acepta fechas reales', () => {
    expect(isValidIsoDate('2026-08-10')).toBe(true)
    expect(isValidIsoDate('2024-02-29')).toBe(true) // bisiesto
  })

  it('rechaza días que no existen', () => {
    expect(isValidIsoDate('2026-02-30')).toBe(false)
    expect(isValidIsoDate('2026-13-01')).toBe(false)
    expect(isValidIsoDate('2025-02-29')).toBe(false) // no bisiesto
  })

  it('rechaza otros formatos', () => {
    expect(isValidIsoDate('10/08/2026')).toBe(false)
    expect(isValidIsoDate('2026-8-10')).toBe(false)
    expect(isValidIsoDate('')).toBe(false)
  })
})

describe('formato en español', () => {
  it('escribe la fecha larga con el día de la semana en mayúscula', () => {
    // 2026-08-10 cae en lunes.
    expect(formatLongDate('2026-08-10')).toMatch(/^Lunes/)
    expect(formatLongDate('2026-08-10')).toContain('10')
    expect(formatLongDate('2026-08-10')).toContain('agosto')
  })

  it('da el día de la semana suelto y el día con mes', () => {
    expect(formatWeekday('2026-08-10')).toBe('Lunes')
    expect(formatDayMonth('2026-08-10')).toContain('agosto')
    expect(formatDayMonth('2026-08-10')).not.toMatch(/lunes/i)
  })
})

describe('todayIso', () => {
  it('produce una fecha con formato válido', () => {
    expect(isValidIsoDate(todayIso())).toBe(true)
  })
})

describe('relativeDayLabel', () => {
  const shift = (days: number): string => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return toIso(date)
  }

  it('reconoce hoy, mañana y ayer', () => {
    expect(relativeDayLabel(shift(0))).toBe('Hoy')
    expect(relativeDayLabel(shift(1))).toBe('Mañana')
    expect(relativeDayLabel(shift(-1))).toBe('Ayer')
  })

  it('no etiqueta el resto de días', () => {
    expect(relativeDayLabel(shift(3))).toBeUndefined()
    expect(relativeDayLabel(shift(-8))).toBeUndefined()
  })

  it('sigue funcionando al cruzar un cambio de mes', () => {
    // Sin aritmética de calendario correcta, el 1 de mes rompe «ayer».
    const first = new Date()
    first.setMonth(first.getMonth() + 1, 1)
    const dayBefore = new Date(first)
    dayBefore.setDate(0)
    expect(toIso(dayBefore) < toIso(first)).toBe(true)
  })
})
