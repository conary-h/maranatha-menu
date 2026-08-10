import { useSyncExternalStore } from 'react'

/**
 * A hash router in forty lines.
 *
 * The app has four screens. A routing library would add a dependency, a bundle
 * and an upgrade treadmill for that; hash routing also means Vercel needs no
 * rewrite gymnastics and the phone's back button works out of the box.
 */

export type Route =
  | { name: 'list' }
  | { name: 'editor'; menuId: string }
  | { name: 'preview'; menuId: string }
  | { name: 'settings' }
  | { name: 'notFound' }

export const paths = {
  list: () => '#/',
  editor: (menuId: string) => `#/menu/${menuId}`,
  preview: (menuId: string) => `#/menu/${menuId}/preview`,
  settings: () => '#/negocio',
} as const

function parse(hash: string): Route {
  const segments = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (segments.length === 0) return { name: 'list' }
  if (segments[0] === 'negocio' && segments.length === 1) return { name: 'settings' }
  if (segments[0] === 'menu' && segments[1]) {
    const menuId = segments[1]
    if (segments.length === 2) return { name: 'editor', menuId }
    if (segments.length === 3 && segments[2] === 'preview') return { name: 'preview', menuId }
  }
  return { name: 'notFound' }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function navigate(path: string, options?: { replace?: boolean }): void {
  if (options?.replace) {
    window.history.replaceState(null, '', path)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = path
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => '#/',
  )
  return parse(hash)
}

/** `navigate` is a module-level function, so it is already referentially stable. */
export function useNavigate(): typeof navigate {
  return navigate
}
