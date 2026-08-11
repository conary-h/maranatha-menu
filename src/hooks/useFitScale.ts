import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Fit-to-frame for the printed menu.
 *
 * A menu with six dishes and one with twenty-four have to land on the same
 * fixed canvas. Rather than clipping or scrolling (neither of which exists in
 * an exported image), the content column is laid out at `1/k` of the width and
 * scaled back by `k` — geometrically the same as printing a poster at another
 * size, so the design never breaks, it just gets denser or airier.
 *
 * Height is *not* monotone in `k`: changing the scale changes the layout width,
 * which re-wraps the text, which changes the height again. A plain fixed-point
 * iteration can therefore oscillate and, when the pass budget runs out, leave
 * the content overflowing — which is how the last two drinks disappeared off
 * the bottom of the "Redes" design.
 *
 * So the search keeps a bracket instead: `lo` is a scale observed to fit, `hi`
 * one observed not to. Every pass narrows it, and the hook always settles on
 * `lo`. The result may be marginally smaller than the theoretical optimum, but
 * it can never clip — and silently losing a menu item is far worse than a
 * slightly smaller typeface.
 */

const MAX_PASSES = 8
/** Below this the type stops being readable, so we stop shrinking and report it. */
const MIN_SCALE = 0.42
const TOLERANCE = 0.004
/** Sub-pixel slack: `scrollHeight` rounds, so exact equality would flap. */
const HEIGHT_SLACK = 1

export interface FitOptions {
  /**
   * Cap on growth, 1 by default. Above 1 the content also *grows* to fill a
   * frame it does not fill on its own — a six-dish menu stops floating in a
   * half-empty panel and simply gets bigger, which is exactly what a template
   * built for thumbnails wants.
   */
  maxScale?: number
}

export interface Fit {
  /** Uniform scale, between MIN_SCALE and the caller's `maxScale`. */
  scale: number
  /** Real pixels of slack to push the content down by, so short menus centre. */
  offset: number
}

/** The search state, without the React bookkeeping. Exported so it can be tested. */
export interface FitSearch {
  scale: number
  offset: number
  /** Largest scale seen to fit. The search never settles above this. */
  lo: number
  /** Smallest scale seen to overflow. */
  hi: number
  pass: number
}

/** What a rendered pass measured. */
export interface FitMeasurement {
  /** Height of the frame the content has to fit into. */
  available: number
  /** Un-scaled height of the content at the current layout width. */
  natural: number
}

export function initialSearch(maxScale: number): FitSearch {
  return { scale: maxScale, offset: 0, lo: MIN_SCALE, hi: maxScale, pass: 0 }
}

/**
 * One pass of the search: given what the last render measured, decide the next
 * scale. Pure on purpose — this is the part with the interesting failure mode,
 * and a DOM-free function is the only way to test it against an adversarial
 * height model (see useFitScale.test.ts).
 *
 * `done` means the caller can stop re-rendering.
 */
export function stepFit(
  state: FitSearch,
  { available, natural }: FitMeasurement,
  maxScale: number,
): { next: FitSearch; done: boolean } {
  const rendered = state.scale * natural
  const fits = rendered <= available + HEIGHT_SLACK

  const lo = fits ? Math.max(state.lo, state.scale) : state.lo
  const hi = fits ? state.hi : Math.min(state.hi, state.scale)

  // Once the answer is settled, only the centring offset can still be stale:
  // it depends on the height measured at this very scale.
  const settled = state.pass + 1 >= MAX_PASSES || hi - lo < TOLERANCE
  // Analytic guess — the scale that would exactly fill the frame — kept inside
  // the bracket so a bad estimate can never undo what we already proved.
  const guess = Math.min(maxScale, available / natural)
  const scale = settled ? lo : Math.min(Math.max(guess, lo), hi)

  // A menu with only four dishes should sit in the middle of its panel, not
  // hang from the top with a pool of dead space underneath.
  const offset = fits ? Math.max(0, (available - rendered) / 2) : state.offset

  const stable = Math.abs(scale - state.scale) < TOLERANCE && Math.abs(offset - state.offset) < 1
  return {
    next: { scale, offset, lo, hi, pass: state.pass + 1 },
    done: stable && (settled || fits),
  }
}

interface FitState extends FitSearch {
  deps: readonly unknown[]
}

function initialState(deps: readonly unknown[], maxScale: number): FitState {
  return { deps, ...initialSearch(maxScale) }
}

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]))
}

export function useFitScale(
  frameRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[],
  options?: FitOptions,
): Fit {
  const maxScale = options?.maxScale ?? 1
  const [state, setState] = useState<FitState>(() => initialState(deps, maxScale))

  // Content changed: start the search over.
  if (!sameDeps(state.deps, deps)) setState(initialState(deps, maxScale))

  // Deliberately dependency-free: this must re-measure after every commit,
  // because the previous pass is what changes the layout it measures. Setting
  // state from a layout effect is the measure-then-adjust pattern; it is bounded
  // by MAX_PASSES.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return

    const available = frame.clientHeight
    // Transforms do not affect scrollHeight, so this is the un-scaled height at
    // the current (already re-flowed) layout width — exactly what we need.
    const natural = content.scrollHeight
    if (available === 0 || natural === 0) return

    const { next, done } = stepFit(state, { available, natural }, maxScale)
    if (done) return
    setState((current) => ({ ...current, ...next }))
  })

  return { scale: state.scale, offset: state.offset }
}

/** Style for the content column driven by {@link useFitScale}. */
export function fitStyle(fit: Fit): {
  width: string
  transform: string
  transformOrigin: string
} {
  return {
    width: `${100 / fit.scale}%`,
    // Translate first in the parent's (un-scaled) space, then scale.
    transform: `translateY(${fit.offset}px) scale(${fit.scale})`,
    transformOrigin: 'top left',
  }
}
