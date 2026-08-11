import { describe, expect, it } from 'vitest'
import { initialSearch, stepFit, type FitSearch } from './useFitScale'

/**
 * El ajuste automático ya rompió una vez en producción: la iteración oscilaba y,
 * al agotarse los intentos, dejaba contenido fuera del marco — desaparecieron
 * los dos últimos refrescos de la plantilla «Redes».
 *
 * Estas pruebas no comprueban que la escala sea la óptima, sino la propiedad que
 * de verdad importa: **la búsqueda nunca termina en una escala que recorte.**
 */

/** Cómo cambia el alto del contenido según la escala, para un menú dado. */
type HeightModel = (scale: number) => number

/** Corre la búsqueda hasta que se detiene, como haría el navegador. */
function runSearch(
  available: number,
  height: HeightModel,
  maxScale = 1,
  maxIterations = 40,
): { final: FitSearch; iterations: number } {
  let state = initialSearch(maxScale)
  let iterations = 0
  while (iterations < maxIterations) {
    iterations += 1
    const { next, done } = stepFit(state, { available, natural: height(state.scale) }, maxScale)
    if (done) break
    state = next
  }
  return { final: state, iterations }
}

/** ¿El resultado cabe realmente, según el mismo modelo? */
function fitsUnder(state: FitSearch, available: number, height: HeightModel): boolean {
  return state.scale * height(state.scale) <= available + 1
}

describe('stepFit', () => {
  it('deja intacto un contenido que ya cabe', () => {
    // 800px de contenido en un marco de 1000: no hay nada que encoger.
    const { final } = runSearch(1000, () => 800)
    expect(final.scale).toBe(1)
  })

  it('centra verticalmente el contenido que sobra', () => {
    const { final } = runSearch(1000, () => 800)
    // 200px de holgura, la mitad arriba.
    expect(final.offset).toBeCloseTo(100, 0)
  })

  it('no desplaza nada cuando el contenido llena el marco', () => {
    const { final } = runSearch(1000, () => 1000)
    expect(final.offset).toBe(0)
  })

  it('encoge cuando el contenido no cabe, y el resultado cabe', () => {
    // Alto independiente de la escala: el caso fácil y monótono.
    const height: HeightModel = () => 2000
    const { final } = runSearch(1000, height)
    expect(final.scale).toBeLessThan(1)
    expect(fitsUnder(final, 1000, height)).toBe(true)
  })

  it('nunca devuelve una escala por encima del máximo pedido', () => {
    const { final } = runSearch(5000, () => 100, 1.25)
    expect(final.scale).toBeLessThanOrEqual(1.25)
  })

  it('crece hasta llenar el marco cuando se le permite', () => {
    // Un menú corto: 800px de contenido para 1000px de marco.
    const height: HeightModel = () => 800
    const { final } = runSearch(1000, height, 1.25)
    expect(final.scale).toBeGreaterThan(1)
    expect(fitsUnder(final, 1000, height)).toBe(true)
  })

  it('no baja del mínimo legible aunque el contenido no quepa', () => {
    // Contenido absurdamente largo: preferimos avisar a exportar letra ilegible.
    const { final } = runSearch(1000, () => 100_000)
    expect(final.scale).toBeGreaterThanOrEqual(0.42)
  })

  it('termina en una escala que cabe aunque el alto oscile', () => {
    // El caso que rompió: al encoger, la columna se ensancha, el texto se
    // reparte distinto y el alto SUBE en vez de bajar. Modelado como un salto
    // brusco alrededor de 0.8, que es lo que hace oscilar a una iteración de
    // punto fijo ingenua: la primera estimación (0.625) aterriza justo en el
    // tramo alto y la deja peor que antes.
    const height: HeightModel = (scale) => (scale > 0.8 ? 1600 : 1800)
    const { final } = runSearch(1000, height)
    expect(fitsUnder(final, 1000, height)).toBe(true)
  })

  it('toca el suelo de legibilidad cuando no existe ninguna escala que quepa', () => {
    // Aquí ni al mínimo cabe: 0.42 x 2600 sigue pasándose del marco. Lo correcto
    // no es encoger hasta lo ilegible, sino quedarse en el suelo — es lo que
    // dispara el aviso «no cabe completo» de la vista previa.
    const height: HeightModel = (scale) => (scale > 0.8 ? 1600 : 2600)
    const { final } = runSearch(1000, height)
    expect(final.scale).toBeCloseTo(0.42, 5)
    expect(fitsUnder(final, 1000, height)).toBe(false)
  })

  it('termina en una escala que cabe con un alto en escalera', () => {
    // Varias mesetas: cada re-flujo mueve el alto a otro escalón.
    const height: HeightModel = (scale) => {
      if (scale > 0.9) return 1500
      if (scale > 0.7) return 2400
      if (scale > 0.5) return 1900
      return 2800
    }
    const { final } = runSearch(1000, height)
    expect(fitsUnder(final, 1000, height)).toBe(true)
  })

  it('converge sin agotar el presupuesto de intentos', () => {
    const { iterations } = runSearch(1000, () => 2000)
    expect(iterations).toBeLessThanOrEqual(9)
  })

  it('se detiene siempre, con cualquier modelo de alto', () => {
    // Barrido amplio: ninguna combinación debe quedarse iterando ni recortar.
    for (let available = 400; available <= 2000; available += 200) {
      for (const factor of [0.5, 0.9, 1, 1.4, 2.5, 4]) {
        const height: HeightModel = (scale) => available * factor * (scale > 0.75 ? 1 : 1.35)
        const { final, iterations } = runSearch(available, height, 1.2)
        expect(iterations).toBeLessThan(40)
        // O cabe, o se tocó el suelo de legibilidad (y la app avisa).
        expect(fitsUnder(final, available, height) || final.scale <= 0.42 + 1e-9).toBe(true)
      }
    }
  })
})
