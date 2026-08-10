import { useCallback, useEffect, useRef, useState } from 'react'
import { indexedDbRepository } from '@/lib/db'
import { errorMessage, useAsyncData } from '@/hooks/useAsync'
import { refreshDishSuggestions } from '@/hooks/useDishSuggestions'
import type { Menu } from '@/types/menu'

export type SaveState = 'loading' | 'saved' | 'unsaved' | 'saving' | 'error'

const AUTOSAVE_DELAY_MS = 700

export interface MenuEditor {
  menu: Menu | undefined
  isLoading: boolean
  loadError: string | undefined
  saveState: SaveState
  saveError: string | undefined
  /** Apply a pure transformation; autosave follows on its own. */
  update: (transform: (menu: Menu) => Menu) => void
  /** Force an immediate write — used before navigating away or exporting. */
  saveNow: () => Promise<void>
}

/**
 * Loads a menu and keeps it saved.
 *
 * Autosave rather than an explicit save button: the people using this are
 * mid-shift on a phone, and "did I press guardar?" is exactly the question the
 * product should never make them ask. The status line still reports what is
 * happening, and a manual save exists for reassurance.
 *
 * `saveState` is derived from the data rather than tracked in its own state, so
 * it can never disagree with what is actually on disk.
 */
export function useMenuEditor(menuId: string): MenuEditor {
  const {
    data: loaded,
    isLoading,
    error: loadError,
  } = useAsyncData(() => indexedDbRepository.getMenu(menuId), [menuId])

  const [menu, setMenu] = useState<Menu | undefined>(undefined)
  /** Serialised form of what is known to be on disk. */
  const [persisted, setPersisted] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | undefined>(undefined)
  const [seed, setSeed] = useState<Menu | undefined>(undefined)

  // Seed the editable copy the first time the stored menu arrives. Adjusting
  // state during render (rather than in an effect) avoids a wasted pass.
  if (loaded && loaded !== seed) {
    setSeed(loaded)
    setMenu(loaded)
    setPersisted(JSON.stringify(loaded))
  }

  const serialised = menu ? JSON.stringify(menu) : ''
  const isDirty = menu !== undefined && serialised !== persisted

  const persist = useCallback(async (next: Menu) => {
    const nextSerialised = JSON.stringify(next)
    setIsSaving(true)
    setSaveError(undefined)
    try {
      await indexedDbRepository.saveMenu(next)
      setPersisted(nextSerialised)
      // Names typed just now should be offered as suggestions from here on.
      refreshDishSuggestions()
    } catch (thrown) {
      console.error(thrown)
      setSaveError(errorMessage(thrown, 'No se pudo guardar el menú.'))
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Debounced autosave.
  useEffect(() => {
    if (!menu || !isDirty) return
    const timer = setTimeout(() => void persist(menu), AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [menu, isDirty, persist])

  // Flush pending edits if the phone backgrounds the tab mid-typing, or if the
  // user navigates away before the debounce fires.
  const pending = useRef<Menu | undefined>(undefined)
  useEffect(() => {
    pending.current = isDirty ? menu : undefined
  }, [menu, isDirty])

  useEffect(() => {
    const flush = () => {
      const current = pending.current
      if (current) {
        pending.current = undefined
        void persist(current)
      }
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
      flush()
    }
  }, [persist])

  const update = useCallback((transform: (menu: Menu) => Menu) => {
    setMenu((current) => (current ? transform(current) : current))
  }, [])

  const saveNow = useCallback(async () => {
    const current = pending.current
    if (!current) return
    pending.current = undefined
    await persist(current)
  }, [persist])

  const saveState: SaveState = isLoading
    ? 'loading'
    : saveError
      ? 'error'
      : isSaving
        ? 'saving'
        : isDirty
          ? 'unsaved'
          : 'saved'

  return { menu, isLoading, loadError, saveState, saveError, update, saveNow }
}
