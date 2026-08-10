import { useCallback, useEffect, useRef, useState } from 'react'

export type AsyncStatus = 'idle' | 'pending' | 'success' | 'error'

/** Human-readable message for anything that can be thrown. */
export function errorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

function useIsMounted(): () => boolean {
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  return useCallback(() => mounted.current, [])
}

/** Keeps a stable ref to the newest callback so identities can stay fixed. */
function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref
}

interface AsyncActionState {
  status: AsyncStatus
  error: string | undefined
  isPending: boolean
}

/**
 * Wraps a one-shot action (save, export, delete) with the loading and error
 * state the UI has to show, so components stay free of try/catch plumbing.
 */
export function useAsyncAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
): AsyncActionState & { run: (...args: Args) => Promise<Result | undefined>; reset: () => void } {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [error, setError] = useState<string | undefined>(undefined)
  const isMounted = useIsMounted()
  const actionRef = useLatest(action)

  const run = useCallback(
    async (...args: Args) => {
      setStatus('pending')
      setError(undefined)
      try {
        const result = await actionRef.current(...args)
        if (isMounted()) setStatus('success')
        return result
      } catch (thrown) {
        console.error(thrown)
        if (isMounted()) {
          setStatus('error')
          setError(errorMessage(thrown))
        }
        return undefined
      }
    },
    [actionRef, isMounted],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(undefined)
  }, [])

  return { status, error, isPending: status === 'pending', run, reset }
}

interface AsyncDataState<T> {
  data: T | undefined
  error: string | undefined
  isLoading: boolean
  reload: () => void
}

interface Settled<T> {
  key: string
  data?: T
  error?: string
}

/**
 * Load-on-mount with refresh.
 *
 * "Loading" is derived by comparing the key of the settled result against the
 * key currently being requested, rather than flipped with a `setState` inside
 * the effect — same behaviour, no cascading render, and a stale response can
 * never overwrite a newer one.
 *
 * `deps` must be JSON-serialisable; in practice they are ids and strings.
 */
export function useAsyncData<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncDataState<T> {
  const [nonce, setNonce] = useState(0)
  const key = `${nonce}:${JSON.stringify(deps)}`
  const [settled, setSettled] = useState<Settled<T>>({ key: '' })
  const loadRef = useLatest(load)

  useEffect(() => {
    let cancelled = false
    loadRef.current().then(
      (data) => {
        if (!cancelled) setSettled({ key, data })
      },
      (thrown: unknown) => {
        if (cancelled) return
        console.error(thrown)
        setSettled({ key, error: errorMessage(thrown) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [key, loadRef])

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  return {
    data: settled.data,
    error: settled.key === key ? settled.error : undefined,
    isLoading: settled.key !== key,
    reload,
  }
}
