import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Shrink-to-fit for the printed menu.
 *
 * A menu with six dishes and one with twenty-four have to land on the same
 * fixed canvas. Rather than clipping or scrolling (neither of which exists in
 * an exported image), the content column is laid out wider by 1/k and scaled
 * back down by k — geometrically the same as printing a poster smaller, so the
 * design never breaks, it just gets denser.
 *
 * Height is not linear in k, because text re-wraps at the wider layout width,
 * so this iterates a fixed point instead of solving directly. It settles in two
 * or three passes.
 */

const MAX_PASSES = 6
/** Below this the type stops being readable, so we stop shrinking and report it. */
const MIN_SCALE = 0.42
const TOLERANCE = 0.004

export interface Fit {
  /** Uniform down-scale in (0, 1]. */
  scale: number
  /** Real pixels of slack to push the content down by, so short menus centre. */
  offset: number
}

interface FitState {
  deps: readonly unknown[]
  scale: number
  offset: number
  pass: number
}

function sameDeps(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => Object.is(value, b[index]))
}

export function useFitScale(
  frameRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  deps: readonly unknown[],
): Fit {
  const [state, setState] = useState<FitState>({ deps, scale: 1, offset: 0, pass: 0 })

  // Content changed: measure again from full size.
  if (!sameDeps(state.deps, deps)) setState({ deps, scale: 1, offset: 0, pass: 0 })

  // Deliberately dependency-free: this must re-measure after every commit,
  // because the previous pass is what changes the layout it measures. Setting
  // state from a layout effect is the measure-then-adjust pattern; it is bounded
  // by MAX_PASSES and converges long before that.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (state.pass >= MAX_PASSES) return
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return

    const available = frame.clientHeight
    // Transforms do not affect scrollHeight, so this is the un-scaled height at
    // the current (already widened) layout width — exactly what we need.
    const natural = content.scrollHeight
    if (available === 0 || natural === 0) return

    // Rendered height is `scale * natural`, so the scale that exactly fills the
    // frame is `available / natural`; re-wrapping is absorbed by the next pass.
    const next = Math.max(MIN_SCALE, Math.min(1, available / natural))
    // A menu with only four dishes should sit in the middle of its panel, not
    // hang from the top with a pool of dead space underneath.
    const offset = Math.max(0, (available - next * natural) / 2)

    if (Math.abs(next - state.scale) < TOLERANCE && Math.abs(offset - state.offset) < 1) return

    setState((current) => ({ ...current, scale: next, offset, pass: current.pass + 1 }))
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
